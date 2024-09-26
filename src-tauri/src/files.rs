use directories::BaseDirs;
use std::{fs, io, path::Path};

pub fn get_local_dir() -> Result<String, String> {
    let dirs = BaseDirs::new().ok_or("Could not evaluate base directory".to_string())?;
    let local_dir = dirs.data_local_dir().to_str().ok_or("Could not evaluate local directory".to_string())?;

    Ok(format!("{}/Dredge Mod Manager", local_dir.to_string()))
}

pub fn get_enabled_mods_path(dredge_path : &str) -> String {
    let mod_list_path: String = format!("{}/mod_list.json", dredge_path);

    return mod_list_path.to_string()
}

pub fn path_exists(path: impl AsRef<Path>) -> bool {
    fs::metadata(path).is_ok()
}

pub fn remove_dir(path: impl AsRef<Path>) -> io::Result<()> {
    remove_dir_contents(&path)?;
    fs::remove_dir(path)?;
    Ok(())
}

pub fn remove_file(path: impl AsRef<Path>) -> io::Result<()> {
    fs::remove_file(path)?;
    Ok(())
}

// https://stackoverflow.com/questions/65573245/how-can-i-delete-all-the-files-in-a-directory-but-not-the-directory-itself-in-ru
pub fn remove_dir_contents(path: impl AsRef<Path>) -> io::Result<()> {
    println!("Does directory {} exist: {}", path.as_ref().display(), path_exists(&path));
    if path_exists(&path) {
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let path = entry.path();
    
            if entry.file_type()?.is_dir() {
                remove_dir_contents(&path)?;
                fs::remove_dir(path)?;
            } else {
                remove_file(path)?;
            }
        }
    }
    Ok(())
}

// https://stackoverflow.com/questions/26958489/how-to-copy-a-folder-recursively-in-rust
pub fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}