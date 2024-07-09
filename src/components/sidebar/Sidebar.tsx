import React, {useContext, useEffect, useState} from 'react';

import { SidebarOption } from './SidebarOption'
import { SidebarPlay } from "./SidebarPlay";

import '../../scss/sidebar/sidebar.scss'
import {AppContext} from "../appcontext";

export const Sidebar = () => {

    const context = useContext(AppContext);

    const [selected, setSelected] = useState("Settings");

    let displayedOptions = [
        {
            name: "Mods",
        },
        {
            name: "Settings",
        }
    ]

    useEffect(() => {
        if (!context.state.pathCorrect) {
            setSelected("Settings");
        } else {
            setSelected(context.state.pageChoice);
        }
    }, [context.state.pathCorrect, context.state.pageChoice]);

    if (!context.state.pathCorrect) {
        displayedOptions = [{name: "Settings"}]
    }

    const rendered = displayedOptions.map((item, index) => {
        return <SidebarOption name={item.name}
                              index={index}
                              isSelected={selected === item.name}
                              setSelected={() => {
                                  context.setPageChoice(item.name)
                              }}
                              key={index}/>
    })

    return <div className={"sidebar-container"}>
        <div className={"sidebar-options-container"}>
            {rendered}
        </div>
        <SidebarPlay start={context.start}/>
    </div>
}