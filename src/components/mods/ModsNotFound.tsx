import React from "react";

import '../../scss/mods/modsNotFound.scss'

interface IModsNotFoundProps {
    reload: () => void,
    installed: boolean
}

export const ModsNotFound = (props: IModsNotFoundProps) => {
    return <div className="mods-not-found">
        {props.installed ?
            <span className="info">Oh no! Looks like you've not got any mods, check out the Available tab!</span>
            :
            <span className="info">You have installed all mods currently available on the database. Check back another time to see if there are more!</span>
        }
        <div className="reload">
            Think that's wrong?
            <button onClick={props.reload}>Reload</button>
        </div>
    </div>
}