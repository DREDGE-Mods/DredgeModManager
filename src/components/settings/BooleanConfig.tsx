import React from "react";

// ID here is case-sensitive attribute of WinchConfig, e.g., (EnableDeveloperConsole, DetailedLogSources)
interface IBooleanConfigProps {
    id: string;
    label: string,
    checked?: boolean,
    onUpdate: (id: string, value: boolean) => void
}

export const BooleanConfig = (props: IBooleanConfigProps) => {
    return <div>
        <input id={props.id} name={props.id} type={"checkbox"} checked={props.checked}
               onChange={(e) => {
                   props.onUpdate(props.id, e.target.checked)
               }}/>
        <label htmlFor={props.id}>{props.label}</label>
    </div>
}