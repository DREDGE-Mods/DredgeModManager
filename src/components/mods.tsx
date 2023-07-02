import React, { Component } from 'react'

import '../scss/mods.scss'
import { ModInfo } from './modinfo'
import AppStateContext from './appcontext'
import App from '../App'
import { debounce } from 'lodash'


interface IModsState extends React.PropsWithChildren<any>{
    selected: string;
}

export default class Mods extends Component<{selected: string}, IModsState>
{
    constructor(props: any) {
        super(props)

        this.state = {
            selected: "Installed",
        }

        this.SetSelectedTab = this.SetSelectedTab.bind(this);
    }

    SetSelectedTab(newSelected: string) {
        this.setState({selected: newSelected});
    }

    render() {
        return (
            <div className="mods-container">
                <div className="mods-selectors">
                    <ModsSelector selected={this.state.selected} setSelected={this.SetSelectedTab}>Installed</ModsSelector>
                    <ModsSelector selected={this.state.selected} setSelected={this.SetSelectedTab}>Available</ModsSelector>
                    <div className="mods-filler" />
                </div>
                <div className="mods-list-container">
                    <ModList selected={this.state.selected}/>
                </div>
            </div>
        );
    }
}

class ModsSelector extends Component<{selected: string, children: string, setSelected: (n: string) => void}>
{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <button 
            id={`mods${this.props.children}`} 
            className={this.props.children === this.props.selected ? "selected" : ""} 
            onClick={() => {this.props.setSelected(this.props.children)}}>
                <label>{this.props.children}</label>
            </button>
        )
    }
}


class ModList extends Component<{selected: string}>
{
    static contextType = AppStateContext
    declare context: React.ContextType<typeof AppStateContext>

    constructor(props: any) {
        super(props);

        this.uninstall_mod = this.uninstall_mod.bind(this);
        this.install_mod = this.install_mod.bind(this);
    }

    componentDidMount() {
        this.debounce_force_update_slow();
    }

    uninstall_mod(path: string) {
        (this.context as App).uninstall_mod(path);
        this.debounce_force_update_slow();
    }

    install_mod(mod: ModInfo) {
        (this.context as App).install_mod(mod);
        this.debounce_force_update_slow();
    }

    debounce_force_update_slow = debounce(() => {this.forceUpdate()}, 1000);

    render() {
        var shownList = new Array<JSX.Element>();
        var availableList = new Array<JSX.Element | undefined>();
        var installedList = new Array<JSX.Element>();

        const app = (this.context as App).state

        const info = app.modInfos;
        const enabled = app.enabledMods;
        const database = app.database;
        var modList = new Array<ModInfo>();
        for (let [k, v] of info!) {
            modList.push(v)
        }

        if (database === undefined) {}
        else {
            // Make sure winch is always at the top of all lists
            let index = modList.findIndex(mod => mod.ModGUID == "hacktix.winch");
            modList.unshift(modList.splice(index, 1)[0]);

            index = database.findIndex(mod => mod.ModGUID == "hacktix.winch");
            database.unshift(database.splice(index, 1)[0]);

            if (this.props.selected === "Installed") {
                installedList = modList.map((mod) => {
                    return <InstalledModBox 
                    key={mod.ModGUID} 
                    data={mod} 
                    enabled={enabled![mod.ModGUID]} 
                    update_enabled={(this.context as App).toggle_enabled_mod} 
                    uninstall_mod={this.uninstall_mod}
                    install_mod={this.install_mod}
                    open_mod_dir={(this.context as App).open_mod_dir}/>
                })
            }

            if (this.props.selected === "Available") {
                availableList = database!.map((mod) => {
                    if (!info!.has(mod.ModGUID)) {
                        return <AvailableModBox 
                        key={mod.ModGUID} 
                        data={mod} 
                        install_mod={this.install_mod}/>
                    } return undefined
                })
            }
        }

        if (this.props.selected === "Installed") {
            // #6 Prompt user to install Winch if it is not installed
            if (modList.findIndex(mod => mod.ModGUID == "hacktix.winch") == -1) {
                return (
                    <div className="mods-not-found">
                        All mods require the Winch modloader to be installed. Download it in the "Available" tab.
                    </div>
                )
            }
            shownList = installedList;
        } else {
            shownList = availableList.filter((element) => {return (element!=undefined)}) as Array<JSX.Element>;
        }


        if (shownList.length === 0) shownList = [<ModsNotFound key={"mods-not-found"} reload={this.debounce_force_update_slow} installed={this.props.selected === "Installed"}/>]

        return (
            <div className="mods-list">
                {shownList}
            </div>
        )
    }
}

class ModsNotFound extends Component<{reload: () => void, installed: boolean}>
{
    render() {
        return (
            <div className="mods-not-found">
                {this.props.installed ? 
                    <span className="info">Oh no! Looks like you've not got any mods, check out the Available tab!</span>
                    :
                    <span className="info">You have installed all mods currently available on the database. Check back another time to see if there are more!</span>
                }
                <div className="reload">
                    Think that's wrong?
                    <button onClick={this.props.reload}>Reload</button></div>
            </div>
        )
    }
}


// Components for each mod in list

interface IModBoxState {
    expanded?: boolean;
}

interface ModBoxProps
{
    data: ModInfo, 
    enabled?: boolean | undefined, 
    update_enabled?: (a: string, b: boolean) => void, 
    install_mod?: (a: ModInfo) => void, 
    uninstall_mod?: (p:string) => void,
    open_mod_dir?: (p:string) => void
}

class ModBox<ISpecificState extends IModBoxState> extends Component<ModBoxProps, ISpecificState> {
    constructor(props: any) {
        super(props);

        this.swap_expand = this.swap_expand.bind(this);
    }

    componentDidMount () {
        this.setState({expanded: false});
    }
    
    swap_expand() {
        this.setState({expanded: !this.state.expanded});
    }
}

function PrimaryContainer (props: {children: React.ReactNode}) {
    return (
        <div className="box-primary-container">
            {props.children}
        </div>
    )
}

function PrimaryDetails (props: {data: ModInfo}) {
    return (
        <label className="primary-details" htmlFor={`expand-${props.data.ModGUID}`}>
            <span className="details-name" title={`Version: ${props.data.Version}`}>{props.data.Name || props.data.ModGUID}</span>
            <span className="details-by">{props.data.Author ? "by" : ""}</span>
            <span className="details-author" title={props.data.Author}>{props.data.Author}</span>
        </label>
    )
}

function PrimaryExpand (props: {data: ModInfo, swap_expand: () => void, expanded: boolean | undefined}) {
    return (
        <button className={`primary-expand ${props.expanded ? "expanded" : ""}`} onClick={props.swap_expand} id={`expand-${props.data.ModGUID}`}/>
    )
}

function SecondaryContainer (props: {expanded: boolean | undefined, children: React.ReactNode}) {
    return (
        <div className={`box-secondary-container ${props.expanded ? "expanded" : ""}`}>
            {props.children}
        </div>
    )
}

function SecondaryDetails (props: {data: ModInfo}) {
        return <>
            <div className="secondary-description">{props.data.Description}</div>
        </>
}

function SecondaryInteract (props: {children: React.ReactNode}) {
    return (
        <div className="secondary-interacts">
            {props.children}
        </div>
    )
}

function InteractIcons(props: {data: ModInfo, children?: React.ReactNode}) {
    var doGit = props.data.Repo ?? false;
    const gitLink = `https://github.com/${props.data.Repo}`
    return (
        <div className="interact-icons">
            {doGit && 
            <a href={gitLink} title={gitLink} target="_blank">
                <i className="fa-brands">&#xf09b;</i>
            </a>}
            {props.children}
        </div>
    )
}

function InteractButtons (props: {children: React.ReactNode}) {
    return (
        <div className="interact-buttons">
            {props.children}
        </div>
    )
}

function Downloads (props: {downloads: number}) {
    return ((props.downloads > 0) ?
    <div className="downloads">
        <i className="fa">&#xf019;</i>
        <span>{props.downloads}</span>
    </div> :
    <></>)
}


interface IInstalledModState extends IModBoxState{
    enabled: boolean;
    updated: boolean;
}

class InstalledModBox extends ModBox<IInstalledModState>
{
    constructor(props: any) {
        super(props);

        this.state = {
            enabled: this.props.enabled ?? false,
            updated: false,
        }

        this.swap_enabled = this.swap_enabled.bind(this);
        this.install_mod = this.install_mod.bind(this);
    }

    install_mod() {
        this.props.install_mod!(this.props.data);
        this.setState({updated: true});
    }

    swap_enabled() {
        this.props.update_enabled!(this.props.data.ModGUID, this.state.enabled)
        this.setState({enabled: !this.state.enabled});
    }

    render() {
        return (
            <div className="mods-installed-box">

                <PrimaryContainer>
                    <PrimaryDetails data={this.props.data}/> 

                    <div className="primary-update">
                        { (this.props.data.Repo || false) &&
                        <button 
                        className={`update`}
                        onClick={this.install_mod}
                        disabled={this.props.data.Version!.trim() === this.props.data.LatestVersion?.trim() || this.state.updated}
                        title={(this.props.data.Version!.trim() === this.props.data.LatestVersion?.trim()) ? "" : this.props.data.LatestVersion}
                        >Update</button>
                        }
                    </div>
                    <div className="primary-switch">
                        <button className={`switch ${this.state.enabled ? "switched" : ""}`} onClick={this.swap_enabled}/>
                    </div>

                    <PrimaryExpand data={this.props.data} swap_expand={this.swap_expand} expanded={this.state.expanded}/>
                </PrimaryContainer>

                <SecondaryContainer expanded={this.state.expanded}>
                    <SecondaryDetails data={this.props.data}/>
                    <SecondaryInteract>
                        <InteractButtons>
                            <button className="interact-button" onClick={() => this.props.uninstall_mod!(this.props.data.LocalPath!)}>Uninstall</button>
                            <button className="interact-button" onClick={this.swap_enabled}>{this.state.enabled ? "Disable" : "Enable"}</button>
                        </InteractButtons>
                        <Downloads downloads={this.props.data.Downloads!}/>
                        <InteractIcons data={this.props.data}>
                            <button className="icon-folder" onClick={() => this.props.open_mod_dir!(this.props.data.LocalPath!)}>
                                <i className="fa fa-sharp">&#xf07b;</i>
                            </button>
                        </InteractIcons>
                    </SecondaryInteract>
                </SecondaryContainer>
            </div>
        )
    }
}

interface IAvailableModState extends IModBoxState{
    installed: boolean;
}

class AvailableModBox extends ModBox<IAvailableModState>
{
    constructor(props: any) {
        super(props);

        this.state = {
            installed: false,
        }
    }

    render() {
        var installText = "Install";
        if (this.state.installed) {
            installText = "Installed";
        }

        return (
            <div className="mods-available-box">

                <PrimaryContainer>
                    <PrimaryDetails data={this.props.data}/> 
                    <PrimaryExpand data={this.props.data} swap_expand={this.swap_expand} expanded={this.state.expanded}/>
                </PrimaryContainer>

                <SecondaryContainer expanded={this.state.expanded}>
                    <SecondaryDetails data={this.props.data}/>
                    <SecondaryInteract>
                        <InteractButtons>
                            <button className="interact-button" onClick={() => {
                                this.props.install_mod!(this.props.data);
                                this.setState({installed: true});
                                }}>{installText}
                            </button>
                        </InteractButtons>
                        <Downloads downloads={this.props.data.Downloads!}/>
                        <InteractIcons data={this.props.data} />
                    </SecondaryInteract>
                </SecondaryContainer>
            </div>
        )
    }
}