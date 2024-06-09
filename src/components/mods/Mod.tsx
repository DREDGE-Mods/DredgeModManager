import {useCallback, useState} from "react";
import {ModInfo} from "../modinfo";

export interface IModProps {
    data: ModInfo,
    installMod: (a: ModInfo) => void
}

// hook to handle the 'expanded' state and flipping it;
// exact same logic is used in available & installed mod components so wanted to centralize it
export const useModExpand = (initialState?: boolean) => {
    const [expanded, setExpanded] = useState(initialState ?? false);

    const swapExpanded = useCallback(() => {
        setExpanded(expanded => !expanded);
    }, [])

    return {
        expanded,
        swapExpanded
    }
}