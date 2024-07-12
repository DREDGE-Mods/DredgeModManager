import React, {useContext, useState} from 'react'

import '../scss/content.scss'

import { Mods } from './mods/Mods'
import {default as Settings} from './settings/settings'
import {AppContext} from "./appcontext";
import {SortDirection, SortField, SortType} from "./mods/SortField";

export const Content = () => {

    const {state} = useContext(AppContext)

    const [searchQuery, setSearchQuery] = useState("")
    const [sortField, setSortField] = useState<SortType>(SortType.DEFAULT);
    const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASCENDING);

    const content_options = new Map(
        [
            ["Mods", <Mods selected="Installed" searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
                sortField={sortField} setSortField={setSortField} sortDirection={sortDirection} setSortDirection={setSortDirection}/>],
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