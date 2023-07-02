import "./App.scss";
import './scss/styles.scss'
import * as bootstrap from 'bootstrap'
import { open } from "@tauri-apps/api/dialog";
import {useCallback, Component} from 'react';
import { useDebouncedCallback } from "use-debounce";
// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/tauri';
import { debounce } from "lodash";

import { Sidebar, Content } from './components';
import { ModInfo, AppProvider, AppContext } from './components';


export interface IAppState extends React.PropsWithChildren{
  pathCorrect: boolean | undefined; // no clue
  dredgePath: string | undefined;
  winchInfo: ModInfo | undefined;
  availableMods: [] | undefined; // All mods in database
  enabledMods: IEnabledStruct | undefined; // All mods enabled
  modInfos: Map<string, ModInfo> | undefined; // All installed mods
  database: ModInfo[] | undefined;
  pageChoice: string | undefined; // Choice of page from sidebar
}

interface IEnabledStruct {
  [key: string]: boolean;
}

class App extends Component<{}, IAppState>
{
  static contextType = AppContext

  constructor(props: any) {
    super(props);

    this.state = {
      pathCorrect: undefined,
      dredgePath: undefined,
      winchInfo: undefined,
      availableMods: [],
      enabledMods: undefined,
      modInfos: new Map(),
      database: undefined,
      pageChoice: "Mods"
    }

    // Binding ensures that when called,
    // The context these functions use is of this component,
    // Not of wherever it's called from.

    // In order of definition:
    this.start = this.start.bind(this);
    this.reload_mods = this.reload_mods.bind(this);
    this.read_file_contents = this.read_file_contents.bind(this);
    this.uninstall_mod = this.uninstall_mod.bind(this);
    this.install_mod = this.install_mod.bind(this);
    this.install_winch = this.install_winch.bind(this);
    this.open_mod_dir = this.open_mod_dir.bind(this);
    this.toggle_enabled_mod = this.toggle_enabled_mod.bind(this);

    this.set_page_choice = this.set_page_choice.bind(this);

    this.get_state = this.get_state.bind(this);
  }

  // Functional

  // Start game
  start() {
    invoke('start_game', {dredgePath : this.state.dredgePath})
    .catch((e) => alert(e.toString()));
  }

  reload_mods = async() => {
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
            localMod.Download = databaseMod.Download;
          }
        });

        this.setState({
          enabledMods: fetch.enabled_mods,
          database: fetch.database,
          modInfos: new Map(Object.entries(fetch.mods)),
          availableMods: fetch.database.map((mod : ModInfo) => mod.ModGUID).filter((modGUID: string) => !fetch.mods.hasOwnProperty(modGUID)),
          winchInfo: fetch.winch_mod_info,
          pathCorrect: true,
        }, () => {console.log(this.state); return});

      }).catch((error: { error_code : string, message : string }) => {
        // Pattern matching could be implemented with the ts-pattern library,
        // But only using it for one thing here so not going to bother
        (error.error_code === "IncorrectPath") ?
        this.setState({
          pathCorrect: error.error_code != "IncorrectPath",
        }) :
        alert(error.message);
        return
      });
    }
    else {
      return
    }
  }

  read_file_contents = async() => {
    try {
      const selectedPath = await open({
        multiple: false,
        title: "Select DREDGE game folder",
        directory: true
      });

      if (selectedPath != null) {
        this.setState({dredgePath: selectedPath as string});
      }
    } 
    catch (err) {
      console.error(err);
    }
  }

  uninstall_mod (modMetaPath : string | undefined) {
    if (modMetaPath != undefined) {
      return invoke('uninstall_mod', {modMetaPath : modMetaPath})
      .then(this.reload_mods)
      .catch((e) => alert(e.toString()));
    }
  }

  install_mod (modInfo : ModInfo) {
    if (modInfo.Repo != undefined && modInfo.Download != undefined) {
      invoke('install_mod', {repo: modInfo.Repo, download: modInfo.Download, dredgeFolder: this.state.dredgePath})
      .then(this.reload_mods)
      .catch((e) => {
        alert(e.toString())
      });
    }
  }

  install_winch () {
    if (this.state.winchInfo != undefined) {
      invoke('install_winch', {dredge_path : this.state.dredgePath});
    }
  }

  open_mod_dir (path: string | undefined) {
    invoke('open_dir', { "path" : path }).catch((e) => alert(e.toString()));
  }

  toggle_enabled_mod (modGUID: string, isEnabled: boolean) {
    var updatedEnabled = this.state.enabledMods
    updatedEnabled![modGUID] = !isEnabled
    this.setState({enabledMods: updatedEnabled})
    invoke('toggle_enabled_mod', { "modGuid": modGUID, "enabled": !isEnabled, "dredgePath" : this.state.dredgePath})
      .catch((e) => alert(e.toString()))
  }

  
  // Inbuilt React

  // React calls this when the component initially mounts after its first render.
  // Doesn't need to be bound as it's inbuilt,
  // Would need to be bound if called by us anywhere.
  componentDidMount (): void {
    invoke('load_dredge_path').then((path) => {
      this.setState({dredgePath: path as string}, () => {
        this.reload_mods().then(() => {
          if (this.state.pathCorrect === false) {
            console.log(this.state.pathCorrect);
            console.log("settings");
            this.setState({pageChoice: "Settings"});
          }
        });
      })
    }).catch((error) => alert(error.toString()));
  }

  componentDidUpdate (prevProps: any, prevState: any): void {
    if (prevState.dredgePath != this.state.dredgePath) {
      this.debounced_dredge_path_change();
    }
  }

  // Doesn't need to be bound
  debounced_dredge_path_change = debounce(() => {
      invoke("dredge_path_changed", {"path": this.state.dredgePath})
      .then(() => {this.reload_mods()})
      .catch((error) => alert(error.toString()));
    },
    100
  )


  // Navigation

  set_page_choice(choice: string) {
    this.setState({pageChoice: choice});
  }

  
  // Context

  get_state () {
    return this.state;
  }


  render() {
    return (
      <AppProvider value={this as App}>
        <div className="app-container text-light">
          <Sidebar choice={this.state.pageChoice! as string} start={this.start} setPage={this.set_page_choice} key="Sidebar" pathCorrect={this.state.pathCorrect}/>
          <Content choice={this.state.pageChoice! as string} pathCorrect={this.state.pathCorrect} key="Content" />
        </div>
      </AppProvider>
    )
  }
}

export default App;

// TODO:
// Allow start of un-modded game via change doorstop_config.ini
// Full cleanup of code- could be significantly better quite easily
// Queue for mod installs