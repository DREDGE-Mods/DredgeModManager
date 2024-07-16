import React, { useState } from 'react'

import '../../scss/mods/mods.scss'

import { ModsTab } from "./ModsTab"
import { ModList } from "./ModList"

import {SortDirection, SortField, SortType} from "./SortField";


export const Mods = (props: {selected: string, searchQuery: string, setSearchQuery: (selected: string) => void,
    sortField : SortType, setSortField: (selected : SortType) => void, 
    sortDirection : SortDirection, setSortDirection: (selected : SortDirection) => void
}) => {
    const [selectedTab, setSelectedTab] = useState(props.selected)

    return <div className="mods-container">
        <div className="mods-selectors">
            <ModsTab selected={selectedTab} setSelected={setSelectedTab}>Installed</ModsTab>
            <ModsTab selected={selectedTab} setSelected={setSelectedTab}>Available</ModsTab>
            <div className="mods-filler"/>
        </div>
        <div className="mods-list-container">
            <ModList selected={selectedTab} searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery}
                sortField={props.sortField} setSortField={props.setSortField} sortDirection={props.sortDirection} setSortDirection={props.setSortDirection}/>
        </div>
    </div>
}