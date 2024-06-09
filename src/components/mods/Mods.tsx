import React, { useState } from 'react'

import '../../scss/mods/mods.scss'

import { ModsTab } from "./ModsTab"
import { ModList } from "./ModList"


export const Mods = (props: {selected: string}) => {
    const [selectedTab, setSelectedTab] = useState(props.selected)

    return <div className="mods-container">
        <div className="mods-selectors">
            <ModsTab selected={selectedTab} setSelected={setSelectedTab}>Installed</ModsTab>
            <ModsTab selected={selectedTab} setSelected={setSelectedTab}>Available</ModsTab>
            <div className="mods-filler"/>
        </div>
        <div className="mods-list-container">
            <ModList selected={selectedTab}/>
        </div>
    </div>
}