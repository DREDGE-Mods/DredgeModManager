import React from 'react'

import '../scss/content.scss'

import { Mods } from './mods/Mods'
import {default as Settings} from './settings'

interface IContentProps {
    choice: string,
    pathCorrect: boolean | undefined
}

export const Content = (props : IContentProps) => {

    const content_options = new Map(
        [
            ["Mods", <Mods selected="Installed"/>],
            ["Settings", <Settings path_correct ={props.pathCorrect}/>]
        ]
    )

    let rendered_content = props.pathCorrect !== true ?
        content_options.get("Settings") :
        content_options.get(props.choice)

    return <div className="content-container" key="Content">
        {rendered_content}
    </div>
}