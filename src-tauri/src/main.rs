// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use directories::BaseDirs;

#[tauri::command]
fn dredge_path_changed(path: String) -> Result<(), String> {
    println!("DREDGE folder path changed to: {}", path);

    let dirs = BaseDirs::new().ok_or("Could not evaluate paths".to_string())?;
    let local_dir : &str = dirs.data_local_dir().to_str().unwrap();
    let folder: String = format!("{}\\DredgeModManager", local_dir);
    let file: String = format!("{}\\data.txt", folder);
    if !fs::metadata(&folder).is_ok() {
        fs::create_dir_all(&folder).expect("I have no mouth and I must scream");
    }

    fs::write(&file, path).expect(format!("Unable to write to file {}", &file).as_str());

    println!("DREDGE folder path saved to: {}", file);

    Ok(())
}

#[tauri::command]
fn get_dredge_path() -> Result<String, String> {
    let dirs = BaseDirs::new().ok_or("Could not evaluate paths".to_string())?;
    let local_dir : &str = dirs.data_local_dir().to_str().unwrap();
    let file: String = format!("{}/DredgeModManager/data.txt", local_dir);
    let path: String = fs::read_to_string(&file).unwrap_or(String::new());

    Ok(path)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![dredge_path_changed, get_dredge_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
