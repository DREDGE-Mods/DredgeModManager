import React, {Component, useContext} from 'react'

import '../scss/settings.scss'
import { ModInfo } from './modinfo'
import AppStateContext from './appcontext'
import App from '../App'
import { debounce } from 'lodash';

interface ISettingsState {
    path: string;
}

export default class Settings extends Component<{}, ISettingsState>
{
    static contextType = AppStateContext
    declare context: React.ContextType<typeof AppStateContext>

    constructor(props:any) {
        super(props);

        this.state = {
            path: "",
        }

        this.debounce_on_update = this.debounce_on_update.bind(this);
    }

    componentDidMount() {
        if (this.state.path === "") {
            // one moment
        }
    }

    debounce_on_update = debounce((value: string) => {
        this.context?.setState({dredgePath: value});
    },
    1000)

    render () {
        return (
            <div className="settings-container">
                <div className="setting">
                    <label>
                        DREDGE Install Location
                    </label>
                    <div className="path">
                        <input 
                            id="setting-path-input"
                            type="text" 
                            className="input" 
                            onChange={(e) => {this.debounce_on_update(e.target.value)}} 
                            value={this.context?.state.dredgePath!}
                            />
                        <button className="button" onClick={this.context?.read_file_contents}>...</button>
                    </div>
                    <label className="setting-detail">
                        ~ may not update here immediately after selecting in the file explorer.
                    </label>
                </div>
            </div>
        )
    }
}