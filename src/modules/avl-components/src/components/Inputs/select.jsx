import React, {
  useEffect,
  useState,
  useCallback,
  // KeyboardEvent,

} from "react";

import Input from "./input";
import { hasValue } from "./utils";
// import { ValueContainer } from "./parts";

import { useTheme } from "../../wrappers/with-theme";

import isEqual from "lodash/isEqual";
import get from "lodash/get";
import { matchSorter } from "match-sorter";


export const ValueItem = ({ isPlaceholder, children, remove, edit, disabled = false , themeOptions}) => {
  const theme = useTheme()['select'](themeOptions);

  return (
    <div className={ `
        ${ isPlaceholder ? theme.textLight :
          `${ disabled ? theme.accent2 : (!(remove || edit) ? "" : theme.menuBgActive) }
            mr-1 pl-2 ${ (!disabled && (remove || edit)) ? "pr-1" : "pr-4" }
          ` }
        ${theme.itemText}
         flex items-center max-w-full
      ` }>
      <span className={theme.valueItem}>{ children }</span>
      { isPlaceholder || disabled || !edit ? null :
        <div className={ `
            ${ theme.menuBgActive } ${ theme.menuBgActiveHover } ${ theme.textContrast }
            ml-2 p-1 flex justify-center items-center rounded cursor-pointer
          ` }
          onClick={ edit }>
          <svg width="8" height="8">
            <line x1="0" y1="6" x2="4" y2="2" style={ { stroke: "currentColor", strokeWidth: 2 } }/>
            <line x1="4" y1="2" x2="8" y2="6" style={ { stroke: "currentColor", strokeWidth: 2 } }/>
          </svg>
        </div>
      }
      { isPlaceholder || disabled || !remove ? null :
        <div className={ `
            ${ theme.menuBgActive } ${ theme.menuBgActiveHover } ${ theme.textContrast }
            ${ edit ? "ml-1" : "ml-2" } p-1 flex justify-center items-center rounded cursor-pointer
          ` }
          onClick={ remove }>
          <svg width="8" height="8">
            <line x2="8" y2="8" style={ { stroke: "currentColor", strokeWidth: 2 } }/>
            <line y1="8" x2="8" style={ { stroke: "currentColor", strokeWidth: 2 } }/>
          </svg>
        </div>
      }
    </div>
  )
}

const Dropdown = React.forwardRef(
  ({ children, searchable, opened, direction, themeOptions={} }, ref) => {
    const theme = useTheme()['select'](themeOptions);
    return (
      <div
        className={`
      absolute left-0 z-40 overflow-hidden min-w-full
      ${opened ? "block" : "hidden"}
    `}
        style={direction === "down" ? { top: "100%" } : { bottom: "100%" }}
        ref={ref}
      >
        <div className={`${theme.menuWrapper}`}>
          {children}
        </div>
      </div>
    );
  }
);

// const DropdownItem = ({ children, isActive, themeOptions={}, ...props }) => {
//   const theme = useTheme()['select'](themeOptions);
//   return (
//     <div
//       {...props}
//       className={`
//         ${
//           isActive
//             ? `${theme.menuItemActive}`
//             : `${theme.menuItem}`
//         }
//       `}
//     >
//       {children}
//     </div>
//   );
// };

const Identity = (i) => i;

const Select = (props) => {
  const {
    multi = false,
    searchable = false,
    domain = [],
    options = [],
    value = null,
    placeholder = "Select a value...",
    accessor = Identity,
    // displayAccessor = null,
    listAccessor = null,
    // id = "avl-select",
    autoFocus = false,
    disabled = false,
    removable = false,
    themeOptions = {},
    onChange= Identity,
    valueAccessor = Identity,
    className = ''
  } =  props;

  //console.log('what is the theme', useTheme())
  const theme = useTheme()['select'](themeOptions);
  // console.log('do I crash?')
  const node = React.useRef();
  const vcNode = React.useRef();
  const dropdown = React.useRef();
  const optionRefs = React.useRef([])

  const [opened, setOpened] = useState(false)
  const [direction, setDirection] = useState('down')
  const [/*hasFocus*/, setHasFocus] = useState(false)
  const [search, setSearch] = useState('')
  // const [optionFocus, setOptionFocus] = useState(false)



  const openDropdown = (e) => {
    e.stopPropagation();
    setOpened(true)
    setHasFocus(true)
  };

  const closeDropdown = (e) => {
    opened && vcNode && vcNode.current.focus();
    setOpened(false)
  };



  const focus = () => {
    vcNode && vcNode.focus();
  }

  useEffect(() => {
    autoFocus && focus();
  },[autoFocus])

  useEffect(() => {
     const closeDropdownEffect = (e) => {
        opened && vcNode && vcNode.current.focus();
        setOpened(false)
      };

    const checkOutside = (e) => {
      if (node && node.current && node.current.contains(e.target)) {
        return;
      }
      closeDropdownEffect();
    };

    document.addEventListener("mousedown", checkOutside);
    if (dropdown && dropdown.current && opened && direction === "down") {
      const rect = dropdown.current.getBoundingClientRect();
      if (rect.top + rect.height > window.innerHeight) {
        setDirection("up");
      }
    }
    return () => {document.removeEventListener("mousedown", checkOutside)};
  },[ direction, opened])
  /*componentWillUnmount() {

  }*/

  const getValues = () => {
    let values = [];

    if (!hasValue(value)) return [];

    if (!Array.isArray(value)) {
      values = [value];
    } else {
      values = value;
    }
    return getOptions().filter(option => {
      // return values.includes(this.props.valueAccessor(option));
      return values.reduce((a, c) => {
        return a || isEqual(valueAccessor(option), c);
      }, false)
    });
  }

  const addItem = (e, v) => {
    e.stopPropagation();
    closeDropdown();

    v = valueAccessor(v);

    if (multi) {
      if (!hasValue(value)) {
        onChange([v]);
      } else if (
        value.reduce((a, c) => a && !isEqual(c, v), true)
      ) {
        onChange([...value, v]);
      }
    } else {
      onChange(v);
    }
  }
  const removeItem = (e, v) => {
    e.stopPropagation();
    v = valueAccessor(v);
    if (multi) {
      onChange(value.filter((d) => !isEqual(d, v)));
    } else {
      onChange(null);
    }
  }

  const getOptions = () => {
    return options.length ? options : domain;
  }

  let handleKeyDown = useCallback((e)=>{
      switch (e.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

        case 'Space':
        case 'Enter':
        case 'ArrowDown':
          e.preventDefault()
          if(!opened) {
            setOpened(true)
          }
          // console.log('set option focus', optionRefs)

          if(optionRefs[0] && optionRefs[0].current) {
            optionRefs[0].current.focus()
          }
          // d.nextFrame(() => {
          //   if (!state.propsRef.current.value)
          //     dispatch({ type: ActionTypes.GoToOption, focus: Focus.First })
          // })
          break

        case 'ArrowUp':
          e.preventDefault()
          if(!opened) {
            setOpened(true)
          }
          if(optionRefs[0] && optionRefs[0].current) {
            // console.log('set option focus',  optionRefs[0].current, optionRefs)
            optionRefs[0].current.focus()
          }
          break

        case 'Escape':
          e.preventDefault()
          e.stopPropagation()
          if(opened) {
            setOpened(false)
          }
          break

        // case 'Tab':
        //   e.preventDefault()
        //   e.stopPropagation()
        //   break
        default:
          break

      }

  },[opened])

  const values = getValues()
  const _options = getOptions()
  let activeOptions = _options.filter((d) => values.includes(d))
  const uselistAccessor = listAccessor || accessor
  const viewOptions = !search
        ? _options
        : matchSorter(_options, search, { keys: [uselistAccessor] });

  return (
    <div
      ref={node}
      onMouseLeave={(e) => closeDropdown()}
    >
      <div className="cursor-pointer">
        <div
            id={props.id}
            ref={vcNode}
            onBlur={(e) => setHasFocus(false)}
            onFocus={(e) => setHasFocus(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onClick={openDropdown}
            className={`${theme.select} ${className}`}>

            <div className='w-11/12 overflow-x-hidden'>
              {values.length ? (
                values.map((v, i, a) => (
                  <ValueItem
                    key={i}
                    disabled={disabled}
                    themeOptions={themeOptions}
                    remove={
                      removable ? (e) => removeItem(e, v) : null
                    }
                  >
                    {accessor(v, a)}
                  </ValueItem>
                ))
              ) : (
                <ValueItem key="placeholder" isPlaceholder={true} themeOptions={themeOptions}>
                  {placeholder}
                </ValueItem>
              )}
            </div>
          <div className={`${theme.selectIcon}`}/>
        </div>

      </div>
      <div className='relative'>
      {disabled || !opened ? null : (
        <Dropdown
          opened={opened}
          direction={direction}
          searchable={searchable}
          ref={dropdown}
          themeOptions={themeOptions}
        >
          {!searchable ? null : (
            <div className="p-2 pt-1 w-full">
              <Input
                type="text"
                autoFocus
                placeholder="search..."
                className="w-full"
                value={search}
                onChange={(v) => setSearch(v)}
              />
            </div>
          )}
          {!viewOptions.length ? (
            <div className="p-1 text-center">No Selections</div>
          ) : (
            <div
              className="scrollbar overflow-y-auto"
              style={{ maxHeight: "15rem" }}
            >
              {viewOptions.map((d, i) => (
                <div
                  ref={(element) => optionRefs.current.push(element)}
                  key={`${accessor(d)}-${i}`}
                  onClick={
                    activeOptions.includes(d)
                      ? (e) => e.stopPropagation()
                      : (e) => addItem(e, d)
                  }
                  className={`${
                    activeOptions.includes(d)
                      ? `${theme.menuItemActive}`
                      : `${theme.menuItem}`
                  }`}
                >
                  {get(d, "OptionComponent") ? (
                    <d.OptionComponent option={d} />
                  ) : (
                    uselistAccessor(d)
                  )}
                </div>
              ))}
            </div>
          )}
        </Dropdown>
      )}
      </div>
    </div>
  );

}
export default Select;
