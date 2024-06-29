import "./App.scss";
import './scss/styles.scss'
import {PropsWithChildren} from 'react';

import {Sidebar, Content} from './components';
import {ModInfo, AppProvider} from './components';
import {WinchConfig} from "./components/winchconfig";

export interface IAppState extends PropsWithChildren {
    pathCorrect: boolean | undefined; // no clue
    dredgePath: string | undefined;
    winchInfo: ModInfo | undefined;
    winchConfig: WinchConfig | undefined;
    availableMods: [] | undefined; // All mods in database
    enabledMods: IEnabledStruct | undefined; // All mods enabled
    modInfos: Map<string, ModInfo> | undefined; // All installed mods
    database: ModInfo[] | undefined;
    pageChoice: string; // Choice of page from sidebar
}

interface IEnabledStruct {
    [key: string]: boolean;
}

const App = () => {
    return <AppProvider>
        <div className="app-container text-light">
            <Sidebar/>
            <Content/>
        </div>
    </AppProvider>
}

export default App;

// TODO:
// Allow start of un-modded game via change doorstop_config.ini
// Queue for mod installs