import {
    Downloads,
    InteractButtons,
    InteractIcons,
    PrimaryContainer,
    PrimaryDetails,
    PrimaryExpand,
    SecondaryContainer,
    SecondaryDetails,
    SecondaryInteract,
    Update
} from "./ModComponents";
import React, {useState} from "react";
import {IModProps, useModExpand} from "./Mod";

import '../../scss/mods/modsAvailableInstalled.scss'

interface IInstalledModProps extends IModProps {
    enabled: boolean,
    updateEnabled: (a: string, b: boolean) => void,
    uninstallMod: (p:string) => void,
    openModDir: (p:string) => void
}

export const InstalledMod = (props: IInstalledModProps) => {
    const {expanded, swapExpanded} = useModExpand(false)
    const [state, setState] = useState({
        enabled: props.enabled ?? false,
        updated: false
    })

    // updateMod
    const installMod = () => {
        props.installMod(props.data)
        setState({
            enabled: props.enabled,
            updated: true
        })
    }

    const swapEnabled = () => {
        props.updateEnabled(props.data.ModGUID, state.enabled)
        setState({
            enabled: !state.enabled,
            updated: state.updated
        })
    }

    const isModOutdated = () => {
        // Either the latest version tags match or the release time of the asset when downloading matches whats in the DB
        // Bit of a hacky way to deal with multi mod repos
        // Also ignore "v" prefix on version numbers
        console.log("called isModOutdated");
        let mod = props.data;
        let trimmedLocalVersion = mod.Version!.trim().replace(/^v/, '');
        let trimmedLatestVersion = mod.LatestVersion?.trim().replace(/^v/, '');
        let doesVersionMatch = trimmedLocalVersion === trimmedLatestVersion;
        let doesUpdateDateMatch = mod.LocalAssetUpdateDate?.trim() === mod.AssetUpdateDate?.trim();
        console.log(mod)
        console.log(!doesVersionMatch && !doesUpdateDateMatch)
        return !doesVersionMatch && !doesUpdateDateMatch;
    }

    return <div className="mods-installed-box">

        <PrimaryContainer>
            <PrimaryDetails data={props.data}/>
            <Update data={props.data} installMod={installMod} isModOutdated={isModOutdated} updated={state.updated}/>
            <div className="primary-switch">
                {props.data.ModGUID != "hacktix.winch" ?
                    <button className={`switch ${state.enabled ? "switched" : ""}`} onClick={swapEnabled}/>
                    :
                    ""
                }
            </div>

            <PrimaryExpand data={props.data} swapExpand={swapExpanded} expanded={expanded}/>
        </PrimaryContainer>

        <SecondaryContainer expanded={expanded}>
            <SecondaryDetails data={props.data}/>
            <SecondaryInteract>
                <InteractButtons>
                    <button className="interact-button"
                            onClick={() => props.uninstallMod!(props.data.LocalPath!)}>Uninstall
                    </button>
                    {props.data.ModGUID === "hacktix.winch" ? "" :
                        <button className="interact-button"
                                onClick={swapEnabled}>{state.enabled ? "Disable" : "Enable"}</button>
                    }
                </InteractButtons>
                <Downloads downloads={props.data.Downloads!}/>
                <InteractIcons data={props.data}>
                    <button className="icon-folder"
                            onClick={() => props.openModDir!(props.data.LocalPath!)}>
                        <i className="fa fa-sharp">&#xf07b;</i>
                    </button>
                </InteractIcons>
            </SecondaryInteract>
        </SecondaryContainer>
    </div>
}
