import React, {useContext, useEffect, useReducer, useState} from "react";
import {AppContext} from "../appcontext";
import {ModInfo} from "../modinfo";
import {debounce} from "lodash";
import {InstalledMod} from "./InstalledMod";
import {AvailableMod} from "./AvailableMod";
import {ModsNotFound} from "./ModsNotFound";
import {Search} from "./SearchField";
import {SortDirection, SortField, SortType} from "./SortField";

export const ModList = (props: {selected: string, searchQuery: string, setSearchQuery: (selected: string) => void,
    sortField : SortType, setSortField: (selected : SortType) => void, 
    sortDirection : SortDirection, setSortDirection: (selected : SortDirection) => void
}) => {
    const context = useContext(AppContext)
    const defaultSortField = SortType.MOD_NAME;

    // https://legacy.reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
    const [_, forceUpdate] = useReducer((x) => x + 1, 0);

    const debouncedForceUpdate = debounce(() => {forceUpdate()}, 500)

    useEffect(() => {
        debouncedForceUpdate()
    }, [])

    const uninstallMod = (path: string) => {
        context!.uninstallMod(path)
        debouncedForceUpdate()
    }

    const installMod = (mod: ModInfo) => {
        context!.installMod(mod)
        debouncedForceUpdate()
    }

    const sortByEnabled = (enabled: {[key: string]: boolean}, mod1: ModInfo, mod2: ModInfo) => {
        if (mod1.ModGUID == "hacktix.winch") return -1;
        if (mod2.ModGUID == "hacktix.winch") return 1;

        let mod1Enabled = enabled[mod1.ModGUID]
        let mod2Enabled = enabled[mod2.ModGUID]

        // Sort by download count
        // Keep all enabled mods at the top
        if (mod1Enabled === mod2Enabled) {
            return 0;
        }
        else {
            return mod1Enabled ? -1 : 1;
        }
    }

    const filterMods = (mods: ModInfo[], query: string) => {
        let filtered: ModInfo[] = [];

        query = query.toLowerCase();

        if (props.searchQuery === "" || props.searchQuery === undefined) {
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

    const sortByAttribute = (
        mod1: ModInfo,
        mod2: ModInfo,
        sortField: SortType,
        sortDirection: SortDirection,
        flag?: boolean): number => {

        if (sortField == SortType.DEFAULT) {
            if (mod1.ModGUID == "hacktix.winch") return -1;
            if (mod2.ModGUID == "hacktix.winch") return 1;
        }

        let parameter1 = mod1[sortField as keyof ModInfo];
        let parameter2 = mod2[sortField as keyof ModInfo];

        if (parameter1 === undefined
            || parameter2  === undefined
            || parameter1 === null
            || parameter2 === null) {
            return 1;
        }

        if (parameter1 > parameter2) {
            return (sortDirection === SortDirection.ASCENDING ? -1 : 1)
        } else if (parameter1 < parameter2) {
            return (sortDirection === SortDirection.ASCENDING ? 1 : -1)
        } else {
            if (flag) return 0;
            // where equal, sort by downloads unless already sorting by downloads
            let secondarySortField = SortType.DOWNLOADS;
            if (sortField === SortType.DOWNLOADS) {
                secondarySortField = SortType.MOD_NAME;
            }
            return sortByAttribute(mod1, mod2, secondarySortField, SortDirection.ASCENDING, true);
        }
    }

    const sortMods = (mods: ModInfo[], sortField: SortType, sortDirection: SortDirection) => {
        let sorted: ModInfo[] = mods;

        // Only when doing default sort do we push enabled and Winch to the top
        let flagSortByEnabled = sortField === SortType.DEFAULT;

        if (sortField === SortType.DEFAULT) sortField = defaultSortField;

        sorted = sorted.sort((m1, m2) => sortByAttribute(m1, m2, sortField, sortDirection));

        if (flagSortByEnabled) {
            sorted = sorted.sort((m1, m2) => sortByEnabled((enabled as {[key: string]: boolean}), m1, m2));
        }

        return sorted;
    }

    const filterSortMods = (mods: ModInfo[], query: string, sortField: SortType, sortDirection: SortDirection) => {

        const filtered = filterMods(mods, query);

        const sorted = sortMods(filtered, sortField, sortDirection);

        return sorted;
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
            const filteredMods = filterSortMods(modList, props.searchQuery, props.sortField, props.sortDirection);
            installedList = filteredMods.map((mod) => {
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
            const filteredMods = filterSortMods(database!, props.searchQuery, props.sortField, props.sortDirection);
            availableList = filteredMods.map((mod) => {
                if (!info!.has(mod.ModGUID)) {
                    return <AvailableMod
                        key={mod.ModGUID}
                        data={mod}
                        installMod={installMod}/>
                } return
            }).filter(x => x) // remove null
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

    if (shownList.length === 0) {
        shownList = [
            <ModsNotFound key={"mods-not-found"}
                          reload={debouncedForceUpdate}
                          installed={props.selected === "Installed"}
                          query={props.searchQuery}
            />
        ]
    }

    return <>
        <div className={"mods-filter"}>
            <Search defaultValue={props.searchQuery} updateValue={props.setSearchQuery} />
            <SortField sortField={props.sortField} setSortField={props.setSortField}
                       sortDirection={props.sortDirection} setSortDirection={props.setSortDirection} />
        </div>
        <div className="mods-list">
            {shownList}
        </div>
    </>
}