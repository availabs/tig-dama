import React from "react"

import { useClickOutside } from "../utils"
// import { useTheme } from "../../wrappers/with-theme"

const Dropdown = ({ control, children, className, openType='hover' }) => {
    const [open, setOpen] = React.useState(false),
        clickedOutside = React.useCallback(() => setOpen(false), []),
        [setRef] = useClickOutside(clickedOutside);
        // console.log('openType', openType)
    return (
        <div ref={ setRef }
             className={`h-full relative cursor-pointer ${className}` }
             onMouseEnter={ e => {
                if(openType === 'hover') {
                 setOpen(true)
                }
            }}
            onMouseLeave={ e => setOpen(false) }
            onClick={ e => {
                 //e.preventDefault();
                 setOpen(!open)
             } }
        >
            {control}
            {open ?
                <div className={ `shadow fixed w-full max-w-[200px] rounded-b-lg ${open ? `block` : `hidden`} z-10` }>
                    { children }
                </div> : ''
                
            }
        </div>
    )
}

export default Dropdown

