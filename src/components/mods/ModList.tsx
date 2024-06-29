import React, {useContext, useEffect, useReducer, useState} from "react";
import {AppContext} from "../appcontext";
import {ModInfo} from "../modinfo";
import {debounce} from "lodash";
import {InstalledMod} from "./InstalledMod";
import {AvailableMod} from "./AvailableMod";
import {ModsNotFound} from "./ModsNotFound";
import {Search} from "./SearchField";

export const ModList = (props: {selected: string}) => {
    const context = useContext(AppContext)

    const [searchQuery, setSearchQuery] = useState("");

    // https://legacy.reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
    const [_, forceUpdate] = useReducer((x) => x + 1, 0);

    const debouncedForceUpdate = debounce(() => {forceUpdate()}, 500)

    useEffect(() => {
        debouncedForceUpdate()
    }, [])

    useEffect(() => {
        setSearchQuery("");
    }, [props.selected]);

    const uninstallMod = (path: string) => {
        context!.uninstallMod(path)
        debouncedForceUpdate()
    }

    const installMod = (mod: ModInfo) => {
        context!.installMod(mod)
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

    const filterMods = (mods: ModInfo[], query: string) => {
        let filtered: ModInfo[] = [];

        query = query.toLowerCase();

        if (searchQuery === "" || searchQuery === undefined) {
            return mods;
        }

        const tryCompare = (query: string, str?: string) => {
            if (str === undefined) return false;
            return str.toLowerCase().includes(query);
        }

        filtered = mods.filter((mod) => {
            if (tryCompare(query, mod.Name)) return true;

            if (tryCompare(query, mod.Author)) return true;

            if (tryCompare(query, mod.Description)) return true;

            return false;
        })

        return filtered;
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
            const filteredMods = filterMods(modList, searchQuery);
            installedList = filteredMods.sort((m1, m2) => sortMod((enabled as {[key: string]: boolean}), m1, m2)).map((mod) => {
                return <InstalledMod
                    key={mod.ModGUID}
                    data={mod}
                    enabled={enabled![mod.ModGUID]}
                    uninstallMod={uninstallMod}
                    installMod={installMod}
                    updateEnabled={context!.toggleEnabledMod}
                    openModDir={context!.openModDir}/>
            })
        }

        if (props.selected === "Available") {
            const filteredMods = filterMods(database!, searchQuery);
            availableList = filteredMods.map((mod) => {
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

    return <>
        <div className={"mods-filter"}>
            <Search defaultValue={searchQuery} updateValue={setSearchQuery} />
            <div>

            </div>
        </div>
        <div className="mods-list">
            {shownList}
        </div>
    </>
}