import React, {Component} from 'react';

import '../scss/sidebar.scss'

interface ISidebarState {
    choice: string;
    start: () => void;
}

export default class Sidebar extends Component<{choice: string, start: () => void, setPage: (p: string) => void}, ISidebarState>
{
    data: Array<Record<string, any>>;

    constructor(props: any) {
        super(props);

        this.data = [
            {
                name: "Mods",
            },
            {
                name: "Settings",
            }
        ];

        this.state = {
            choice: this.props.choice,
            start: this.props.start
        };

        this.SetActiveOption = this.SetActiveOption.bind(this);
    }

    SetActiveOption(option: string) {
        this.setState({choice:option});
        this.props.setPage(option);
    }

    render() {
        return (
            <div className="sidebar-container">
                <div className="sidebar-options-container">
                    {
                    this.data.map((item, index) => {
                        return <SidebarOption name={item.name} index={index} selected={this.state.choice} func={this.SetActiveOption} key={index}/>
                    })}
                </div>
                <SidebarPlay start={this.props.start}/>
            </div>
        );
    }
}

class SidebarOption extends Component<{name: string, index: number, selected: string, func: (n: string) => void}>
{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="sidebar-option-container">
                <button 
                className={`sidebar-option ${(this.props.selected === this.props.name) ? "selected" : ""}`} 
                id={`sidebarOption${this.props.index}`} 
                onClick={() => {this.props.func(this.props.name)}}>
                    <div className="sidebar-option-text">
                        {this.props.name}
                    </div>
                </button>
            </div>
        )
    }
}

// Fill in onclick with {this.props.start} once not in-dev,
// Don't want to be starting the game constantly while testing.
class SidebarPlay extends Component<{start: () => void}>
{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="sidebar-play-container">
                <div className="sidebar-play">
                    <button className="sidebar-play-main" id="play-main" onClick={this.props.start}>
                        <label htmlFor="play-main">play</label>
                    </button>
                    <button className="sidebar-play-alt" id="play-alt">
                        <label htmlFor="play-alt"></label>
                    </button>
                </div>
            </div>
        )
    }
}