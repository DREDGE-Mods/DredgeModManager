import React from "react";

import '../../scss/mods/modsNotFound.scss'

interface IModsNotFoundProps {
    reload: () => void,
    installed: boolean,
    query: string
}

export const ModsNotFound = (props: IModsNotFoundProps) => {

    let renderContent = props.installed ?
        <span className="info">Oh no! Looks like you've not got any mods, check out the Available tab!</span>
        : <span className="info">You have installed all mods currently available on the database. Check back another time to see if there are more!</span>

    if (props.query !== "") {
        renderContent = <span className={"info"}>
            No mods match the specified query.
        </span>
    }

    return <div className="mods-not-found">
        {renderContent}
        <div className="reload">
            Think that's wrong?
            <button onClick={props.reload}>Reload</button>
        </div>
    </div>
}