import React, {useContext, useEffect, useState} from 'react'

import '../../scss/settings.scss'
import { AppContext } from '../appcontext'
import {debounce} from 'lodash';

import { getVersion } from '@tauri-apps/api/app';
import {BooleanConfig} from "./BooleanConfig";

const appVersion = await getVersion();


export const Settings = (props: {path_correct?: boolean}) => {

    const context = useContext(AppContext);

    const [path, setPath] = useState("");

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
            context!.setState({dredgePath: path});
        }
    }

    const debouncedUpdateContextPath = debounce(updateContextPath, 500);

    const debouncedUpdatePathFromContext = debounce(updatePathFromContext,  500);

    const handleDredgePath = async () => {
        await context?.read_file_contents();
        updatePathFromContext();
    }

    const onConfigUpdate = (label: string, value: any) => {
        // "Unsafe but oh well"
        const config = context!.state.winchConfig!;

        // @ts-ignore: typescript here is just annoying https://stackoverflow.com/questions/57086672
        context!.state.winchConfig![label] = value;

        context?.update_winch_config()
    }

    useEffect(() => {
    }, [props.path_correct])

    const pathWarning = props.path_correct ? "" : <div className="warning">Invalid DREDGE path</div>

    const dredgeFolderButton = !props.path_correct ? "" : <>
        <div className="d-flex w-100 justify-content-end">
            <button className="button icon-folder" onClick={() => context!.open_mod_dir(path)}>
                <i className="fa fa-sharp">&#xf07b;</i> Open DREDGE folder
            </button>
        </div>
    </>

    const config = context!.state.winchConfig;

    const configOptions = <div className={"w-100 flex-column"}>
        <BooleanConfig id={"EnableDeveloperConsole"}
                       label={"Enable In-Game Developer Console"}
                       checked={config?.EnableDeveloperConsole}
                       onUpdate={onConfigUpdate} />
        <BooleanConfig id={"DetailedLogSources"}
                       label={"Use detailed log sources"}
                       checked={config?.DetailedLogSources}
                       onUpdate={onConfigUpdate} />
        <BooleanConfig id={"WriteLogsToFile"}
                       label={"Write logs to file"}
                       checked={config?.WriteLogsToFile}
                       onUpdate={onConfigUpdate} />
        <BooleanConfig id={"WriteLogsToConsole"}
                       label={"Write logs to console"}
                       checked={config?.WriteLogsToConsole}
                       onUpdate={onConfigUpdate} />
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
            {config ? configOptions : ""}

            <div className="flex-fill"></div>

            <div>
                Dredge Mod Manager version {appVersion}
            </div>
        </div>
    </div>
}

export default Settings
