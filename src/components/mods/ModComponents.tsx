import React from "react";
import { ModInfo } from "../modinfo";

// Components by virtue of "used in multiple places"

interface IModDataConsumer {
    data: ModInfo
}

export const PrimaryContainer = (props: React.PropsWithChildren) => {
    return <div className={"box-primary-container"}>
        {props.children}
    </div>
}

export const PrimaryDetails = (props: IModDataConsumer) => {
    return <label className="primary-details" htmlFor={`expand-${props.data.ModGUID}`}>
        <span className="details-name"
              title={`Version: ${props.data.Version ?? props.data.LatestVersion}`}>
            {props.data.Name || props.data.ModGUID}
        </span>
        <span className="details-by">
            {props.data.Author ? "by" : ""}
        </span>
        <span className="details-author" title={props.data.Author}>
            {props.data.Author}
        </span>
    </label>
}

interface IPrimaryExpandProps extends IModDataConsumer {
    expanded?: boolean,
    swapExpand: () => void
}

export const PrimaryExpand = (props: IPrimaryExpandProps) => {
    return <button className={`primary-expand ${props.expanded ? "expanded" : ""}`}
                   onClick={props.swapExpand}
                   id={`expand-${props.data.ModGUID}`}/>

}

export const SecondaryContainer = (props: React.PropsWithChildren<{expanded?: boolean}>) => {
    return <div className={`box-secondary-container ${props.expanded ? "expanded" : ""}`}>
        {props.children}
    </div>
}

export const SecondaryDetails = (props: IModDataConsumer) => {
    return <div className="secondary-description">{props.data.Description}</div>
}

export const SecondaryInteract = (props: React.PropsWithChildren) => {
    return <div className="secondary-interacts">
            {props.children}
        </div>
}

export const InteractIcons = (props: React.PropsWithChildren<IModDataConsumer>) => {
    let hasGit = props.data.Repo ?? false;
    const gitLink = `https://github.com/${props.data.Repo}`
    const websiteLink = `https://dredgemods.com/mods/${props.data.Name.trim().toLowerCase().replace(/\s/g, "_")}/`
    return <div className="interact-icons">
        {hasGit === false ? "" :
            <a href={gitLink} title={gitLink} target="_blank">
                <i className="fa-brands">&#xf09b;</i>
            </a>
        }
        {hasGit === false ? "" :
            <a href={websiteLink} title={websiteLink} target="_blank">
                <i className="fa">&#xf016;</i>
            </a>
        }
        
        {props.children}
    </div>
}

export const InteractButtons = (props: React.PropsWithChildren) => {
    return <div className="interact-buttons">
            {props.children}
        </div>
}

export const Downloads = (props: IModDataConsumer) => {
    return <div className="mod-info-column" title={"Released: " + FormatDateString(props.data.ReleaseDate)}>
        <i className="fa">&#xf019;</i>
        <span>{props.data.Downloads ?? 0}</span>
    </div>
}

export const Version = (props: IModDataConsumer) => {
    let date = FormatDateString(props.data.AssetUpdateDate);
    return <div title={"Last update: " + date} className="mod-info-column">
        <span>{FormatVersionString(props.data.LatestVersion)}</span>
    </div>
}

interface IUpdateProps {
    data: ModInfo,
    installMod: () => void,
    isModOutdated: () => boolean,
    updated: boolean
}

export function FormatDateString(dateOrUndefined: string | undefined) {
    let date = dateOrUndefined == undefined ? "Unknown" : new Date(dateOrUndefined).toLocaleDateString("en-GB", 
        { year: "numeric", month: "long", day: "numeric" })
    return date
}

export function FormatVersionString(version: string | undefined) {
    return version == undefined ? "Unknown" : version.startsWith("v") ? version : "v" + version
}

export const Update = (props: IUpdateProps) => {
    let date = FormatDateString(props.data.AssetUpdateDate);
    return <div className="mod-info-column primary-update">
        {(props.data.Repo || false) && !(!props.isModOutdated() || props.updated) ?
            <button
                className={`update`}
                onClick={props.installMod}
                disabled={!props.isModOutdated() || props.updated}
                title={props.isModOutdated() ? `Latest release: ${date}\n${FormatVersionString(props.data.Version)} -> ${FormatVersionString(props.data.LatestVersion)}` : ""}
            >Update</button>
            :
            <Version data={props.data}/>
        }
    </div>
}