import React, {useContext} from 'react'

import '../scss/content.scss'

import { Mods } from './mods/Mods'
import {default as Settings} from './settings/settings'
import {AppContext} from "./appcontext";

export const Content = () => {

    const {state} = useContext(AppContext)

    const content_options = new Map(
        [
            ["Mods", <Mods selected="Installed"/>],
            ["Settings", <Settings path_correct ={state.pathCorrect}/>]
        ]
    )

    let rendered_content = state.pathCorrect !== true ?
        content_options.get("Settings") :
        content_options.get(state.pageChoice)

    return <div className="content-container" key="Content">
        {rendered_content}
    </div>
}