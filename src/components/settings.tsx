import React, {Component, useContext} from 'react'

import '../scss/settings.scss'
import { ModInfo } from './modinfo'
import AppStateContext from './appcontext'
import App from '../App'

export default class Settings extends Component
{
    static contextType = AppStateContext
    declare context: React.ContextType<typeof AppStateContext>

    constructor(props:any) {
        super(props);
    }

    render () {
        return (
            <div className="settings-container">
                <div className="setting">
                    <label>
                        DREDGE path
                    </label>
                    <div className="path">
                        <input type="text" className="input" onChange={(e) => this.context?.setState({dredgePath: e.target.value})} value={this.context?.state.dredgePath}/>
                        <button className="button" onClick={this.context?.read_file_contents}>...</button>
                    </div>
                </div>
            </div>
        )
    }
}


//<input type="text" className="flex-fill m-2" onChange={(e) => setDredgePath(e.target.value)} value={dredgePath}></input>
  //        <button className="m-2" onClick={readFileContents}>Select Folder</button>