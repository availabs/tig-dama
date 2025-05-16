import {useTheme} from "../../../wrappers";
import defaultTheme from '../defaultTheme'
import React from "react";

export const DefaultColumnFilter = ({column}) => {
    const {
        filterValue = "",
        // preFilteredRows,
        setFilter,
        filterPlaceholder = "Search...",
        filterClassName = "",
    } = column;
    // count = preFilteredRows.length;
    const theme = typeof useTheme === 'function' && useTheme()?.table ? useTheme().table() : defaultTheme();

    return (
        <div className="w-3/4">
            <input className={`${theme.inputSmall} ${filterClassName}`}
                   value={filterValue} onChange={e => setFilter(e.target.value)}
                   onClick={e => e.stopPropagation()}
                   placeholder={filterPlaceholder}/>
        </div>
    )
}
