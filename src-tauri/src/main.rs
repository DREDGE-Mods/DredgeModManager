// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use directories::BaseDirs;

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
fn get_dredge_path() -> Result<String, String> {
    let file: String = format!("{}/DredgeModManager/data.txt", get_local_dir()?);
    let path: String = fs::read_to_string(&file).unwrap_or(String::new());

    Ok(path)
}

#[tauri::command]
fn get_enabled_mods_json() -> Result<String, String> {
    let file = fs::read_to_string(get_enabled_mods_path()?).expect("Mod list");

    Ok(file)
}



fn get_local_dir() -> Result<String, String> {
    let dirs = BaseDirs::new().ok_or("Could not evaluate base directory".to_string())?;
    let local_dir = dirs.data_local_dir().to_str().ok_or("Could not evaluate local directory".to_string())?;

    Ok(local_dir.to_string())
}

fn get_enabled_mods_path() -> Result<String, String> {
    let dredge_path = get_dredge_path()?;
    let mod_list_path: String = format!("{}\\mod_list.json", dredge_path);

    Ok(mod_list_path.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![dredge_path_changed, get_dredge_path, get_enabled_mods_json])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
