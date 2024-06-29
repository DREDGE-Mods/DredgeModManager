import React, {useEffect, useState} from "react";

interface ISearchProps {
    defaultValue: string,
    updateValue: (s: string) => void
}

export const Search = (props: ISearchProps) => {
    const [text, setText] = useState(props.defaultValue);
    const [selected, setSelected] = useState(false);

    useEffect(() => {
        setText(props.defaultValue);
    }, [props.defaultValue])

    useEffect(() => {
        props.updateValue(text);
    }, [text])

    // needs tabIndex: https://stackoverflow.com/a/49662770
    return <label htmlFor={"search-bar"} className={`search ${selected || text !== "" ? "active" : ""}`} tabIndex={-1}
                  onFocus={(e) => setSelected(true)}
                  onBlur={(e) => setSelected(false)}>
        <i className={"fa-solid fa-magnifying-glass"}></i>
        <input type={"text"} placeholder={"Search..."} value={text} id={"search-bar"}
               onChange={(e) => {
            setText(e.currentTarget.value);
        }}/>
    </label>
}