use directories::BaseDirs;

pub fn get_local_dir() -> Result<String, String> {
    let dirs = BaseDirs::new().ok_or("Could not evaluate base directory".to_string())?;
    let local_dir = dirs.data_local_dir().to_str().ok_or("Could not evaluate local directory".to_string())?;

    Ok(format!("{}/DredgeModManager", local_dir.to_string()))
}

pub fn get_enabled_mods_path(dredge_path : &str) -> Result<String, String> {
    let mod_list_path: String = format!("{}/mod_list.json", dredge_path);

    Ok(mod_list_path.to_string())
}