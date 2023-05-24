import "./App.css";
import './scss/styles.scss'
import * as bootstrap from 'bootstrap'
import { open } from "@tauri-apps/api/dialog";
import {useEffect, useState} from 'react';
import { useDebouncedCallback } from "use-debounce";
// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/tauri'

interface ModInfo {
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

function App() {
  const [dredgePath, setDredgePath] = useState("");
  const [winchInfo, setWinchInfo] = useState<ModInfo>();
  const [enabledMods, setEnabledMods] : any = useState({});
  const [modInfos, setModInfos] : any = useState({});
  const [database, setDatabase] = useState<Array<ModInfo>>([]);
  const [availableMods, setAvailableMods] = useState<[]>([]);

  const reloadMods = () => {
    if(dredgePath != null && dredgePath.length != 0) {
      invoke('load', {"dredgePath" : dredgePath}).then((res : any) => {
        setEnabledMods(res.enabled_mods);
        setDatabase(res.database);

        // Get the DB data for all the local mods if possible
        res.database.forEach((databaseMod : ModInfo) => {
          if (res.mods.hasOwnProperty(databaseMod.ModGUID)) {
            var localMod = res.mods[databaseMod.ModGUID] as ModInfo;
            localMod.Description = databaseMod.Description;
            localMod.Downloads = databaseMod.Downloads;
            localMod.LatestVersion = databaseMod.LatestVersion;
            localMod.ReleaseDate = databaseMod.ReleaseDate;
            localMod.Repo = databaseMod.Repo;
          }
        })

        setModInfos(res.mods);

        setAvailableMods(res.database.map((x : ModInfo) => x.ModGUID).filter((x : string) => !res.mods.hasOwnProperty(x)));
        setWinchInfo(res.winch_mod_info);
      }).catch((e) => {
        alert(e.toString());
        setEnabledMods({});
      });
    }
  }

  useEffect(() => {
    // Runs at the start to get initial stuff
    invoke('load_dredge_path').then((v) => {
      setDredgePath(v as string);
      reloadMods();
    }).catch((e) => alert(e.toString()));
  }, [])

  useEffect(() => {
    // When the state changes, if it doesn't change within a second the rust fn will be invoked
    debouncedDredgePathChanged();
  }, [dredgePath])

  const debouncedDredgePathChanged = useDebouncedCallback(
    // function
    () => {
      invoke('dredge_path_changed', {"path": dredgePath})
      .then(reloadMods)
      .catch((e) => alert(e.toString()));
    },
    // delay in ms
    1000
  );

  const readFileContents = async () => {
    try {
      const selectedPath = await open({
        multiple: false,
        title: "Select DREDGE game folder",
        directory: true
      });
      setDredgePath(selectedPath as string);
    } catch (err) {
      console.error(err);
    }
  };

  const start = () => {
    invoke('start_game', {dredgePath : dredgePath})
    .catch((e) => alert(e.toString()));
  }

  const uninstall_mod = (modMetaPath : string | undefined) => {
    if (modMetaPath != undefined) {
      invoke('uninstall_mod', {modMetaPath : modMetaPath})
      .then(reloadMods)
      .catch((e) => alert(e.toString()));
    }
  }

  const install_mod = (modInfo : ModInfo) => {
    if (modInfo.Repo != undefined && modInfo.Download != undefined) {
      invoke('install_mod', {repo: modInfo.Repo, download: modInfo.Download, dredgeFolder: dredgePath})
      .then(reloadMods)
      .catch((e) => alert(e.toString()));
    }
  }

  return (
    <div className="bg-dark text-light min-h-100 min-w-100">
      <div className="container h-100 d-flex flex-column">
        <br/>
        <div className="d-flex">
          <h1>Dredge Mod Manager</h1>
          <div className="ms-auto">
            <button className="p-2 ps-4 pe-4 bg-success text-light border-success" onClick={start}>PLAY</button>
          </div>
        </div>

        <br/>
        <div className="text-start">
            Dredge folder path:
        </div>
        <div className="d-flex">
          <input type="text" className="flex-fill m-2" onChange={(e) => setDredgePath(e.target.value)} value={dredgePath}></input>
          <button className="m-2" onClick={readFileContents}>...</button>
        </div>

        <br/>

        <div>
          <b>{winchInfo?.Name}</b> version {winchInfo?.Version} is installed.
        </div>

        <br/>
        <div className="flex-fill">
          {Object.keys(modInfos).length > 0 && InstalledMods()}

          <br/>
          {availableMods.length > 0 && AvailableMods()}

          <br/>
        </div>

      </div>
    </div>

  );

  function InstalledMods() {
    return(
      <div>
        <h5>Installed mods ({Object.keys(modInfos).length})</h5>
        {
          Object.keys(modInfos).map((key, _) => (
            <LocalModInfo enabled={enabledMods[key]} mod={modInfos[key]} />
          ))
        }
      </div>
    )
  }

  function AvailableMods() {
    return(
      <div>
        <h5>Available mods ({availableMods.length})</h5>
        <div>
          {
            database.map((mod, _) => {
              // Don't give the player the option to download mods they already have
              if (!modInfos.hasOwnProperty(mod.ModGUID)) {
                return <RemoteModInfo mod={mod} />
              }
            })
          }
        </div>
      </div>
    )
  }

  function GenericModInfo(props : { mod : ModInfo }) {
    return(
      <div className="ms-4 me-4 flex-fill">
        <div className="d-flex w-100">
          <div className="me-4"><b>{string_null_or_empty(props.mod.Name) ? props.mod.ModGUID : props.mod.Name}</b> {props.mod.LatestVersion}</div>
          
          { string_null_or_empty(props.mod.Author) ?
            <span><i> from {props.mod.Repo}</i></span> :
            <span><i> by {props.mod.Author}</i></span>
          }
        </div>
        <div>
          {props.mod.Description} 
        </div>
        <div>
          { props.mod.Downloads != undefined &&
            <span>{props.mod.Downloads} downloads</span>
          }
        </div>
      </div>
    )
  }

  function RemoteModInfo(props : { mod : ModInfo }) {
    return(
      <div>
        <div className="d-flex flex-row m-2">
          <button className="ms-2 bg-primary border-primary text-light mod-button" onClick={() => install_mod(props.mod)}>Install</button>
          <GenericModInfo mod = {props.mod}/>
        </div>
      </div>
    )
  }

  function LocalModInfo(props : { mod : ModInfo, enabled : boolean }) {
    const [isEnabled, setIsEnabled] = useState(props.enabled);

    const enabledHandler = () => {
      setIsEnabled(!isEnabled);
      invoke('toggle_enabled_mod', { "modGuid": props.mod.ModGUID, "enabled": !isEnabled, "dredgePath" : dredgePath})
      .catch((e) => alert(e.toString()));
    }

    const openModDir = (path : string | undefined) => {
      if (path != undefined) {
        invoke('open_dir', { "path" : path }).catch((e) => alert(e.toString()));
      }
    }
  
    return(
      <div className="d-flex flex-row m-2">
        <input type="checkbox" className="m-2" checked={isEnabled} onChange={enabledHandler}></input>

        <GenericModInfo mod = {props.mod}/>

        {!string_null_or_empty(props.mod.Repo) && 
          <button className="ms-2 update mod-button text-light" 
            onClick={() => install_mod(props.mod)} 
            disabled={props.mod.Version?.trim() == props.mod.LatestVersion?.trim()}
            title={"Latest version " + props.mod.LatestVersion}
            >
            Update
          </button>
        }

        <button className="ms-2 bg-secondary text-light mod-button" title="Open mod directory" onClick={() => openModDir(props.mod.LocalPath)}>...</button>

        <button className="ms-2 bg-danger border-danger text-light mod-button" onClick={() => uninstall_mod(props.mod.LocalPath)}>Uninstall</button>
      </div>
    )
  }

  function string_null_or_empty(s : string | undefined) {
    return s == undefined || s == null || s.trim().length == 0;
  }
}

export default App;
