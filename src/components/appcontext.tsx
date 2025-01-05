import React, {useEffect, useRef, useState} from 'react'
import {IAppState} from '../App'
import {invoke} from "@tauri-apps/api/tauri";
import {genericHandleError} from "../util/genericHandleError";
import {ModInfo} from "./modinfo";
import {open} from "@tauri-apps/api/dialog";
import {debounce} from "lodash";
import { WinchConfig } from './winchconfig';

interface IAppContextType { // see AppProvider for implementations, defaultContext for initialized defaults
    state: IAppState;
    setState: (newState: IAppState) => void
    start: () => void;
    reloadMods: () => Promise<void>;
    readFileContents: () => Promise<void>;
    uninstallMod: (modMetaPath?: string) => void;
    installMod: (modInfo: ModInfo) => void;
    installWinch: () => void;
    openModDir: (path: string) => void;
    toggleEnabledMod: (modGUID: string, isEnabled: boolean) => void;
    updateWinchConfig: () => void;
    setPageChoice: (choice: string) => void;
}

const defaultContext: IAppContextType = {
    state: {
        pathCorrect: undefined,
        dredgePath: undefined,
        winchInfo: undefined,
        winchConfig: undefined,
        availableMods: [],
        enabledMods: undefined,
        modInfos: new Map(),
        database: undefined,
        pageChoice: "Mods"
    },
    setState: () => {},
    start: () => {},
    reloadMods: async () => {},
    readFileContents: async () => {},
    uninstallMod: () => {},
    installMod: () => {},
    installWinch: () => {},
    openModDir: () => {},
    toggleEnabledMod: () => {},
    updateWinchConfig: () => {},
    setPageChoice: () => {}
};

export const AppContext = React.createContext<IAppContextType>(defaultContext)
export const AppConsumer = AppContext.Consumer

export const AppProvider = (props: React.PropsWithChildren) => {
    const isFirstRender = useRef(true);

    const [state, setState] = useState<IAppState>({
        pathCorrect: undefined,
        dredgePath: undefined,
        winchInfo: undefined,
        winchConfig : undefined,
        availableMods: [],
        enabledMods: undefined,
        modInfos: new Map(),
        database: undefined,
        pageChoice: "Mods"
    })

    const start = () => {
        invoke('start_game', {dredgePath : state.dredgePath})
            .catch(genericHandleError);
    }

    const reloadMods = async () => {
        if (state.dredgePath !== undefined && state.dredgePath.length !== 0) {
            invoke("load", {"dredgePath": state.dredgePath}).then((fetch: any) => {
                // rust response type:
                // {enabled_mods, mods, database, winch_mod_info, winch_config}:
                // struct InitialInfo {
                //     enabled_mods : HashMap<String, bool>,
                //     mods : HashMap<String, mods::ModInfo>,
                //     database: Vec<database::ModDatabaseInfo>,
                //     #[serde(serialize_with = "serialize_mod_info_option")]
                //     winch_mod_info : Option<mods::ModInfo>,
                //     #[serde(serialize_with = "serialize_winch_config_option")]
                //     winch_config : Option<winch_config::WinchConfig>
                // }

                //@ts-ignore
                fetch.database.forEach((databaseMod: ModInfo) => {
                    if (fetch.mods.hasOwnProperty(databaseMod.ModGUID)) {
                        let localMod = fetch.mods[databaseMod.ModGUID] as ModInfo;
                        localMod.Description = databaseMod.Description;
                        localMod.Downloads = databaseMod.Downloads;
                        localMod.LatestVersion = databaseMod.LatestVersion;
                        localMod.ReleaseDate = databaseMod.ReleaseDate;
                        localMod.Repo = databaseMod.Repo;
                        localMod.Download = databaseMod.Download;
                        localMod.AssetUpdateDate = databaseMod.AssetUpdateDate;
                        if (!localMod.Author) localMod.Author = databaseMod.Author;
                    }
                })

                setState({...state,
                    enabledMods: fetch.enabled_mods,
                    database: fetch.database,
                    modInfos: new Map(Object.entries(fetch.mods)),
                    availableMods: fetch.database.map((mod : ModInfo) => mod.ModGUID).filter((modGUID: string) => !fetch.mods.hasOwnProperty(modGUID)),
                    winchInfo: fetch.winch_mod_info,
                    winchConfig: fetch.winch_config,
                    pathCorrect: true
                });
            }).catch((error: { error_code : string, message : string }) => {
                // Pattern matching could be implemented with the ts-pattern library,
                // But only using it for one thing here so not going to bother
                (error.error_code === "IncorrectPath") ?
                    setState({...state,
                        pathCorrect: error.error_code != "IncorrectPath",
                    }) :
                    alert(error.message);
            });

            try{
                if (state.winchConfig == undefined) {
                    invoke("make_default_winch_config", { dredgePath : state.dredgePath }).then((winch_config) => {
                        try{
                            setState({...state, winchConfig: winch_config as WinchConfig})
                        }
                        catch (error) {
                            console.error(error);
                        }
                    }).catch();
                }
            }
            catch {
                
            }
        }
    }

    const readFileContents = async () => {
        try {
            const selectedPath = await open({
                multiple: false,
                title: "Select DREDGE game folder",
                directory: true
            });

            if (selectedPath !== null) {
                setState({...state, dredgePath: selectedPath as string});
            }
        } catch (error) {
            console.error(error);
        }
    }

    const uninstallMod = (modMetaPath?: string) => {
        if (modMetaPath !== undefined) {
            return invoke("uninstall_mod", {modMetaPath: modMetaPath})
                .then(reloadMods)
                .catch(genericHandleError);
        }
    }

    const installMod = (modInfo : ModInfo) => {
        if (modInfo.Repo !== undefined && modInfo.Download !== undefined) {
            invoke('install_mod', {
                databaseName: modInfo.Name,
                repo: modInfo.Repo,
                download: modInfo.Download,
                assetUpdateDate: modInfo.AssetUpdateDate ?? "",
                dredgeFolder: state.dredgePath})
                .then(reloadMods)
                .catch(genericHandleError);
        }
    }

    const installWinch = () => {
        if (state.winchInfo !== undefined) {
            invoke("install_winch", {dredge_path: state.dredgePath});
        }
    }

    const openModDir = (path: string) => {
        invoke("open_dir", {"path": path}).catch((e) => alert(e.toString()));
    }

    const toggleEnabledMod = (modGUID: string, isEnabled: boolean) => {
        let newEnabled = state.enabledMods;
        newEnabled![modGUID] = !isEnabled;
        setState({...state, enabledMods: newEnabled})
        invoke("toggle_enabled_mod", { "modGuid": modGUID, "enabled": !isEnabled, "dredgePath" : state.dredgePath})
            .catch(genericHandleError);
    }

    const updateWinchConfig = () => {
        if (state.winchConfig != null) {
            invoke("update_winch_config", {
                "json": JSON.stringify(state.winchConfig, null, 2),
                dredgePath: state.dredgePath})
                .then(reloadMods)
                .catch(genericHandleError);
        }
    }

    // fetch dredge path on mount
    useEffect(() => {
        invoke("load_dredge_path").then((path) => {
            setState({...state, dredgePath: path as string})
        })
    }, [])

    useEffect(() => {
        // don't try to set path when it's fetched initially
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // effect is dependent on dredgePath change specifically, so don't need to check for a change
        debouncedDredgePathChange();

    }, [state.dredgePath])

    const debouncedDredgePathChange = debounce(() => {
            if (state.dredgePath !== undefined) {
                invoke("dredge_path_changed", {"path": state.dredgePath})
                    .then(reloadMods)
                    .catch(genericHandleError);
            }
        },
        100
    );

    const setPageChoice = (choice: string) => {
        setState(prevState => ({ ...prevState, pageChoice: choice }));
    }

    return <AppContext.Provider value={{
        state,
        setState,
        start,
        reloadMods,
        readFileContents,
        uninstallMod,
        installMod,
        installWinch,
        openModDir,
        toggleEnabledMod,
        updateWinchConfig,
        setPageChoice
    }}>
        {props.children}
    </AppContext.Provider>
}