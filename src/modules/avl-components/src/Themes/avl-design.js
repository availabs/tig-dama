const avl_design = (colorname, size) => {

    //const bg = 'gray-50'
    const primary = 'gray'
    const highlight = 'white'
    const accent = 'blue'
    //const secondary =  'green'

    return {
        sidenav: (opts = {}) => {
            const {color = 'white', size = 'compact',  subMenuStyle = 'inline'} = opts

            let colors = {
                white: {
                    contentBg: `bg-${highlight}`,
                    contentBgAccent: `bg-neutral-100`,
                    accentColor: `${accent}-600`,
                    accentBg: `hover:bg-${accent}-400`,
                    borderColor: `border-${primary}-100`,
                    textColor: `text-${primary}-600`,
                    textColorAccent: `text-slate-800`,
                    highlightColor: `text-${primary}-800`,
                },
                dark: {
                    contentBg: `bg-neutral-800`,
                    contentBgAccent: `bg-neutral-900`,
                    accentColor: `white`,
                    accentBg: ``,
                    borderColor: `border-neutral-700`,
                    textColor: `text-slate-300`,
                    textColorAccent: `text-slate-100`,
                    highlightColor: `text-${highlight}`,
                },
                bright: {
                    contentBg: `bg-${accent}-700`,
                    accentColor: `${accent}-400`,
                    accentBg: `hover:bg-${accent}-400`,
                    borderColor: `border-${accent}-600`,
                    textColor: `text-${highlight}`,
                    highlightColor: `text-${highlight}`,
                }
            }

            let sizes = {

                compact: {
                    width: '44',
                    wrapper: "w-44",
                    sideItem: "flex mx-2 pr-4 py-2 text-base hover:pl-2",
                    topItem: "flex items-center text-sm px-4 border-r h-12",
                    icon: "mr-3 text-lg",
                },
                full: {
                    width: "64",
                    wrapper: "w-64",
                    sideItem: "flex mx-4 pr-4 py-4 text-base font-base border-b hover:pl-4",
                    topItem: "flex pr-4 py-2 text-sm font-light",
                    icon: "mr-4 text-2xl",
                },
                mini: {
                    width: "20",
                    wrapper: "w-20 overflow-x-hidden",
                    sideItem: "flex pr-4 py-4 text-base font-base border-b",
                    topItem: "flex px-4 items-center text-sm font-light ",
                    icon: "w-20 mr-4 text-5xl",
                },
                micro: {
                    width: "14",
                    wrapper: "w-14 overflow-x-hidden",
                    sideItem: "flex pr-4 py-4 text-base font-base border-b",
                    topItem: "flex mx-6 pr-4 py-2 text-sm font-light",
                    icon: "w-14 mr-4 text-2xl",
                    sideItemContent: 'hidden'
                },
                none: {
                    width: "0",
                    wrapper: "w-0 overflow-hidden",
                    sideItem: "flex mx-2 pr-4 py-2 text-base hover:pl-2",
                    topItem: "flex items-center text-sm px-4 border-r h-12",
                    icon: "mr-3 text-lg",
                },

            }

            let subMenuStyles = {
                inline: {
                    indicatorIcon: 'os-icon os-icon-arrow-down',
                    subMenuWrapper: `ml-3 flex flex-col`,
                    subMenuParentWrapper: `flex flex-col`
                },
                flyout: {
                    indicatorIcon: 'os-icon os-icon-arrow-right2',
                    subMenuWrapper: `absolute ml-${sizes[size].width - 8}`,
                    subMenuParentWrapper: `flex flex-row`,
                    subMenuWrapperTop: `absolute top-full`,
                },
            }
            return {
                contentBg: `${colors[color].contentBg}`,
                contentBgAccent: `${colors[color].contentBgAccent}`,
                logoWrapper: `${sizes[size].wrapper} ${colors[color].contentBgAccent} ${colors[color].textColorAccent}`,
                sidenavWrapper: `${colors[color].contentBg} ${sizes[size].wrapper} h-full hidden md:block z-20`,
                menuIconSide: `text-${colors[color].accentColor} ${sizes[size].icon} group-hover:${colors[color].highlightColor}`,
                menuIconClosed: `fa fa-bars p-3 cursor-pointer`,
                menuIconOpen: `fa fa-cancel`,
                itemsWrapper: `p-4 border-t ${colors[color].borderColor} ${sizes[size].wrapper}`,
                navitemSide: ` 
	            group font-sans flex flex-col
	            ${sizes[size].sideItem} ${colors[color].textColor} ${colors[color].borderColor} 
	            hover:${colors[color].highlightColor} 
	            focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
	            transition-all cursor-pointer
	         `,

                navitemSideActive: `
	            group font-sans flex flex-col w-full
	            ${sizes[size].sideItem} ${colors[color].textColor} ${colors[color].borderColor} 
	            hover:${colors[color].highlightColor} 
	            focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
	            transition-all cursor-pointer
	          `,
                ...subMenuStyles[subMenuStyle],
                vars: {
                    color: colors,
                    size: sizes,
                    subMenuStyle: subMenuStyles
                }
            }
        },

        /* -----
         Top Nav Theme Components Minimal
          ------*/
        topnav: (opts = {}) => {
            const {color = 'white', size = 'compact'} = opts

            let colors = {
                white: {
                    contentBg: `bg-${highlight}`,
                    accentColor: `${accent}-600`,
                    accentBg: `hover:bg-${accent}-600`,
                    borderColor: `border-${primary}-100`,
                    textColor: `text-${primary}-600`,
                    highlightColor: `text-${highlight}`,
                },
                bright: {
                    contentBg: `bg-${accent}-700`,
                    accentColor: `${accent}-400`,
                    accentBg: `hover:bg-${accent}-400`,
                    borderColor: `border-${accent}-600`,
                    textColor: `text-${highlight}`,
                    highlightColor: `text-${highlight}`,
                }
            }
            let sizes = {
                compact: {
                    wrapper: "h-12",
                    topItem: "flex items-center text-sm px-4 border-r h-12",
                    icon: "mr-3 text-lg",
                },
                full: {
                    wrapper: "h-16",
                    topItem: "flex px-4 py-5 text-base font-light h-16",
                    icon: "mr-4 -py-2 text-2xl",
                },
            }


            return {
                topnavWrapper: `w-full ${colors[color].contentBg} ${sizes[size].wrapper} `,
                topnavContent: `flex w-full h-full`,
                topnavMenu: `hidden md:flex flex-1 h-full overflow-x-auto overflow-y-hidden scrollbar-sm`,
                menuIconTop: `text-${colors[color].accentColor} ${sizes[size].icon} group-hover:${colors[color].highlightColor}`,
                menuOpenIcon: `os-icon os-icon-menu`,
                menuCloseIcon: `os-icon os-icon-x`,
                navitemTop: `
				    group font-sans 
				    ${sizes[size].topItem} ${colors[color].textColor} ${colors[color].borderColor} 
				    ${colors[color].accentBg} hover:${colors[color].highlightColor} 
				    focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
				    transition cursor-pointer
				`,
                //`px-4 text-sm font-medium tracking-widest uppercase inline-flex items-center  border-transparent  leading-5 text-white hover:bg-white hover:text-darkblue-500 border-gray-200 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out h-full`,
                topmenuRightNavContainer: "hidden md:block h-full",
                navitemTopActive:
                    `
					group font-sans
		    		${sizes[size].topItem} ${colors[color].textColor} ${colors[color].borderColor} 
		    		${colors[color].accentBg} hover:${colors[color].highlightColor} 
		    		focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
		    		transition cursor-pointer
		    	`,
                mobileButton:
                    "md:hidden bg-white inline-flex items-center justify-center p-2  text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300",
                vars: {
                    color: colors,
                    size: sizes
                }
            }

        },

        select: (opts = {}) => {
            const {color = 'white', size = 'full', wrapStyle = 'no-wrap'} = opts

            let colors = {
                white: 'white',
                transparent: 'gray-100'
            }

            let sizes = {
                mini: 'px-0 py-0',
                compact: 'px-0 py-1',
                full: 'px-4 py-2'
            }

            let wrapStyles = {
                'no-wrap': 'overflow-x-hidden',
                'wrap': 'whitespace-normal'
            }

            return {
                menuWrapper: `bg-${colors[color]} my-1 text-sm`,
                menuItemActive: `px-2 py-2 cursor-not-allowed bg-${accent}-200 border-1 border-${colors[color]} focus:border-${accent}-300`,
                menuItem: `px-2 py-2 cursor-pointer hover:bg-blue-100 border-1 border-${colors[color]} focus:border-blue-300 flex-wrap`,
                valueItem: `max-w-full ${wrapStyles[wrapStyle]}`,
                itemText: 'text-xl',
                select: `bg-${colors[color]} w-full flex flex-1 flex-row justify-between truncate ${sizes[size]} cursor-pointer border-2 border-${colors[color]} focus:border-blue-300`,
                selectIcon: `self-center fa fa-angle-down text-gray-400 pt-2 px-2`,
                vars: {
                    color: colors,
                    size: sizes,
                    wrapStyle: wrapStyles
                }
            }
        },

        table: (opts = {}) => {
            const {color = 'white', size = 'compact'} = opts
            let colors = {
                white: 'bg-white hover:bg-gray-100',
                gray: 'bg-gray-100 hover:bg-gray-200',
                transparent: 'gray-100'
            }

            let sizes = {
                compact: 'px-4 py-1',
                full: 'px-10 py-5'
            }
            return {
                tableHeader:
                    `${sizes[size]} pb-1 border-b-2 border-gray-300 bg-gray-200 text-left font-medium text-gray-700 uppercase first:rounded-tl-md last:rounded-tr-md`,
                tableInfoBar: "bg-white",
                tableRow: `${colors[color]} transition ease-in-out duration-150`,
                tableRowStriped: `bg-gray-100 even:bg-gray-200 hover:bg-gray-300 transition ease-in-out duration-150`,
                tableCell: `${sizes[size]} whitespace-no-wrap`,
                inputSmall: 'w-24',
                sortIconDown: 'fas fa-sort-amount-down',
                sortIconUp: 'fas fa-sort-amount-up',
                sortIconIdeal: 'fas fa-sort-alt',
                vars: {
                    color: colors,
                    size: sizes
                }
            }
        },

        tabpanel: (opts = {}) => {
            const { tabLocation = 'top' } = opts
            
             let tabLocations = {
                top:  {
                        tabpanelWrapper: 'flex-col',
                        tabWrapper: 'flex-row',
                        tab: `border-b-2`
                },
                left:  {
                        tabpanelWrapper: 'flex-row',
                        tabWrapper: 'flex-col',
                        tab: `border-r-2`
                }
            }
            return {
                tabpanelWrapper: `flex ${tabLocations[tabLocation].tabpanelWrapper} w-full h-full`,
                tabWrapper: `flex ${tabLocations[tabLocation].tabWrapper}`,
                tab: `px-4 py-2 hover:text-gray-800 cursor-pointer   text-center text-gray-500`,
                tabActive: `px-4 py-2 text-${accent}-500 ${tabLocations[tabLocation].tab} border-blue-500 text-center`,
                icon: '',
                tabName: '',
                contentWrapper: 'bg-white flex-1 h-full',
                vars: {
                    tabLocation: tabLocations
                }
            }
        },
        button: (opts = {}) => {
            const {color = 'white', size = 'base', width = 'block'} = opts
            let colors = {
                white: `
                    border border-gray-300  text-gray-700 bg-white hover:text-gray-500
                    focus:outline-none focus:shadow-outline-blue focus:border-blue-300
                    active:text-gray-800 active:bg-gray-50 transition duration-150 ease-in-out
                    disabled:cursor-not-allowed
                `,
                transparent: `
                    border border-gray-300  text-gray-700 bg-white hover:text-gray-500
                    focus:outline-none focus:shadow-outline-blue focus:border-blue-300
                    active:text-gray-800 active:bg-gray-50 transition duration-150 ease-in-out
                    disabled:cursor-not-allowed
                `,
                primary: '',
                danger: ''
            }

            let sizes  = { 
                base: 'px-4 py-4 leading-5 font-medium',
                sm: 'text-sm px-2 py-2 leading-5 font-medium',
                lg: 'text-lg px-6 py-6 leading-5 font-medium',
                xl: 'text-2xl px-12 py-8 leading-5 font-medium'
            }

            let widths = {
                'block': '',
                'full' : 'w-full'
            }

            return {
                button: `
                    inline-flex items-center justify-items-center text-center
                    ${colors[color]} ${sizes[size]} ${widths[width]}
                `,
                vars: {
                    color: colors,
                    size: sizes,
                    width: widths
                }
            } 
        },

        input: (opts = {}) => {
            const {color = 'white', size = 'small', width = 'block'} = opts
            let colors = {
                white: 'bg-white',
                gray: 'bg-gray-100'
            }

            let sizes  = {
                base: 'px-4 py-4 font-medium',
                small: 'text-sm px-2 py-2 font-medium text-xs',
                large: 'text-lg px-6 py-6 font-medium text-xl'
            }

            let widths = {
                'block': '',
                'full' : 'w-full'
            }

            return {
                input: `
                 ${colors[color]} ${sizes[size]} ${widths[width]}
                `,
                vars: {
                    color: colors,
                    size: sizes,
                    width: widths
                }
            }
        },
        modal: (opts = {}) => {
            const {size = 'base', overlay = 'default'} = opts
            let overlays = {
                default: 'fixed  inset-0 bg-gray-500 opacity-75',
                none: ''
            }

            let sizes = {
                base: 'sm:max-w-2xl',
                small: 'w-64',
                large: 'sm:max-w-4xl',
                xlarge: 'sm:max-w-8xl'

            }


            return {
                modalContainer: `${overlay === 'default' ? '' : 'pointer-events-none'} fixed bottom-0 inset-x-0 px-4 pb-4 inset-0 flex items-center justify-center`,
                modalOverlay: overlays[overlay],
                modal: `${sizes[size]}  pointer-events-auto bg-white rounded-lg overflow-hidden shadow-xl transform transition-all`,
                vars: {
                    size: sizes,
                    overlay: overlays
                }
            }
        },


        /* ------------------------- */
        shadow: "shadow",
        ySpace: "py-thing",
        text: "text-gray-800",
        textContrast: "text-white",
        border: "broder-gray-400",

        textInfo: "text-blue-400",
        bgInfo: "bg-blue-400",
        borderInfo: "border-blue-400",

        textSuccess: "text-blue-400",
        bgSuccess: "bg-blue-400",
        borderSuccess: "border-blue-400",

        textDanger: "text-red-400",
        bgDanger: "bg-red-400",
        borderDanger: "border-red-400",

        textWarning: "text-yellow-400",
        bgWarning: "bg-yellow-400",
        borderWarning: "border-yellow-400",

        textLight: "text-gray-400", // <-- for text styled like placeholder but can't be selected with ::placeholder
        placeholder: "placeholder-gray-400",

        topMenuBorder: "border-b border-gray-200",
        topMenuScroll: "",
        headerShadow: "",
        navText: "text-gray-100",

        navMenu: "h-full relative",
        navMenuOpen: "bg-darkblue-500 text-white shadow-lg w-56 rounded-t-lg",
        navMenuBg: "bg-darkblue-500 bb-rounded-10 shadow-lg text-white rounded-b-lg",
        navMenuItem:
            "hover:font-medium cursor-pointer px-2 py-1 text-lg font-semibold",

        bg: "bg-gray-50",

        menuBg: "bg-white z-50",
        menuBgHover: "",
        menuBgActive: "bg-blue-200",
        menuBgActiveHover: "hover:bg-blue-300",
        menuText: "text-gray-100",
        menuTextHover: "hover:text-gray-700",
        menuTextActive: "text-blue-500",
        menuTextActiveHover: "hover:text-blue-700",

        headerBg: "bg-gray-200",
        headerBgHover: "hover:bg-gray-400",

        inputBg: "bg-white disabled:bg-gray-200 cursor-pointer focus:outline-none",
        inputBorder:
            "rounded border-0 border-transparent hover:border-gray-300 focus:border-gray-600 disabled:border-gray-200",
        inputBgDisabled: "bg-gray-200 cursor-not-allowed focus:outline-none",
        inputBorderDisabled: "rounded border-2 border-gray-200 hover:border-gray-200",
        inputBgFocus: "bg-white cursor-pointer focus:outline-none",
        inputBorderFocus:
            "rounded border-2 border-transparent hover:border-gray-600 focus:border-gray-600 border-gray-600",

        textBase: "text-base",
        textSmall: "text-sm",
        textLarge: "text-lg",
        paddingBase: "py-1 px-2",
        paddingSmall: "py-0 px-1",
        paddingLarge: "py-2 px-4",

        contentBg: "bg-white",

        accent1: "bg-blue-100",
        accent2: "bg-gray-300",
        accent3: "bg-gray-400",
        accent4: "bg-gray-500",

        highlight1: "bg-blue-200",
        highlight2: "bg-blue-300",
        highlight3: "bg-blue-400",
        highlight4: "bg-blue-500",

        width: "",

        transition: "transition ease-in-out duration-150",
       

        
    }
};

export default avl_design