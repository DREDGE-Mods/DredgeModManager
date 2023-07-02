import React, {Component, useContext} from 'react'

import '../scss/settings.scss'
import { ModInfo } from './modinfo'
import AppStateContext from './appcontext'
import App from '../App'
import { debounce } from 'lodash';

import { getVersion } from '@tauri-apps/api/app';
const appVersion = await getVersion();

interface ISettingsState {
    path: string;
}

export default class Settings extends Component<{path_correct: boolean | undefined}, ISettingsState>
{
    static contextType = AppStateContext
    declare context: React.ContextType<typeof AppStateContext>

    constructor(props:any) {
        super(props);

        this.state = {
            path: "",
        }

        this.debounce_on_path_update = this.debounce_on_path_update.bind(this);
        this.on_update = this.on_update.bind(this);
        this.handle_path_button = this.handle_path_button.bind(this);
    }

    componentDidMount() {
        if (this.state.path === "") {
            this.setState({path : (this.context as App).state.dredgePath!})
        }
        this.debounce_check_path();
    }

    handle_path_button = async() => {
        await this.context?.read_file_contents();
        this.debounce_check_path();
    }

    on_update(value : string) {
        this.setState({path: value});
        this.debounce_on_path_update(value);
    }

    debounce_on_path_update = debounce((value: string) => {
        this.context?.setState({dredgePath: value});
    },
    500)

    debounce_check_path = debounce(() => {
        this.setState({path: (this.context as App).state.dredgePath!});
    },
    500)

    render () {
        var pathWarning:JSX.Element | string;
        if (!this.props.path_correct) {
            pathWarning = <div className="warning">
                        Invalid DREDGE path
                        </div>
        } else {
            pathWarning = "";
        }

        var dredgeFolderButton:JSX.Element | string;
        if (this.props.path_correct) {
            dredgeFolderButton = <div className="d-flex w-100 justify-content-end">
                <button className="button icon-folder" onClick={() => (this.context as App).open_mod_dir(this.state.path)}>
                    <i className="fa fa-sharp">&#xf07b;</i> Open DREDGE folder
                </button>
            </div>
        } else {
            dredgeFolderButton = "";
        }

        return (
            <div className="settings-container">
                <div className="setting d-flex h-100">
                    <label>
                        DREDGE Install Location
                    </label>
                    <div className="path">
                        <input 
                            id="setting-path-input"
                            type="text" 
                            className="input-text" 
                            onChange={(e) => {this.on_update(e.target.value)}} 
                            value={this.state.path}
                            />
                        <button className="button" onClick={this.handle_path_button}>...</button>
                    </div>
                    {pathWarning}
                    {dredgeFolderButton}

                    <div className="flex-fill"></div>

                    <div>
                        Dredge Mod Manager version {appVersion}
                    </div>
                </div>
            </div>
        )
    }
}