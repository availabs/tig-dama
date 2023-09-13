import React from "react";

export const DefaultExpandedRow = ({values}) =>
    <div className="flex">
        {values.map(({key, value}, i) =>
            <div key={key || `key-${i}`} className="flex-1">
                {key ? <b>{key}:</b> : null}
                <span className="ml-1">{value}</span>
            </div>
        )
        }
    </div>