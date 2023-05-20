// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::clone;
use std::collections::HashMap;
use std::fs;
use std::process::Command;
use directories::BaseDirs;
use serde_json::Result as SerdeResult;
use serde_json::Value;

#[derive(serde::Serialize)]
struct InitialInfo {
    enabled_mods : HashMap<String, bool>,
    mods : HashMap<String, ModInfo>
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct ModInfo {
    #[serde(rename = "ModGUID")]
    mod_guid : String,

    #[serde(default)]
    display_name : String,

    #[serde(default)]
    author : String
}

fn load_mod_info(file : String) -> Result<ModInfo, String> {
    let mod_info_string = match fs::read_to_string(&file) {
        Ok(v) => v,
        Err(_) => return Err(format!("Couldn't find mod metadata {}", file).to_string())
    };
    let json = match serde_json::from_str(&mod_info_string) as SerdeResult<ModInfo> {
        Ok(v) => v,
        Err(e) => return Err(format!("Couldn't load mod metadata {} {}", file, e.to_string()).to_string())
    };
    Ok(json)
}

#[tauri::command]
fn load_dredge_path() -> Result<String, String> {
    // Check the metadata file for the path to dredge
    let file: String = format!("{}/DredgeModManager/data.txt", get_local_dir()?);
    let dredge_path = match fs::read_to_string(&file) {
        Ok(v) => v,
        // TODO: Shouldn't actually be an error because it likely just means this is the first time they run the manager
        Err(_) => return Err(format!("Couldn't load manager metadata at {}", file).to_string())
    };
    Ok(dredge_path)
}

#[tauri::command]
fn load(dredge_path : String) -> Result<InitialInfo, String> {
    // Validate that the folder path is correct
    if !fs::metadata(format!("{}/DREDGE.exe", dredge_path)).is_ok() {
        return Err(format!("Couldn't find DREDGE.exe at [{}]", dredge_path));
    }

    // Search for installed mods
    let mods_dir_path = format!("{}/Mods", dredge_path);
    if !fs::metadata(&mods_dir_path).is_ok() {
        return Err(format!("Couldn't find the Mods folder at [{}]", mods_dir_path).to_string());
    }

    // Load enabled/disabled mods
    let enabled_mods_path = get_enabled_mods_path(&dredge_path)?;
    let enabled_mods_json_string = match fs::read_to_string(&enabled_mods_path) {
        Ok(v) => v,
        Err(_) => "{}".to_string()
    };
    let mut enabled_mods = match serde_json::from_str(&enabled_mods_json_string) as SerdeResult<HashMap<String, bool>> {
        Ok(v) => v,
        Err(_) => HashMap::new()
    };

    // Check all installed mods
    let mut mods: HashMap<String, ModInfo> = HashMap::new();
    let mut update_enabled_mods_list_flag = false;
    for entry in walkdir::WalkDir::new(&mods_dir_path) {
        let entry = entry.unwrap();
        let file_path : String = entry.path().display().to_string();

        if file_path.contains("mod_meta.json") {
            println!("Found mod: {}", entry.path().display());
            let mod_info_res = load_mod_info(file_path);

            match mod_info_res {
                Ok(mod_info) => {
                    let key = mod_info.mod_guid.clone();
                    mods.insert(key.clone(), mod_info);
                    // Check that the mod is included in the file
                    if !enabled_mods.contains_key(&key) {
                        enabled_mods.insert(key, true);
                        update_enabled_mods_list_flag = true;
                    }
                },
                Err(e) => println!("{}", e)
            }
        }
    }
    if (update_enabled_mods_list_flag) {
        write_enabled_mods(enabled_mods.clone(), enabled_mods_path).expect("Guh");
    }

    if mods.len() == 0 {
        return Err(format!("Couldn't find any installed mods at [{}]", dredge_path).to_string());
    }

    Ok(InitialInfo {enabled_mods, mods})
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
    let mut json = match serde_json::from_str(&file_contents) as SerdeResult<HashMap<String, bool>> {
        Ok(v) => v,
        Err(_) => return Err("Could not load mods json".to_string())
    };

    json.insert(mod_guid, enabled);

    match write_enabled_mods(json, enabled_mods_path) {
        Ok(()) => (),
        Err(_) => return Err("Could not update mods json".to_string())
    };

    Ok(())
}

fn write_enabled_mods(json : HashMap<String, bool>, enabled_mods_path : String) -> Result<(), String> {
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
            load_dredge_path,
            load,
            toggle_enabled_mod,
            start_game
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
