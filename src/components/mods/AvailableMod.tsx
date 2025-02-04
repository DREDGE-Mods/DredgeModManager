import {
    Downloads,
    Version,
    InteractButtons,
    InteractIcons,
    PrimaryContainer,
    PrimaryDetails,
    PrimaryExpand,
    SecondaryContainer,
    SecondaryDetails,
    SecondaryInteract
} from "./ModComponents";
import React, {useState} from "react";
import {IModProps, useModExpand} from "./Mod";

import '../../scss/mods/modsAvailableInstalled.scss'


export const AvailableMod = (props: IModProps) => {
    const { expanded, swapExpanded } = useModExpand(false)
    const [ installed, setInstalled] = useState(false);

    let installText = "Install"
    // It'll only show on the Available page as "installed" as its actively installing
    if (installed) {
        installText = "Installing..."
    }

    return <div className={"mods-available-box"}>
        <PrimaryContainer>
            <PrimaryDetails data={props.data}/>
            <InteractButtons>
                <button className="interact-button" onClick={() => {
                    props.installMod!(props.data)
                    setInstalled(true)
                }}>{installText}
                </button>
            </InteractButtons>
            <Downloads data={props.data}/>
            <Version data={props.data}/>
            <PrimaryExpand data={props.data} swapExpand={swapExpanded} expanded={expanded}/>
        </PrimaryContainer>
        <PrimaryContainer>
            <SecondaryDetails data={props.data}/>
        </PrimaryContainer>

        <SecondaryContainer expanded={expanded}>
            <SecondaryInteract>
                <div className="w-100"></div>
                <InteractIcons data={props.data} />
            </SecondaryInteract>
        </SecondaryContainer>
    </div>
}
