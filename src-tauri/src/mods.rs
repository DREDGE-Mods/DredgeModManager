use std::io::{Write, Cursor};
use std::path::PathBuf;
use std::{path::Path, fs};
use std::fs::File;
use serde_json::Result as SerdeResult;
#[path = "files.rs"] mod files;

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

async fn async_install_mod(url : String, dredge_folder : String) -> Result<(), Box<dyn std::error::Error>> {
    let response = reqwest::get(url).await?;
    let mut content = Cursor::new(response.bytes().await?);

    /*
    let path = format!("{}/temp_download.zip", files::get_local_dir()?);
    let mut file = File::create(path)?;
    std::io::copy(&mut content, &mut file)?;
    */

    let dir = format!("{}/temp_download/", files::get_local_dir()?);
    
    // Clear temp folder if need be
    if Path::new(&dir).is_dir() {
        fs::remove_dir_all(&dir)?;
    }

    let dir_path = PathBuf::from(&dir);
    zip_extract::extract(content, &dir_path, true)?;

    // Read the mod meta file
    let mod_meta_path = format!("{}/mod_meta.json", &dir);
    let mod_meta = load_mod_info(mod_meta_path)?;

    // Create destination dir
    let destination = format!("{}/Mods/{}", dredge_folder, mod_meta.mod_guid);

    let src = std::path::Path::new(&dir);
    let dst = std::path::Path::new(&destination);

    println!("Copied from {} to {}", &dir, &destination);
    files::copy_dir_all(src, dst)?;

    Ok(())
}

pub fn install_mod(repo : String, download : String, dredge_folder : String) -> () {
    let url = format!("https://github.com/{}/releases/latest/download/{}", repo, download).replace("//", "/");

    println!("Downloading mod from {}", url);

    let runtime = tokio::runtime::Runtime::new().unwrap();

    match runtime.block_on(async_install_mod(url, dredge_folder)) {
        Ok(_) => (),
        Err(e) => println!("Couldn't download mod {} - {}", download, e)
    };
}