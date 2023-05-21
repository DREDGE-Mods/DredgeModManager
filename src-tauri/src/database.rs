use serde_json::Result as SerdeResult;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Database {
    mods : Vec<ModDatabaseInfo>
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ModDatabaseInfo {
    name : String,
    mod_guid : String,
    repo : String,

    #[serde(default)]
    about : String
}

async fn async_access_database() -> Result<Database, Box<dyn std::error::Error>> {
    let body = reqwest::get("https://raw.githubusercontent.com/xen-42/DredgeModManager/main/database.json")
        .await?
        .text()
        .await?;
    
    let json: Database = (serde_json::from_str(&body) as SerdeResult<Database>)?;

    Ok(json)
}

pub fn access_database() -> Database {
    let runtime = tokio::runtime::Runtime::new().unwrap();

    match runtime.block_on(async_access_database()) {
        Ok(d) => return d,
        Err(e) => {
            println!("Couldn't parse online database {}", e);
            return Database { mods: vec![] }
        }
    };
}