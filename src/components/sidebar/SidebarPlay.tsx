import React from "react";

import '../../scss/sidebar/sidebarPlay.scss'


const SidebarPlay = (props: {start: () => void}) => {
    return <div className={"sidebar-play-container"}>
        <div className={"sidebar-play"}>
            <button className={"sidebar-play-main"} id={"play-main"} onClick={props.start}>
                <label htmlFor={"play-main"}>play</label>
            </button>
            {/* TODO: alt play button to run without mods
                    <button className="sidebar-play-alt" id="play-alt">
                        <label htmlFor="play-alt"></label>
                    </button>
            */}
        </div>
    </div>
}

export default SidebarPlay