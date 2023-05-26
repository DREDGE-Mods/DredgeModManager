// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, path::PathBuf};
use std::fs;
use std::process::Command;
use serde_json::Result as SerdeResult;
use tauri::{Manager, PhysicalSize};
mod database;
mod mods;
mod files;

#[derive(serde::Serialize)]
struct InitialInfo {
    enabled_mods : HashMap<String, bool>,
    mods : HashMap<String, mods::ModInfo>,
    database: Vec<database::ModDatabaseInfo>,
    winch_mod_info : mods::ModInfo
}

#[derive(serde::Serialize)]
struct InitialInfoError {
    path_correct : bool,
    message : String
}

#[tauri::command]
fn load_dredge_path() -> Result<String, String> {
    // Check the metadata file for the path to dredge
    let file: String = format!("{}/data.txt", files::get_local_dir()?);
    let dredge_path = match fs::read_to_string(&file) {
        Ok(v) => v,
        Err(_) => match dredge_path_changed("".to_string()) 
        {
            Ok(_) => "".to_string(),
            Err(err) => return Err(err.to_string())
        }
    };
    Ok(dredge_path)
}

#[tauri::command]
fn load(dredge_path : String) -> Result<InitialInfo, InitialInfoError> {
    // Validate that the folder path is correct
    if !fs::metadata(format!("{}/DREDGE.exe", dredge_path)).is_ok() {
        return Err(InitialInfoError { path_correct : false, message : format!("Couldn't find DREDGE.exe at [{}]", dredge_path) });
    }
    match load_path_correct(dredge_path) {
        Ok(x) => return Ok(x),
        Err(error) => return Err(InitialInfoError { path_correct : true, message : error })
    }
}

fn load_path_correct(dredge_path : String) -> Result<InitialInfo, String> {
    // Search for installed mods
    let mods_dir_path = format!("{}/Mods", dredge_path);
    if !fs::metadata(&mods_dir_path).is_ok() {
        return Err(format!("Couldn't find the Mods folder at [{}]", mods_dir_path).to_string());
    }

    // Load enabled/disabled mods
    let enabled_mods_path = files::get_enabled_mods_path(&dredge_path)?;
    let enabled_mods_json_string = match fs::read_to_string(&enabled_mods_path) {
        Ok(v) => v,
        Err(_) => return Err("{}".to_string())
    };
    let mut enabled_mods = match serde_json::from_str(&enabled_mods_json_string) as SerdeResult<HashMap<String, bool>> {
        Ok(v) => v,
        Err(_) => {
            println!("Couldn't access online database");
            HashMap::new()
        }
    };

    // Check all installed mods
    let mut mods: HashMap<String, mods::ModInfo> = HashMap::new();
    let mut update_enabled_mods_list_flag = false;
    for entry in walkdir::WalkDir::new(&mods_dir_path) {
        let entry = entry.unwrap();
        let file_path : String = entry.path().display().to_string();

        if file_path.contains("mod_meta.json") {
            println!("Found mod: {}", entry.path().display());
            let mod_info_res = mods::load_mod_info(file_path);

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
    if update_enabled_mods_list_flag {
        write_enabled_mods(enabled_mods.clone(), enabled_mods_path).expect("Guh");
    }

    if mods.len() == 0 {
        return Err(format!("Couldn't find any installed mods at [{}]", dredge_path).to_string());
    }

    let database: Vec<database::ModDatabaseInfo> = database::access_database();

    // Get Winch mod info
    let winch_mod_meta_path = format!("{}/mod_meta.json", dredge_path);
    if !fs::metadata(&winch_mod_meta_path).is_ok() {
        return Err(format!("Winch was not installed at [{}]", winch_mod_meta_path).to_string());
    }
    let winch_mod_info = mods::load_mod_info(winch_mod_meta_path)?;

    Ok(InitialInfo {enabled_mods, mods, database, winch_mod_info})
}

#[tauri::command]
fn dredge_path_changed(path: String) -> Result<(), String> {
    println!("DREDGE folder path changed to: {}", path);

    let folder: String = files::get_local_dir()?;
    let file: String = format!("{}/data.txt", folder);
    if !fs::metadata(&folder).is_ok() {
        fs::create_dir_all(&folder).expect("Failed to create DredgeModManager appdata directory.");
    }

    fs::write(&file, path).expect(format!("Unable to write to file {}", &file).as_str());

    println!("DREDGE folder path saved to: {}", file);

    Ok(())
}

#[tauri::command]
fn toggle_enabled_mod(mod_guid : String, enabled : bool, dredge_path : String) -> Result<(), String> {
    let enabled_mods_path = files::get_enabled_mods_path(&dredge_path)?;
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
fn start_game(dredge_path : String) -> Result<(), String> {
    let exe = format!("{}/DREDGE.exe", dredge_path);
    match Command::new(exe).spawn() {
        Ok(_) => return Ok(()),
        Err(_) => return Err("Failed to start DREDGE.exe. Is the game directory correct?".to_string())
    }
}

#[tauri::command]
fn uninstall_mod(mod_meta_path : String) -> () {
    mods::uninstall_mod(mod_meta_path);
}

#[tauri::command]
fn install_mod(repo : String, download : String, dredge_folder : String) -> Result<(), String> {
    match mods::install_mod(repo, download, dredge_folder) {
        Ok(_) => return Ok(()),
        Err(error) => return Err(format!("Failed to install mod {}", error.to_string()))
    }
}

#[tauri::command]
fn open_dir(path : String) -> Result<(), String> {
    let mut path_buf: PathBuf = PathBuf::from(path);

    if !path_buf.is_dir() {
        path_buf.pop();
    }

    let dir: String = path_buf.display().to_string();

    match open::that(dir) {
        Ok(_) => return Ok(()),
        Err(error) => return Err(format!("Couldn't open directory {}", error))
    }
}

#[tauri::command]
fn install_winch(dredge_path : String) -> Result<(), String> {
    match mods::install_winch(dredge_path) {
        Ok(_) => return Ok(()),
        Err(error) => return Err(format!("Couldn't install Winch {}", error))
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            dredge_path_changed,
            load_dredge_path,
            load,
            toggle_enabled_mod,
            start_game,
            uninstall_mod,
            install_mod,
            install_winch,
            open_dir
            ])
        .setup(|app| {
                let main_window: tauri::Window = app.get_window("main").unwrap();
                main_window.set_min_size(Some(tauri::Size::Physical(PhysicalSize {width: 640, height: 480}))).unwrap();
                Ok(())
            })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
