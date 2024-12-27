import React, {useContext, useEffect, useState} from 'react'

import '../../scss/settings.scss'
import { AppContext } from '../appcontext'
import {debounce} from 'lodash';

import { getVersion } from '@tauri-apps/api/app';
import {BooleanConfig} from "./BooleanConfig";

const appVersion = await getVersion();


export const Settings = (props: {path_correct?: boolean}) => {

    const context = useContext(AppContext);

    const [shouldCheckWinchConfig, setshouldCheckWinchConfig] = useState(true);
    const [path, setPath] = useState("");

    // Opening the settings tab will try reloading everything: Checks if winch config has been setup by the modloader yet
    useEffect(() => {
        if (context.state.winchConfig == null && shouldCheckWinchConfig) {
            context?.reloadMods()
        }
        setshouldCheckWinchConfig(false);
    });

    // Fetch DREDGE path from context; only called once on load
    useEffect(() => {
        if (path === "") {
            updatePathFromContext();
        }
        debouncedUpdatePathFromContext();
    }, [])

    useEffect(() => {
        debouncedUpdateContextPath();
    }, [path])

    const updatePathFromContext = () => {
        setPath(context!.state.dredgePath!);
    }

    const updateContextPath = () => {
        if (path !== undefined && path !== "") {
            context!.setState({...context.state, dredgePath: path});
        }
    }

    // THIS CAN CAUSE PROBLEMS
    // if this is greater than ~200ms? if the user goes between pages as mods -> settings -> mods within that 200ms,
    // this will cause it to be set back to the settings page
    // presumably due to setState calling with an outdated context.state.pageChoice
    const debouncedUpdateContextPath = debounce(updateContextPath, 50);

    const debouncedUpdatePathFromContext = debounce(updatePathFromContext,  100);

    const handleDredgePath = async () => {
        await context?.readFileContents();
        updatePathFromContext();
    }

    const onConfigUpdate = (label: string, value: any) => {
        // "Unsafe but oh well"

        // @ts-ignore: typescript here is just annoying https://stackoverflow.com/questions/57086672
        context!.state.winchConfig![label] = value;

        context?.updateWinchConfig()
    }

    const pathWarning = props.path_correct ? "" : <div className="error">Invalid DREDGE path</div>

    const dredgeFolderButton = !props.path_correct ? "" : <>
        <div className="d-flex w-100 justify-content-end">
            <button className="button icon-folder" onClick={() => context!.openModDir(path)}>
                <i className="fa fa-sharp">&#xf07b;</i> Open DREDGE folder
            </button>
        </div>
    </>

    const config = context!.state.winchConfig;

    const configOptions = <div className={"w-100 flex-column"}>
        <h5 className="d-flex justify-content-center">
            Winch Modloader Settings
        </h5>
        <div className={"w-100 flex-column"}>
            <BooleanConfig id={"EnableDeveloperConsole"}
                        label={"Enable In-Game Developer Console"}
                        checked={config?.EnableDeveloperConsole ?? false}
                        onUpdate={onConfigUpdate} />
            <BooleanConfig id={"DetailedLogSources"}
                        label={"Use detailed log sources"}
                        checked={config?.DetailedLogSources ?? false}
                        onUpdate={onConfigUpdate} />
            <BooleanConfig id={"WriteLogsToFile"}
                        label={"Write logs to file"}
                        checked={config?.WriteLogsToFile ?? false}
                        onUpdate={onConfigUpdate} />
            <BooleanConfig id={"WriteLogsToConsole"}
                        label={"Write logs to console"}
                        checked={config?.WriteLogsToConsole ?? false}
                        onUpdate={onConfigUpdate} />
            <BooleanConfig id={"RunExe"}
                        label={"Run the exe directly (instead of launching through Steam/Epic)"}
                        checked={config?.RunExe ?? false}
                        onUpdate={onConfigUpdate} />
        </div>
    </div>

    return <div className="settings-container">
        <div className="setting d-flex h-100">
            <h5>
                DREDGE Install Location
            </h5>
            <div className="path">
                <input
                    id="setting-path-input"
                    type="text"
                    className="input-text"
                    onChange={(e) => {
                        const value = e.target.value;
                        setPath(value);
                    }}
                    value={path}
                />
                <button className="button" onClick={handleDredgePath}>...</button>
            </div>
            {pathWarning}
            {dredgeFolderButton}
            <br/>
            {config ? configOptions : <span>
                <i className="fa-solid fa-triangle-exclamation warning"></i>
                <i> Run DREDGE with the Winch modloader at least once to enable settings.</i>
                </span>}

            <div className="flex-fill"></div>

            <div className="settings-links">
                <a href="https://dredgemods.com/" title="https://dredgemods.com/" target="_blank">
                    <i className="fa-solid fa-globe"></i>
                </a>
                <a href="https://github.com/DREDGE-Mods/DredgeModManager" title="https://github.com/DREDGE-Mods/DredgeModManager" target="_blank">
                    <i className="fa-brands">&#xf09b;</i>
                </a>
                <a href="https://discord.gg/qFqPuTUAmD" title="DREDGE Modding Discord" target="_blank">
                    <i className="fa-brands fa-discord"></i>
                </a>
            </div>
            
            <div>
                Dredge Mod Manager version {appVersion}
            </div>
        </div>
    </div>
}

export default Settings
