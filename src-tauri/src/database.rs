use serde_json::Result as SerdeResult;

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all(serialize = "PascalCase"))]
pub struct ModDatabaseInfo {
    name : String,
    #[serde(rename(serialize = "ModGUID"))]
    mod_guid : String,
    repo : String,
    download : String,
    author: String,
    description : String,
    release_date : String,
    asset_update_date: String,
    latest_version : String,
    downloads: i16,
    readme_url: String,
    readme_raw: String
}

async fn async_access_database() -> Result<Vec<ModDatabaseInfo>, Box<dyn std::error::Error>> {
    let body = reqwest::get("https://raw.githubusercontent.com/DREDGE-Mods/DredgeModDatabase/database/database.json")
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