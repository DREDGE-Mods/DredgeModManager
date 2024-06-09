import React, { useContext, useEffect, useReducer } from "react";
import {AppContext} from "../appcontext";
import {ModInfo} from "../modinfo";
import {debounce} from "lodash";
import {InstalledMod} from "./InstalledMod";
import {AvailableMod} from "./AvailableMod";
import {ModsNotFound} from "./ModsNotFound";

export const ModList = (props: {selected: string}) => {
    const context = useContext(AppContext)

    // https://legacy.reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
    const [_, forceUpdate] = useReducer((x) => x + 1, 0);

    const debouncedForceUpdate = debounce(() => {forceUpdate()}, 500)

    useEffect(() => {
        debouncedForceUpdate()
    }, [])

    const uninstallMod = (path: string) => {
        context!.uninstall_mod(path)
        debouncedForceUpdate()
    }

    const installMod = (mod: ModInfo) => {
        context!.install_mod(mod)
        debouncedForceUpdate()
    }

    const sortMod = (enabled: {[key: string]: boolean}, mod1: ModInfo, mod2: ModInfo) => {
        if (mod1.ModGUID == "hacktix.winch") return -1;
        if (mod2.ModGUID == "hacktix.winch") return 1;

        let mod1Enabled = enabled[mod1.ModGUID]
        let mod2Enabled = enabled[mod2.ModGUID]

        // Sort by download count
        // Keep all enabled mods at the top
        if (mod1Enabled == mod2Enabled) {
            if ((mod1.Downloads ?? 0) > (mod2.Downloads ?? 0)) {
                return -1;
            }
            else {
                return 1;
            }
        }
        else {
            return mod1Enabled ? -1 : 1;
        }
    }

    let availableList = new Array<React.ReactNode>()
    let installedList = new Array<React.ReactNode>()

    const app = context!.state

    const info = app.modInfos
    const enabled = app.enabledMods
    const database = app.database

    let modList = Array.from(info!.values())

    if (database !== undefined) {
        // Make sure winch is always at the top of all lists
        let index = modList.findIndex(mod => mod.ModGUID == "hacktix.winch");
        if (index != -1) {
            modList.unshift(modList.splice(index, 1)[0]);
        }

        index = database.findIndex(mod => mod.ModGUID == "hacktix.winch");
        if (index != -1) {
            database.unshift(database.splice(index, 1)[0]);
        }

        if (props.selected === "Installed") {
            // not keen on cyclic dependency of IEnabledStruct, but also want to avoid usage of 'any' in sortMod
            // so casting to exact same definition as IEnabledStruct to use
            installedList = modList.sort((m1, m2) => sortMod((enabled as {[key: string]: boolean}), m1, m2)).map((mod) => {
                return <InstalledMod
                    key={mod.ModGUID}
                    data={mod}
                    enabled={enabled![mod.ModGUID]}
                    uninstallMod={uninstallMod}
                    installMod={installMod}
                    updateEnabled={context!.toggle_enabled_mod}
                    openModDir={context!.open_mod_dir}/>
            })
        }

        if (props.selected === "Available") {
            availableList = database!.map((mod) => {
                if (!info!.has(mod.ModGUID)) {
                    return <AvailableMod
                        key={mod.ModGUID}
                        data={mod}
                        installMod={installMod}/>
                } return
            })
        }
    }

    let shownList = availableList

    if (props.selected === "Installed") {
        // #6 Prompt user to install Winch if it is not installed
        if (modList.findIndex(mod => mod.ModGUID == "hacktix.winch") == -1) {
            return <div className="mods-not-found">
                    All mods require the Winch modloader to be installed. Download it in the "Available" tab.
                </div>
        }
        shownList = installedList;
    }

    if (shownList.length === 0)
        shownList = [
            <ModsNotFound key={"mods-not-found"}
                          reload={debouncedForceUpdate}
                          installed={props.selected === "Installed"}/>
        ]

    return <div className="mods-list">
            {shownList}
        </div>
}