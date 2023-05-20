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
  const [enabledMods, setEnabledMods] = useState({});

  useEffect(() => {
    // Runs at the start to get initial stuff
    invoke('get_dredge_path').then((v) => setDredgePath(v as string)).catch((e) => alert(e.toString()));
    invoke('get_enabled_mods_json_string').then((v) => setEnabledMods(JSON.parse(v as string))).catch((e) => alert(e.toString()));
  }, [])

  useEffect(() => {
    // When the state changes, if it doesn't change within a second the rust fn will be invoked
    debouncedDredgePathChanged();
  }, [dredgePath])

  const debouncedDredgePathChanged = useDebouncedCallback(
    // function
    () => {
      invoke('dredge_path_changed', { path: dredgePath }).catch((e) => alert(e.toString()));
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
    invoke('start_game').catch((e) => alert(e.toString()));
  }

  return (
    <body className="bg-dark text-light min-vh-100">
      <div className="h-100 w-100 container min-vh-100">
        <br/>
        <h1 className="text-center">Dredge Mod Manager</h1>
        <div className="text-center">
          <button className="m-2 p-2 ps-4 pe-4 bg-success text-light border-success" onClick={start}>START</button>
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

        {
          Object.keys(enabledMods).map((key, _) => (
            <WriteModInfo enabled={(enabledMods as any)[key]} modGUID={key} />
          ))
        }

      </div>
    </body>

  );
}

function WriteModInfo(props : any) {
  const [isEnabled, setIsEnabled] = useState(props.enabled);

  const enabledHandler = () => {
    setIsEnabled(!isEnabled);
    invoke('toggle_enabled_mod', { "modGuid": props.modGUID, "enabled": !isEnabled}).catch((e) => alert(e.toString()));
  }

  return(
    <div>
      <input type="checkbox" className="m-2" checked={isEnabled} onChange={enabledHandler}></input>
      <span><b>{props.modGUID}</b></span>
      {props.hasOwnProperty("description") && 
        <span> - {props.description}</span>
      }
      {props.hasOwnProperty("author") && 
        <span><i> by {props.author}</i></span>
      }
    </div>
  )

  function string_null_or_empty(s : string) {
    return s === null || s.trim() === "";
  }
}

export default App;
