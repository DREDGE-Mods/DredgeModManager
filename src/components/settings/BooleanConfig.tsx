import React, {useState} from "react";

// ID here is case-sensitive attribute of WinchConfig, e.g., (EnableDeveloperConsole, DetailedLogSources)
interface IBooleanConfigProps {
    id: string;
    label: string,
    checked: boolean,
    onUpdate: (id: string, value: boolean) => void
}

export const BooleanConfig = (props: IBooleanConfigProps) => {
    const [checked, setChecked] = useState(props.checked);
    const updateChecked = (value: boolean) => {
        setChecked(value);
        props.onUpdate(props.id, value);
    }
    return <div>
        <input id={props.id} name={props.id} type={"checkbox"} checked={checked}
               onChange={(e) => updateChecked(e.currentTarget.checked)}/>
        <label htmlFor={props.id}>{props.label}</label>
    </div>
}