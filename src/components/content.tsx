import React, {Component} from 'react';

import '../scss/content.scss'

import {default as Mods} from './mods';
import {ModInfo} from './modinfo'

interface IContentState extends React.PropsWithChildren<any>{
    choice: string;
}

export default class Content extends Component<{choice : string, modsInfo: {}, reloadMods: () => void}, IContentState>
{
    contentOptions: any;

    constructor(props: any) {
        super(props);

        this.contentOptions = new Map(
            [
                ["Mods", <Mods selected="Installed" modsInfo={this.props.modsInfo} reload={props.reloadMods}/>],
                ["Settings", <div>Settings</div>]
            ]
        )
    }

    render() {
        const renderedContent = this.contentOptions.get(this.props.choice);

        return (
            <div className="content-container" key="Content">
                {renderedContent}
            </div>
        )
    }
}