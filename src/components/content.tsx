import React, {Component} from 'react'

import '../scss/content.scss'

import {default as Mods} from './mods'
import {default as Settings} from './settings'

interface IContentState extends React.PropsWithChildren<any>{
    choice: string;
}

export default class Content extends Component<{choice : string, pathCorrect: boolean | undefined}, IContentState>
{
    contentOptions: any;

    constructor(props: any) {
        super(props);
    }

    render() {
        this.contentOptions = new Map(
            [
                ["Mods", <Mods selected="Installed"/>],
                ["Settings", <Settings path_correct ={this.props.pathCorrect}/>]
            ]
        )

        var renderedContent = this.contentOptions.get(this.props.choice);

        if (!this.props.pathCorrect) {
            renderedContent = this.contentOptions.get("Settings")
        }

        return (
            <div className="content-container" key="Content">
                {renderedContent}
            </div>
        )
    }
}