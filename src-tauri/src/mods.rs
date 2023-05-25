use std::io::Cursor;
use std::path::PathBuf;
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

    #[serde(default)]
    pub local_path : String,
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
    json.local_path = file;

    Ok(json)
}

pub fn uninstall_mod(mod_meta_path : String) -> () {
    let dir = Path::new(&mod_meta_path).parent().unwrap();
    if dir.is_dir() && dir.is_absolute() && dir.parent().unwrap().display().to_string().ends_with("Mods") {
        let path = dir.display().to_string();
        println!("Deleting folder at {}", &path);
        match fs::remove_dir_all(&path) {
            Ok(_) => (),
            Err(e) => println!("Failed to delete folder {} {}", &path, e.to_string())
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

pub fn install_mod(repo : String, download : String, dredge_folder : String) -> Result<(), Box<dyn std::error::Error>> {
    let url = format!("https://github.com/{}/releases/latest/download/{}", repo, download).replace("//", "/");

    let temp_dir = download_mod(url)?;

    // Read the mod meta file
    let mod_meta_path = format!("{}/mod_meta.json", &temp_dir);
    let mod_meta = load_mod_info(mod_meta_path)?;

    // Create destination dir
    let destination = format!("{}/Mods/{}", dredge_folder, mod_meta.mod_guid);

    copy_mod(temp_dir, destination)?;

    Ok(())
}

pub fn install_winch(dredge_folder : String) -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://github.com/Hacktix/Winch/releases/latest/download/Winch.zip".to_string();

    let temp_dir = download_mod(url)?;

    copy_mod(temp_dir, dredge_folder)?;

    Ok(())
}