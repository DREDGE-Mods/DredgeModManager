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
        let mod = props.data;
        let trimmedLocalVersion = mod.Version!.trim().replace(/^v/, '');
        let trimmedLatestVersion = mod.LatestVersion?.trim().replace(/^v/, '');
        let doesVersionMatch = trimmedLocalVersion === trimmedLatestVersion;
        let doesUpdateDateMatch = mod.LocalAssetUpdateDate?.trim() === mod.AssetUpdateDate?.trim();
        return !doesVersionMatch && !doesUpdateDateMatch;
    }

    return <div className="mods-installed-box">

        <PrimaryContainer>
            <PrimaryDetails data={props.data}/>

            <Downloads data={props.data}/>

            <Update data={props.data} installMod={installMod} isModOutdated={isModOutdated} updated={state.updated}/>
            <div className="mod-info-column primary-switch">
                {props.data.ModGUID != "hacktix.winch" ?
                    <button className={`switch ${state.enabled ? "switched" : ""}`} onClick={swapEnabled} disabled={props.data.ModGUID == "hacktix.winch"}/>
                    :
                    <div></div>
                }
            </div>

            <PrimaryExpand data={props.data} swapExpand={swapExpanded} expanded={expanded}/>
        </PrimaryContainer>
        <PrimaryContainer>
            <SecondaryDetails data={props.data}/>
        </PrimaryContainer>

        <SecondaryContainer expanded={expanded}>
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
                <InteractIcons data={props.data}>
                    <button title="Open folder" className="icon-folder"
                            onClick={() => props.openModDir!(props.data.LocalPath!)}>
                        <i className="fa fa-sharp">&#xf07b;</i>
                    </button>
                </InteractIcons>
            </SecondaryInteract>
        </SecondaryContainer>
    </div>
}
