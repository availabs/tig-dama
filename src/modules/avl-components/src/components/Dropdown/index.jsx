import React from "react"

// // WARNING: this hook will only work if the setNode is set to a DOM element, e.g. div, input, etc., not a React element!!!
// To use this with a React Functional Component, you must use Ref Forwarding: https://reactjs.org/docs/forwarding-refs.html
export const useClickOutside = handleClick => {
  const [node, setNode] = React.useState(null);

  React.useEffect(() => {
    const checkOutside = e => {
      if (node.contains(e.target)) {
        return;
      }
      (typeof handleClick === "function") && handleClick(e);
    }
    node && document.addEventListener("mousedown", checkOutside);
    return () => document.removeEventListener("mousedown", checkOutside);
  }, [node, handleClick])

  return [setNode, node];
}

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

