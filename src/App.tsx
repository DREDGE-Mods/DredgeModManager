import "./App.scss";
import './scss/styles.scss'
import * as bootstrap from 'bootstrap'
import { open } from "@tauri-apps/api/dialog";
import {useEffect, useState, Component} from 'react';
import { useDebouncedCallback } from "use-debounce";
// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/tauri';
import { debounce } from "lodash";

import { Sidebar, Content } from './components';
import { ModInfo } from './components';

function OldApp() {

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

  const install_winch = () => {
    if (winchInfo != undefined) {
      invoke('install_winch', {dredge_path : dredgePath});
    }
  }

  const openModDir = (path : string | undefined) => {
    if (path != undefined) {
      invoke('open_dir', { "path" : path }).catch((e) => alert(e.toString()));
    }
  }

  const set_page_choice = async(option: string) => {
    console.log(pageChoice);
    setPageChoice(option);
  }

  return (
    <div className="app-container text-light">
      <Sidebar choice={pageChoice} start={start} setPage={set_page_choice} key="Sidebar"/>
      <Content choice={pageChoice} key="Content" modsInfo={modInfos} reloadMods={reloadMods}/>
    </div>
  );

  /*
  <div className="h-100 w-100 container min-vh-100">
        <br/>
        <div className="d-flex">
          <h1>Dredge Mod Manager</h1>
          <div className="ms-auto">
            <button className="p-2 ps-4 pe-4 bg-success text-light border-success" onClick={start} disabled={!pathCorrect}>PLAY</button>
          </div>
        </div>

        <br/>
        <div className="text-start">
            Dredge folder path:
        </div>
        <div className="d-flex">
          <input type="text" className="flex-fill m-2" onChange={(e) => setDredgePath(e.target.value)} value={dredgePath}></input>
          <button className="m-2" onClick={readFileContents}>Select Folder</button>
        </div>

        <br/>

        <div className="d-flex justify-content-center">
          {
            pathCorrect ? 
            <div>
              {
                winchInfo != undefined ?
                <span>
                  <b>{winchInfo?.Name}</b> version {winchInfo?.Version} is installed.
                </span> :
                <button className="bg-success text-light mod-button" onClick={install_winch}>Install Winch</button>
              }
              <button className="ms-2 bg-secondary text-light mod-button" title="Open mod directory" onClick={() => openModDir(dredgePath)}>Open DREDGE folder</button>
            </div> 
            :
            <div className="bg-warning text-dark p-2 pe-4 ps-4 rounded">
              Fix the Dredge folder path in order to play with mods
            </div>
          }
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
      */

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

interface IAppState extends React.PropsWithChildren{
  pathCorrect: boolean | undefined;
  dredgePath: string | undefined;
  winchInfo: ModInfo | undefined;
  availableMods: [] | undefined;
  enabledMods: {} | undefined;
  modInfos: {} | undefined;
  database: ModInfo[] | undefined;
  pageChoice: string | undefined;
}

class App extends Component<{}, IAppState>
{
  constructor(props: any) {
    super(props);

    this.state = {
      pathCorrect: undefined,
      dredgePath: undefined,
      winchInfo: undefined,
      availableMods: [],
      enabledMods: undefined,
      modInfos: {},
      database: undefined,
      pageChoice: "Mods"
    }

    // Binding ensures that when called,
    // The context these functions use is of this component,
    // Not of wherever it's called from.
    this.start = this.start.bind(this);
    this.set_page_choice = this.set_page_choice.bind(this);
    this.reload_mods = this.reload_mods.bind(this);
  }

  // Start game on click
  start() {
    invoke('start_game', {dredgePath : this.state.dredgePath})
    .catch((e) => alert(e.toString()));
  }

  set_page_choice(choice: string) {
    this.setState({pageChoice: choice});
  }

  reload_mods() {
    if (this.state.dredgePath != null && this.state.dredgePath.length != 0) {

      invoke("load", {"dredgePath" : this.state.dredgePath}).then((fetch:any) => {
        fetch.database.forEach((databaseMod : ModInfo) => {

          // Populate data for local mods from the database for that mod.
          if (fetch.mods.hasOwnProperty(databaseMod.ModGUID)) {
            var localMod = fetch.mods[databaseMod.ModGUID] as ModInfo;
            localMod.Description = databaseMod.Description;
            localMod.Downloads = databaseMod.Downloads;
            localMod.LatestVersion = databaseMod.LatestVersion;
            localMod.ReleaseDate = databaseMod.ReleaseDate;
            localMod.Repo = databaseMod.Repo;
          }
        });

        this.setState({
          enabledMods: fetch.enabled_mods,
          database: fetch.database,
          modInfos: fetch.mods,
          availableMods: fetch.database.map((mod : ModInfo) => mod.ModGUID).filter((modGUID: string) => !fetch.mods.hasOwnProperty(modGUID)),
          winchInfo: fetch.winch_mod_info,
          pathCorrect: true,
        }, () => {console.log(this.state);});

      }).catch((error: {path_correct: boolean, message: string}) => {
        alert(error.message);
        this.setState({
          pathCorrect: error.path_correct,
        });
      });
    }
  }

  // React calls this when the component initially mounts after its first render.
  // Doesn't need to be bound as it's inbuilt,
  // Would need to be bound if called by us anywhere.
  componentDidMount (): void {
    invoke('load_dredge_path').then((path) => {
      this.setState({dredgePath: path as string})
    }).catch((error) => alert(error.toString()));
    this.reload_mods();
  }

  componentDidUpdate (prevProps: any, prevState: any): void {
    if (prevState.dredgePath != this.state.dredgePath) {
      this.debounced_dredge_path_change();
    }
  }

  debounced_dredge_path_change = debounce(() => {
      invoke("dredge_path_changed", {"path": this.state.dredgePath})
      .then(this.reload_mods)
      .catch((error) => alert(error.toString()));
    },
    1000
  )

  render() {
    return (
      <div className="app-container text-light">
        <Sidebar choice={this.state.pageChoice!} start={this.start} setPage={this.set_page_choice} key="Sidebar"/>
        <Content choice={this.state.pageChoice!} key="Content" modsInfo={this.state.modInfos!} reloadMods={this.reload_mods}/>
      </div>
    )
  }
}

export default App;
