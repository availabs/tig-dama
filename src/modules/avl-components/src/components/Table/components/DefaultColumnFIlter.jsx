import {useTheme} from "../../../wrappers";
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
    const theme = useTheme().table();
    return (
        <div className="w-3/4">
            <input className={`${theme.inputSmall} ${filterClassName}`}
                   value={filterValue} onChange={e => setFilter(e.target.value)}
                   onClick={e => e.stopPropagation()}
                   placeholder={filterPlaceholder}/>
        </div>
    )
}
