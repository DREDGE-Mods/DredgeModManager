import React from 'react';

import { SidebarOption } from './SidebarOption'
import { SidebarPlay } from "./SidebarPlay";

import '../../scss/sidebar/sidebar.scss'

interface ISidebarProps {
    choice: string,
    start: () => void,
    setPage: (page: string) => void
    pathCorrect?: boolean
}

export const Sidebar = (props: ISidebarProps) => {
    let displayedOptions = [
        {
            name: "Mods",
        },
        {
            name: "Settings",
        }
    ]

    if (!props.pathCorrect) {
        displayedOptions = [{name: "Settings"}]
    }

    return <div className={"sidebar-container"}>
        <div className={"sidebar-options-container"}>
            {
                displayedOptions.map((item, index) => {
                    let selected = props.choice
                    if (!props.pathCorrect) {
                        selected = "Settings"
                    }
                    return <SidebarOption name={item.name}
                                          index={index}
                                          isSelected={selected === item.name}
                                          setSelected={() => {
                                              props.setPage(item.name)
                                          }}
                                          key={index}/>
                })
            }
        </div>
        <SidebarPlay start={props.start}/>
    </div>
}