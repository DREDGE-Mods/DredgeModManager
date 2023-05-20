// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::process::Command;
use directories::BaseDirs;
use serde_json::Result as SerdeResult;
use serde_json::Value;

#[derive(serde::Serialize)]
struct InitialInfo {
    dredge_path : String,
    enabled_mods_json_string : String
}

#[tauri::command]
fn load() -> Result<InitialInfo, String> {
    // Check the metadata file for the path to dredge
    let file: String = format!("{}/DredgeModManager/data.txt", get_local_dir()?);
    let dredge_path = match fs::read_to_string(&file) {
        Ok(v) => v,
        // TODO: Shouldn't actually be an error because it likely just means this is the first time they run the manager
        Err(_) => return Err(format!("Couldn't load manager metadata at {}", file).to_string())
    };

    // Validate that the folder path is correct
    if !fs::metadata(format!("{}/DREDGE.exe", dredge_path)).is_ok() {
        return Err(format!("Couldn't find DREDGE.exe at {}", dredge_path));
    }

    // Load enabled/disabled mods
    let enabled_mods_path = get_enabled_mods_path(&dredge_path)?;
    let enabled_mods_json_string = match fs::read_to_string(&enabled_mods_path) {
        Ok(v) => v,
        // TODO: If the file doesn't exist we should create a new one
        Err(_) => return Err(format!("Couldn't load mod list at {}", enabled_mods_path))
    };

    Ok(InitialInfo {dredge_path, enabled_mods_json_string})
}

#[tauri::command]
fn dredge_path_changed(path: String) -> Result<(), String> {
    println!("DREDGE folder path changed to: {}", path);

    let folder: String = format!("{}\\DredgeModManager", get_local_dir()?);
    let file: String = format!("{}\\data.txt", folder);
    if !fs::metadata(&folder).is_ok() {
        fs::create_dir_all(&folder).expect("Failed to create DredgeModManager appdata directory.");
    }

    fs::write(&file, path).expect(format!("Unable to write to file {}", &file).as_str());

    println!("DREDGE folder path saved to: {}", file);

    Ok(())
}

#[tauri::command]
fn toggle_enabled_mod(mod_guid : String, enabled : bool, dredge_path : String) -> Result<(), String> {
    let enabled_mods_path = get_enabled_mods_path(&dredge_path)?;
    let file_contents = fs::read_to_string(&enabled_mods_path).expect("Mod list");
    let mut json: Value = match serde_json::from_str(&file_contents) as SerdeResult<Value> {
        Ok(v) => v,
        Err(_) => return Err("Could not load mods json".to_string())
    };

    json[mod_guid] = serde_json::Value::Bool(enabled);

    let json_string = match serde_json::to_string_pretty(&json) {
        Ok(v) => v,
        Err(_) => return Err("Could not format string to json".to_string())
    };

    fs::write(&enabled_mods_path, json_string).expect(format!("Unable to write to file {}", &enabled_mods_path).as_str());

    Ok(())
}

#[tauri::command]
fn start_game(dredge_path : String) -> () {
    let exe = format!("{}/DREDGE.exe", dredge_path);
    Command::new(exe).spawn().expect("Failed to start DREDGE.exe. Is the game directory correct?");
}

fn get_local_dir() -> Result<String, String> {
    let dirs = BaseDirs::new().ok_or("Could not evaluate base directory".to_string())?;
    let local_dir = dirs.data_local_dir().to_str().ok_or("Could not evaluate local directory".to_string())?;

    Ok(local_dir.to_string())
}

fn get_enabled_mods_path(dredge_path : &str) -> Result<String, String> {
    let mod_list_path: String = format!("{}\\mod_list.json", dredge_path);

    Ok(mod_list_path.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            dredge_path_changed,
            load,
            toggle_enabled_mod,
            start_game
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
