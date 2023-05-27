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
    data: App | undefined;

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

    debounce_force_update_slow = debounce(() => {this.forceUpdate(); console.log("forced update")}, 1000);

    render() {
        var shownList = new Array<JSX.Element>();

        const app = (this.context as App).state

        const info = app.modInfos;
        const enabled = app.enabledMods;
        const database = app.database;
        var modList = new Array<ModInfo>();
        for (let [k, v] of info!) {
            modList.push(v)
        }
    
        var installedList = new Array<JSX.Element>();
        if (this.props.selected === "Installed") {
            installedList = modList.map((mod) => {
                return <InstalledModBox key={mod.ModGUID} data={mod} enabled={enabled![mod.ModGUID]} update_enabled={(this.context as App).toggle_enabled_mod} uninstall_mod={this.uninstall_mod} install_mod={this.install_mod}/>
            })
        }

        var availableList = new Array<JSX.Element>();
        if (this.props.selected === "Available") {
            availableList = database!.map((mod) => {
                if (!info!.has(mod.ModGUID)) {
                    return <AvailableModBox key={mod.ModGUID} data={mod} install_mod={this.install_mod}/>
                } else {
                return <></>;
                }
            })
        }
        

        if (this.props.selected === "Installed") {
            shownList = installedList;
        } else {
            shownList = availableList;
        }

        return (
            <div className="mods-installed-list">
                {shownList}
            </div>
        )
    }
}

// Yes, this is very inefficient as of right now. This will be refactored once foundations are built.

interface IModBoxState {
    expanded: boolean;
}

interface IInstalledModState extends IModBoxState{
    enabled: boolean;
}

class InstalledModBox extends Component<{data: ModInfo, enabled: boolean | undefined, update_enabled: (a: string, b: boolean) => void, install_mod: (a: ModInfo) => void, uninstall_mod: (p:string) => void}, IInstalledModState>
{
    constructor(props: any) {
        super(props);
        
        this.state = {
            enabled: this.props.enabled ?? false,
            expanded: false,
        }

        this.swap_enabled = this.swap_enabled.bind(this);
        this.swap_expand = this.swap_expand.bind(this);
    }

    swap_enabled() {
        this.props.update_enabled(this.props.data.ModGUID, this.state.enabled)
        this.setState({enabled: !this.state.enabled});
    }

    swap_expand() {
        this.setState({expanded: !this.state.expanded});
    }

    render() {
        console.log(this.props.data);
        console.log(this.state.enabled);
        return (
            <div className="mods-installed-box">
                <div className="box-primary">
                    <label className="primary-details" htmlFor={`expand-${this.props.data.ModGUID}`}>
                        <span className="details-name">{this.props.data.Name || this.props.data.ModGUID}</span>
                        <span className="details-by">{this.props.data.Author ? "by" : ""}</span>
                        <span className="details-author">{this.props.data.Author}</span>
                    </label>
                    <div className="primary-update">
                        { (this.props.data.Repo || false) &&
                        <button 
                        className={`update`}
                        onClick={() => this.props.install_mod(this.props.data)}
                        disabled={this.props.data.Version!.trim() === this.props.data.LatestVersion?.trim()}
                        title={(this.props.data.Version!.trim() === this.props.data.LatestVersion?.trim()) ? "" : this.props.data.LatestVersion}
                        >Update</button>
                        }
                    </div>
                    <div className="primary-switch">
                        <button className={`switch ${this.state.enabled ? "switched" : ""}`} onClick={this.swap_enabled}/>
                    </div>
                    <button className={`primary-expand ${this.state.expanded ? "expanded" : ""}`} onClick={this.swap_expand} id={`expand-${this.props.data.ModGUID}`}/>
                </div>
                <div className={`box-secondary ${this.state.expanded ? "expanded" : ""}`}>
                    <div className="secondary-description">{this.props.data.Description}</div>
                    <div className="secondary-interacts">
                        <button onClick={() => this.props.uninstall_mod(this.props.data.LocalPath!)}>Uninstall</button>
                        <button onClick={this.swap_enabled}>{this.state.enabled ? "Disable" : "Enable"}</button>
                    </div>
                </div>
            </div>
        )
    }
}

interface IAvailableModState extends IModBoxState{
    installed: boolean;
}

class AvailableModBox extends Component<{data: ModInfo, install_mod: (a: ModInfo) => void}, IAvailableModState>
{
    constructor(props: any) {
        super(props);
        
        this.state = {
            expanded: false,
            installed: false,
        }

        this.swap_expand = this.swap_expand.bind(this);
    }

    swap_expand() {
        this.setState({expanded: !this.state.expanded});
    }

    render() {
        var installText = "Install";
        if (this.state.installed) {
            installText = "Installed";
        }

        return (
            <div className="mods-available-box">
                <div className="box-primary">
                    <label className="primary-details" htmlFor={`expand-${this.props.data.ModGUID}`}>
                        <span className="details-name">{this.props.data.Name || this.props.data.ModGUID}</span>
                        <span className="details-by">{this.props.data.Author ? "by" : ""}</span>
                        <span className="details-author">{this.props.data.Author}</span>
                    </label>
                    <button className={`primary-expand ${this.state.expanded ? "expanded" : ""}`} onClick={this.swap_expand} id={`expand-${this.props.data.ModGUID}`}/>
                </div>
                <div className={`box-secondary ${this.state.expanded ? "expanded" : ""}`}>
                    <div className="secondary-description">{this.props.data.Description}</div>
                    <div className="secondary-interacts">
                        <button onClick={() => {
                            this.props.install_mod(this.props.data);
                            this.setState({installed: true});
                            }}>{installText}</button>
                    </div>
                </div>
            </div>
        )
    }
}