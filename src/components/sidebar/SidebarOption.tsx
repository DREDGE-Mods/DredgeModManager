import React from "react";

import '../../scss/sidebar/sidebarOption.scss'


interface ISidebarOption {
    name: string,
    index: number,
    isSelected: boolean,
    setSelected: () => void
}

const SidebarOption = (props: ISidebarOption) => {
    return <div className={"sidebar-option-container"}>
        <button className={`sidebar-option ${props.isSelected ? "selected" : ""}`}
                id={`sidebarOption-${props.index}`}
                onClick={() => {props.setSelected()}}>
            <div className={"sidebar-option-text"}>
                {props.name}
            </div>
        </button>
    </div>
}

export default SidebarOption