import React from "react";

// styling via parent (Mods

interface IModsTabProps {
    selected: string,
    children: string,
    hide?: boolean,
    setSelected: (selected: string) => void
}

export const ModsTab = (props: IModsTabProps) => {
    return props.hide ? <div></div> : <button id={`mods${props.children}`}
                   className={props.selected === props.children ? "selected" : ""}
                   onClick={() => {props.setSelected(props.children)}}>
        <label>{props.children}</label>
    </button>
}