use serde_json::Result as SerdeResult;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ModDatabaseInfo {
    name : String,
    mod_guid : String,
    repo : String,
    download : String,

    #[serde(default)]
    about : String
}

async fn async_access_database() -> Result<Vec<ModDatabaseInfo>, Box<dyn std::error::Error>> {
    let body = reqwest::get("https://raw.githubusercontent.com/xen-42/DredgeModDatabase/database/database.json")
        .await?
        .text()
        .await?;
    
    let json: Vec<ModDatabaseInfo> = (serde_json::from_str(&body) as SerdeResult<Vec<ModDatabaseInfo>>)?;

    Ok(json)
}

pub fn access_database() -> Vec<ModDatabaseInfo> {
    let runtime = tokio::runtime::Runtime::new().unwrap();

    match runtime.block_on(async_access_database()) {
        Ok(d) => return d,
        Err(e) => {
            println!("Couldn't parse online database {}", e);
            return vec![]
        }
    };
}