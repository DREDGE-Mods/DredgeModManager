export interface ModInfo {
    // General
    Name : string,
    ModGUID : string,
  
    // Database
    Description? : string,
    ReleaseDate? : string,
    LatestVersion? : string,
    Downloads? : number
    Repo? : string,
    Download? : string,
  
    // Installed
    Author? : string,
    Version? : string,
    LocalPath? : string
  }