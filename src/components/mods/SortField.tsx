import React, {useEffect, useState} from 'react';

interface ISortFieldProps {
    sortField: SortType,
    setSortField: (s: SortType) => void,
    sortDirection: SortDirection,
    setSortDirection: (s: SortDirection) => void
}

export const SortField = (props: ISortFieldProps) => {

    const [sortDirection, setSortDirection] = useState<SortDirection>(props.sortDirection);
    const [sortField, setSortField] = useState<SortType>(props.sortField)

    const sortFields = {
        [SortType.DEFAULT] : "Default",
        [SortType.MOD_NAME] : "Mod Name",
        [SortType.AUTHOR] : "Author Name",
        [SortType.DOWNLOADS] : "Downloads",
        [SortType.LATEST_UPDATE] : "Latest Update",
        [SortType.RELEASED] : "Release Date",
    }

    useEffect(() => {
        props.setSortField(sortField);
    }, [sortField])

    useEffect(() => {
        props.setSortDirection(sortDirection);
    }, [sortDirection])

    return <div className={"sorting"}>
        { sortField === "" ? "" :
        <button className={"cancel"} onClick={() => {
            setSortField(SortType.DEFAULT);
        }}>
            <i className={"fa-solid fa-x fa-xs"}></i>
        </button>
        }
        <select name={"sort"} id={"sort"} className={`dropdown ${sortField !== "" ? "active" : ""}`} onChange={(e) => {
            setSortField(e.currentTarget.value as SortType);
        }}
                value={sortField}>
            {Object.keys(sortFields).map((key: string) => {
                return <option value={key}>{sortFields[key as keyof typeof sortFields]}</option>
            })}
        </select>
        <button className={"direction"} onClick={() => {
            setSortDirection(sortDirection === SortDirection.ASCENDING ?
                SortDirection.DESCENDING
                : SortDirection.ASCENDING)
        }}>
            {sortDirection === SortDirection.ASCENDING ?
                <i className={"fa-solid fa-arrow-up-wide-short"}></i>
                : <i className={"fa-solid fa-arrow-down-short-wide"}></i>}
        </button>
    </div>
}

export enum SortType {
    DEFAULT = "",
    MOD_NAME = "Name",
    AUTHOR = "Author",
    DOWNLOADS = "Downloads",
    LATEST_UPDATE = "AssetUpdateDate",
    RELEASED = "ReleaseDate"
}

export enum SortDirection {
    ASCENDING = "ascending",
    DESCENDING = "descending"
}