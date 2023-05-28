use directories::BaseDirs;
use std::{io, fs, path::Path};

pub fn get_local_dir() -> Result<String, String> {
    let dirs = BaseDirs::new().ok_or("Could not evaluate base directory".to_string())?;
    let local_dir = dirs.data_local_dir().to_str().ok_or("Could not evaluate local directory".to_string())?;

    Ok(format!("{}/Dredge Mod Manager", local_dir.to_string()))
}

pub fn get_enabled_mods_path(dredge_path : &str) -> String {
    let mod_list_path: String = format!("{}/mod_list.json", dredge_path);

    return mod_list_path.to_string()
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