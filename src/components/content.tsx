import React from 'react'

import '../scss/content.scss'

import {default as Mods} from './mods'
import {default as Settings} from './settings'

interface IContentProps {
    choice: string,
    pathCorrect: boolean | undefined
}

const Content = (props : IContentProps) => {

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

export default Content