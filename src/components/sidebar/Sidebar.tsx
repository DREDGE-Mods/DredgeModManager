import React, {useContext} from 'react';

import { SidebarOption } from './SidebarOption'
import { SidebarPlay } from "./SidebarPlay";

import '../../scss/sidebar/sidebar.scss'
import {AppContext} from "../appcontext";

export const Sidebar = () => {

    const context = useContext(AppContext);

    let displayedOptions = [
        {
            name: "Mods",
        },
        {
            name: "Settings",
        }
    ]

    if (!context.state.pathCorrect) {
        displayedOptions = [{name: "Settings"}]
    }

    return <div className={"sidebar-container"}>
        <div className={"sidebar-options-container"}>
            {
                displayedOptions.map((item, index) => {
                    let selected = context.state.pageChoice
                    if (!context.state.pathCorrect) {
                        selected = "Settings"
                    }
                    return <SidebarOption name={item.name}
                                          index={index}
                                          isSelected={selected === item.name}
                                          setSelected={() => {
                                              context.setPageChoice(item.name)
                                          }}
                                          key={index}/>
                })
            }
        </div>
        <SidebarPlay start={context.start}/>
    </div>
}