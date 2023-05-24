import React, {Component} from 'react';

import '../scss/mods.scss';
import {ModInfo} from './modinfo'

interface IModsState extends React.PropsWithChildren<any>{
    selected: string;
}

export default class Mods extends Component<{selected: string, modsInfo: ModInfo[], reload: () => void}, IModsState>
{
    constructor(props: any) {
        super(props);

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
                    <ModsSelector selected={this.state.selected} setSelected={this.SetSelectedTab} reload={this.props.reload}>Installed</ModsSelector>
                    <ModsSelector selected={this.state.selected} setSelected={this.SetSelectedTab} reload={this.props.reload}>Available</ModsSelector>
                </div>
                <ModList data={this.props.modsInfo} />
            </div>
        );
    }
}

class ModsSelector extends Component<{selected: string, children: string, setSelected: (n: string) => void, reload: () => void}>
{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <button 
            id={`mods${this.props.children}`} 
            className={this.props.children === this.props.selected ? "selected" : ""} 
            onClick={() => {this.props.setSelected(this.props.children); this.props.reload()}}>
                <label>{this.props.children}</label>
            </button>
        )
    }
}

class ModList extends Component<{data: any}>
{
    constructor(props: any) {
        super(props);
    }

    render() {
        console.log(this.props.data);
        const modData = Object.keys(this.props.data);
        const modList = modData.map((mod) => {return <ModInfoBox key={mod} data={this.props.data[mod]}/>});

        return (
            <div className="mods-installed-list">
                {modList}
            </div>
        )
    }
}

class ModInfoBox extends Component<{data: ModInfo}>
{
    constructor(props: any) {
        super(props);
    }

    render() {
        console.log(this.props.data);
        return (
            <div>
                {this.props.data.ModGUID}
            </div>
        )
    }
}