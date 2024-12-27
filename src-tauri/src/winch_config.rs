use std::fs;
use serde_json::Result as SerdeResult;

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all(serialize = "UPPERCASE"))]
#[derive(Default)]
pub enum LogLevel {
    UNITY,
    DEBUG,
    #[default]
    INFO,
    WARN,
    ERROR
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct WinchConfig {
    #[serde(default)]
    pub write_logs_to_file : bool,

    #[serde(default)]
    pub write_logs_to_console : bool,

    #[serde(default)]
    pub logs_folder : String,

    #[serde(default)]
    pub log_level : LogLevel,

    #[serde(default)]
    pub detailed_log_sources : bool,

    #[serde(default)]
    pub enable_developer_console : bool,

    #[serde(default)]
    pub max_log_files : i32,

    #[serde(default)]
    pub log_port : String,

    #[serde(default)]
    pub run_exe : bool
}

pub fn load_winch_config(dredge_folder : String) -> Result<WinchConfig, String> {
    let file = format!("{}/WinchConfig.json", dredge_folder);
    let winch_config_string = match fs::read_to_string(&file) {
        Ok(v) => v,
        Err(_) => return Err(format!("Couldn't find WinchConfig at {}", file).to_string())
    };
    let json = match serde_json::from_str(&winch_config_string) as SerdeResult<WinchConfig> {
        Ok(v) => v,
        Err(e) => return Err(format!("Couldn't load mod WinchConfig at {} - {}", file, e.to_string()).to_string())
    };

    Ok(json)
}

pub fn write_winch_config(json : String, dredge_folder : String) -> Result<(), String> {
    let file = format!("{}/WinchConfig.json", dredge_folder);
    match fs::write(file.to_string(), json.to_string()) {
        Ok(_) => return Ok(()),
        Err(_) => return Err(format!("Couldn't save WinchConfig at {} with settings {}", file, json).to_string())
    };
}