use std::io::{Write, Cursor};
use std::{path::Path, fs};
use std::fs::File;
#[path = "files.rs"] mod files;

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

    let path = format!("{}/temp_download.zip", files::get_local_dir()?);
    let mut file = File::create(path)?;
    std::io::copy(&mut content, &mut file)?;

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