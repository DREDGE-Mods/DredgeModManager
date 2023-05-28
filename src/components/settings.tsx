import React, {Component, useContext} from 'react'

import '../scss/settings.scss'
import { ModInfo } from './modinfo'
import AppStateContext from './appcontext'
import App from '../App'
import { debounce } from 'lodash';

export default class Settings extends Component
{
    static contextType = AppStateContext
    declare context: React.ContextType<typeof AppStateContext>

    constructor(props:any) {
        super(props);

        this.on_update = this.on_update.bind(this);
    }

    on_update() {
        document.getElementById("setting-path-input")?.setAttribute("value", this.context?.state.dredgePath!);
    }

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
                        onChange={(e) => {this.context?.setState({dredgePath: e.target.value}); this.on_update()}} 
                        defaultValue={this.context?.state.dredgePath!}/>
                        <button className="button" onClick={this.context?.read_file_contents}>...</button>
                    </div>
                    <label>
                        ~ may not update here immediately after selecting in the file explorer.
                    </label>
                </div>
            </div>
        )
    }
}


//<input type="text" className="flex-fill m-2" onChange={(e) => setDredgePath(e.target.value)} value={dredgePath}></input>
  //        <button className="m-2" onClick={readFileContents}>Select Folder</button>