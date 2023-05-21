import "./App.css";
import './scss/styles.scss'
import * as bootstrap from 'bootstrap'
import { open } from "@tauri-apps/api/dialog";
import {useEffect, useState} from 'react';
import { useDebouncedCallback } from "use-debounce";
// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/tauri'

function App() {
  const [dredgePath, setDredgePath] = useState("");
  const [enabledMods, setEnabledMods] : any = useState({});
  const [modInfos, setModInfos] : any = useState({});
  const [database, setDatabase]  = useState<{mods : Array<any>}>({mods : []});

  const reloadMods = () => {
    if(dredgePath != null && dredgePath.length != 0) {
      invoke('load', {"dredgePath" : dredgePath}).then((res : any) => {
        setEnabledMods(res.enabled_mods);
        setModInfos(res.mods);
        setDatabase(res.database);
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
      try{
        invoke('dredge_path_changed', {"path": dredgePath});
        reloadMods();
      }
      catch (e : any) {
        alert(e.toString());
      }
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
    invoke('start_game', {dredgePath : dredgePath}).catch((e) => alert(e.toString()));
  }

  const uninstall_mod = (modMetaPath : string) => {
    invoke('uninstall_mod', {modMetaPath : modMetaPath});
    reloadMods();
  }

  const install_mod = (repo : string, download : string) => {
    invoke('install_mod', {repo: repo, download: download, dredgeFolder: dredgePath});
    reloadMods();
  }

  return (
    <body className="bg-dark text-light min-vh-100">
      <div className="h-100 w-100 container min-vh-100">
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
        <h5>Installed mods ({Object.keys(modInfos).length})</h5>
        {
          Object.keys(modInfos).map((key, _) => (
            <LocalModInfo enabled={enabledMods[key]} mod={modInfos[key]} />
          ))
        }

        <br/>
        <h5>Available mods ({database.mods.length})</h5>
        {
          database.mods.map((mod, _) => {
            return <RemoteModInfo mod={mod} />
          })
        }

      </div>
    </body>

  );

  function RemoteModInfo(props : any) {
    return(
      <div className="d-flex flex-row m-2">
        <button className="ms-2 bg-primary border-primary text-light" onClick={() => install_mod(props.mod.repo, props.mod.download)}>Install</button>
        <span className="ms-2"><b>{props.mod.mod_guid}</b> <i>from {props.mod.repo}</i></span>
      </div>
    )
  }

  function LocalModInfo(props : any) {
    const [isEnabled, setIsEnabled] = useState(props.enabled);
  
    const enabledHandler = () => {
      setIsEnabled(!isEnabled);
      invoke('toggle_enabled_mod', { "modGuid": props.mod.ModGUID, "enabled": !isEnabled, "dredgePath" : dredgePath}).catch((e) => alert(e.toString()));
    }
  
    return(
      <div className="d-flex flex-row m-2">
        <input type="checkbox" className="m-2" checked={isEnabled} onChange={enabledHandler}></input>
        {!string_null_or_empty(props.mod.DisplayName) ? 
          <span><b>{props.mod.DisplayName}</b></span> :
          <span><b>{props.mod.ModGUID}</b></span>
        }
        {!string_null_or_empty(props.mod.Description) && 
          <span> - {props.mod.Description}</span>
        }
        <span className="flex-fill"></span>
        {!string_null_or_empty(props.mod.Author) && 
          <span><i> by {props.mod.Author}</i></span>
        }
        <button className="ms-2 bg-danger border-danger text-light" onClick={() => uninstall_mod(props.mod.LocalPath)}>Uninstall</button>
      </div>
    )
  
    function string_null_or_empty(s : string) {
      return s == null || s.trim().length == 0;
    }
  }
}

export default App;
