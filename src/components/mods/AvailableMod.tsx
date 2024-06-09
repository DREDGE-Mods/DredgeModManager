import {
    Downloads,
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
    if (installed) {
        installText = "Installed"
    }

    return <div className={"mods-available-box"}>
        <PrimaryContainer>
            <PrimaryDetails data={props.data}/>
            <PrimaryExpand data={props.data} swapExpand={swapExpanded} expanded={expanded}/>
        </PrimaryContainer>

        <SecondaryContainer expanded={expanded}>
            <SecondaryDetails data={props.data}/>
            <SecondaryInteract>
                <InteractButtons>
                    <button className="interact-button" onClick={() => {
                        props.installMod!(props.data)
                        setInstalled(true)
                    }}>{installText}
                    </button>
                </InteractButtons>
                <Downloads downloads={props.data.Downloads!}/>
                <InteractIcons data={props.data} />
            </SecondaryInteract>
        </SecondaryContainer>
    </div>
}
