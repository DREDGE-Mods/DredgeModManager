use std::io::Cursor;
use std::path::PathBuf;
use std::string;
use std::{path::Path, fs};
use serde_json::Result as SerdeResult;
use crate::files;

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct ModInfo {
    #[serde(rename = "ModGUID")]
    pub mod_guid : String,

    #[serde(default)]
    pub name : String,

    #[serde(default)]
    pub author : String,

    #[serde(default)]
    pub version : String,

    #[serde(default, skip_serializing_if = "default")]
    pub local_path : String,

    #[serde(default, skip_serializing_if = "default")]
    pub local_asset_update_date : String
}

fn default<T: Default + PartialEq>(t: &T) -> bool {
    *t == Default::default()
}

pub fn load_mod_info(file : String) -> Result<ModInfo, String> {
    let mod_info_string = match fs::read_to_string(&file) {
        Ok(v) => v,
        Err(_) => return Err(format!("Couldn't find mod metadata {}", file).to_string())
    };
    let mut json = match serde_json::from_str(&mod_info_string) as SerdeResult<ModInfo> {
        Ok(v) => v,
        Err(e) => return Err(format!("Couldn't load mod metadata {} {}", file, e.to_string()).to_string())
    };

    json.local_path = file.to_string();

    // Get the latest asset upload date
    let dir = get_parent_folder(file.to_string())?;

    let asset_update_date = match fs::read_to_string(format!("{}/asset_update_date.txt", dir)) {
        Ok(v) => v,
        Err(_) => "".to_string()
    };

    json.local_asset_update_date = asset_update_date;

    Ok(json)
}

fn get_parent_folder(file_path : String) -> Result<String, String> {
    let path = Path::new(&file_path);
    if !path.is_dir() {
        let parent = match path.parent() {
            Some(v) => v,
            None => return Err(format!("Couldn't find parent directory of file {}", file_path.to_string()))
        };

        return Ok(parent.display().to_string())
    }
    return Ok(file_path)
}

pub fn uninstall_mod(mod_meta_path : String) -> () {
    // TODO: add error checking here
    
    let mod_meta = load_mod_info(mod_meta_path.clone()).unwrap();
    let dir = Path::new(&mod_meta_path).parent().unwrap();

    if mod_meta.mod_guid == "hacktix.winch" {
        // using "let _ =" allows us to ignore any errors
        let _ = fs::remove_file(format!("{}/0Harmony.dll", dir.display().to_string()));
        let _ = fs::remove_file(format!("{}/doorstop_config.ini", dir.display().to_string()));
        let _ = fs::remove_file(&mod_meta_path);

        let _ = fs::remove_file(format!("{}/Winch.dll", dir.display().to_string()));
        let _ = fs::remove_file(format!("{}/Winch.pdb", dir.display().to_string()));

        let _ = fs::remove_file(format!("{}/WinchCommon.dll", dir.display().to_string()));
        let _ = fs::remove_file(format!("{}/WinchCommon.pdb", dir.display().to_string()));

        let _ = fs::remove_file(format!("{}/WinchConsole.exe", dir.display().to_string()));
        let _ = fs::remove_file(format!("{}/WinchConsole.exe.config", dir.display().to_string()));
        let _ = fs::remove_file(format!("{}/WinchConsole.pdb", dir.display().to_string()));

        let _ = fs::remove_file(format!("{}/winhttp.dll", dir.display().to_string()));
        let _ = fs::remove_file(format!("{}/asset_update_date.txt", dir.display().to_string()));
    }
    else {
        if dir.is_dir() && dir.is_absolute() && dir.parent().unwrap().display().to_string().ends_with("Mods") {
            let path = dir.display().to_string();
            println!("Deleting folder at {}", &path);
            match fs::remove_dir_all(&path) {
                Ok(_) => (),
                Err(e) => println!("Failed to delete folder {} {}", &path, e.to_string())
            }
        }
    }
}

async fn async_install_mod(url : String) -> Result<String, Box<dyn std::error::Error>> {
    let response = reqwest::get(url).await?;
    let content = Cursor::new(response.bytes().await?);

    let dir = format!("{}/temp_download/", files::get_local_dir()?);
    
    // Clear temp folder if need be
    if Path::new(&dir).is_dir() {
        fs::remove_dir_all(&dir)?;
    }

    let dir_path = PathBuf::from(&dir);
    zip_extract::extract(content, &dir_path, true)?;

    Ok(dir)
}

fn download_mod(url : String) -> Result<String, Box<dyn std::error::Error>> {
    println!("Downloading mod from {}", &url);

    let runtime = tokio::runtime::Runtime::new()?;

    let dir = match runtime.block_on(async_install_mod(url.clone())) {
        Ok(d) => d,
        Err(e) => return Err(format!("Couldn't download mod {} - {}", &url, e).into())
    };

    Ok(dir)
}

fn copy_mod(source : String, destination : String) -> Result<(), Box<dyn std::error::Error>> {
    let src = std::path::Path::new(&source);
    let dst = std::path::Path::new(&destination);

    println!("Copied from {} to {}", &source, &destination);
    files::copy_dir_all(src, dst)?;

    Ok(())
}

pub fn install_mod(database_name : String, repo : String, download : String, asset_update_date : String, dredge_folder : String) -> Result<String, Box<dyn std::error::Error>> {
    let url = format!("https://github.com/{}/releases/latest/download/{}", repo, download).replace("//", "/");

    let temp_dir = download_mod(url)?;

    // Read the mod meta file
    let mod_meta_path = format!("{}/mod_meta.json", &temp_dir);
    let mut mod_meta: ModInfo = load_mod_info(mod_meta_path.to_string())?;

    // Ensure the name always matches what was on the database
    if mod_meta.name != database_name {
        // Save that name to the local mod_meta file
        let mod_meta_text = std::fs::read_to_string(&mod_meta_path)?;
        let current_line = format!("\"Name\": \"{}\"", &mod_meta.name);
        let updated_line = format!("\"Name\": \"{}\"", &database_name);
        let modified_mod_meta_text = mod_meta_text.replace(&current_line, &updated_line);
        std::fs::write(mod_meta_path, modified_mod_meta_text)?;

        mod_meta.name = database_name.clone();
    }

    let destination = if mod_meta.mod_guid == "hacktix.winch" {
        dredge_folder
    } 
    else { 
        format!("{}/Mods/{}", dredge_folder, mod_meta.mod_guid)
    };

    copy_mod(temp_dir, destination.to_string())?;

    // Serialize the latest update date for later
    std::fs::write(
        format!("{}/asset_update_date.txt", destination),
        asset_update_date
    )?;

    Ok(mod_meta.mod_guid)
}