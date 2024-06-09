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
    return <div className="interact-icons">
        {hasGit === false ? "" :
            <a href={gitLink} title={gitLink} target="_blank">
                <i className="fa-brands">&#xf09b;</i>
            </a>}
        {props.children}
    </div>
}

export const InteractButtons = (props: React.PropsWithChildren) => {
    return <div className="interact-buttons">
            {props.children}
        </div>
}

export const Downloads = (props: {downloads: number}) => {
    return props.downloads <= 0 ? null :
        <div className="downloads">
            <i className="fa">&#xf019;</i>
            <span>{props.downloads}</span>
        </div>
}

interface IUpdateProps {
    data: ModInfo,
    installMod: () => void,
    isModOutdated: () => boolean,
    updated: boolean
}

export const Update = (props: IUpdateProps) => {
    return <div className="primary-update">
        {(props.data.Repo || false) &&
            <button
                className={`update`}
                onClick={props.installMod}
                disabled={!props.isModOutdated() || props.updated}
                title={props.isModOutdated() ? `${props.data.Version} -> ${props.data.LatestVersion}` : ""}
            >Update</button>
        }
    </div>
}