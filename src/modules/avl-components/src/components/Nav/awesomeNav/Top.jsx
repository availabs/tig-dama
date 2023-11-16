import {useTheme} from "../../../wrappers";
import {useMatch, useNavigate} from "react-router-dom";
import {Children, createRef, useEffect, useLayoutEffect, useMemo, useState} from "react";
import {RenderExtras} from "./components/RenderExtras";
import {RenderTabs} from "./components/RenderTabs";
import {RenderMobileTabs} from "./components/RenderMobileTabs";

// render extra tabs in "More" open out. calculate how many tabs can be rendered via screen size and summation of tab sizes
// each tab should know its level. this will help style better
// for now, keep click-through the only options to get to sub navs
// different menus altogether for mobile and desktop

const RenderNavBar = ({
                          depth = 0,
                          activeTab = {},
                          menuItems,
                          tabsWrapper,
                          rootTabStyle,
                          activeRootTabStyle,
                          childTabStyle,
                          activeChildTabStyle,
                          ...rest
                      }) => {
    const [width, setWidth] = useState(2000);
    // const ref = createRef();
    //
    // useEffect(() => {
    //     const element = ref.current;
    //
    //     function handleResize() {
    //         setWidth(element.getBoundingClientRect().width);
    //     }
    //
    //     handleResize(); // call in init
    //
    //     window.addEventListener("resize", handleResize);
    //
    //     return () => {
    //         window.removeEventListener("resize", handleResize);
    //     };
    // }, []);
    //
    // console.log('w?', width)
    const numTabsToDisplay = 100 //useMemo(() => width > 1800 ? 6 : width > 1100 ? 5 : width > 750 ? 3 : 7, [width]);
    const tabsToRender = useMemo(() => menuItems.slice(0, numTabsToDisplay), [width]);
    const extraTabs = useMemo(() => menuItems.slice(numTabsToDisplay, menuItems.length), [width]);

    return (
        <div
            // ref={ref}
            className={`${tabsWrapper} ${depth > 0 ? 'bg-white' : ''}`}>
            <RenderTabs activeTab={activeTab} tabsToRender={tabsToRender} rootTabStyle={rootTabStyle}
                        activeRootTabStyle={activeRootTabStyle}
                        childTabStyle={childTabStyle} activeChildTabStyle={activeChildTabStyle} {...rest} />
            <RenderExtras activeTab={activeTab} extraTabs={extraTabs} rootTabStyle={rootTabStyle}
                          activeRootTabStyle={activeRootTabStyle}
                          childTabStyle={childTabStyle} activeChildTabStyle={activeChildTabStyle} {...rest} />
        </div>
    )
}

const RenderUglyBar = ({
                           depth = 1,
                           makeItUgly,
                           menuItems = [],
                           tabsWrapper,
                           rootTabStyle,
                           activeRootTabStyle,
                           childTabStyle,
                           activeChildTabStyle,
                           ...rest
                       }) => {
    const activeTab = menuItems.find((tab) => Boolean(useMatch({path: `${tab.path}/*` || '', end: true})));

    return makeItUgly && menuItems?.length ?
        <>
            <RenderNavBar
                depth={depth}
                activeTab={activeTab}
                menuItems={menuItems}
                tabsWrapper={tabsWrapper}
                rootTabStyle={rootTabStyle}
                activeRootTabStyle={activeRootTabStyle}
                childTabStyle={childTabStyle}
                activeChildTabStyle={activeChildTabStyle}
                {...rest}
            />
            {
                activeTab?.subMenus?.length ?
                    <RenderUglyBar
                        depth={depth + 1}
                        makeItUgly={makeItUgly}
                        menuItems={activeTab?.subMenus}
                        tabsWrapper={tabsWrapper}
                        rootTabStyle={rootTabStyle}
                        activeRootTabStyle={activeRootTabStyle}
                        childTabStyle={childTabStyle}
                        activeChildTabStyle={activeChildTabStyle}
                        {...rest}
                    /> : null
            }
        </> : null
}
export const DesktopNav = ({
                               menuItems = [],
                               themeOptions = {},
                               leftMenu,
                               rightMenu
                           }) => {
    let theme = useTheme()['topnav'](themeOptions);
    const style = {
        makeItUgly: true,
        navWrapper: 'hidden lg:block shadow-sm',
        rootNavWrapper: 'flex flex-row h-full justify-between border-b-2 shadow-sm bg-slate-100',
        leftMenuAndMenuItemsWrapper: 'flex flex-row w-3/4',
        tabsWrapper: 'block w-full shrink flex flex-row items-center divide-x-2 shadow-sm border-b overflow-x-auto scrollbar-sm',

        rootTabStyle: 'p-2 h-12 pt-4 uppercase self-center text-sm font-medium tracking-wider hover:bg-white text-gray-900 whitespace-nowrap cursor-pointer transition ease-in',
        activeRootTabStyle: 'p-2 h-12 pt-4 uppercase self-center text-sm font-medium tracking-wider bg-white text-blue-500 whitespace-nowrap cursor-pointer transition ease-in',

        childTabStyle: 'px-4 py-2 w-full uppercase text-sm font-medium tracking-wider hover:bg-slate-100 bg-white text-gray-900 cursor-pointer whitespace-nowrap transition ease-in',
        activeChildTabStyle: 'px-4 py-2 w-full uppercase text-sm font-medium tracking-wider hover:bg-slate-100 bg-white text-blue-500 cursor-pointer whitespace-nowrap transition ease-in',

        flyoutWrapper: 'flex flex-col absolute bg-slate-100 divide-y shadow-md',
        flyoutDownIcon: 'text-xs fa-thin fa-chevron-down px-1 py-0.5',
        flyoutRightIcon: 'text-xs fa-thin fa-chevron-right px-1 py-0.5',
        ...theme
    }

    const activeTab = menuItems.find((tab) => Boolean(useMatch({path: `${tab.path}/*` || '', end: true})));

    return (
        <div className={style.navWrapper}>
            <div className={style.rootNavWrapper}>
                <div className={style.leftMenuAndMenuItemsWrapper}>
                    {
                        leftMenu && leftMenu
                    }

                    <RenderNavBar
                        activeTab={activeTab}
                        menuItems={menuItems}
                        {...style}
                    />
                </div>

                {
                    rightMenu && rightMenu
                }
            </div>

            <RenderUglyBar
                menuItems={activeTab?.subMenus}
                {...style}
            />
        </div>
    )
}

export const MobileNav = ({
                              menuItems = [],
                              themeOptions = {},
                              leftMenu,
                              rightMenu
                          }) => {
    const [open, setOpen] = useState(false);
    let theme = useTheme()['topnav'](themeOptions);

    const style = {
        mobileMenuBarWrapper: 'flex lg:hidden flex-row justify-between w-full bg-slate-100 shadow-md',
        mobileMenuButton: 'fa fa-bars float-right p-2 text-2xl',
        mobileMenuCloseButton: 'fa fa-close text-red-500 p-2 text-2xl',
        mobileMenuContentWrapper: 'w-full h-screen overflow-y-auto bg-slate-100 z-10',
        mobileMenuWrapper: 'flex flex-col',
        mobileSubNavWrapper: 'p-4 bg-white',

        rootTabStyle: 'p-2 uppercase text-sm font-medium tracking-wider hover:bg-white text-gray-900 whitespace-nowrap cursor-pointer transition ease-in',
        activeRootTabStyle: 'p-2 uppercase text-sm font-medium tracking-wider bg-white text-blue-500 whitespace-nowrap cursor-pointer transition ease-in',

        childTabStyle: 'px-4 py-2 w-full uppercase text-sm font-medium tracking-wider hover:bg-slate-100 bg-white text-gray-900 cursor-pointer whitespace-nowrap transition ease-in',
        activeChildTabStyle: 'px-4 py-2 w-full uppercase text-sm font-medium tracking-wider hover:bg-slate-100 bg-white text-blue-500 cursor-pointer whitespace-nowrap transition ease-in',
        flyoutDownIcon: 'text-xs fa-thin fa-chevron-down px-1 py-0.5',

        ...theme
    };
    const activeTab = menuItems.find((tab) => Boolean(useMatch({path: `${tab.path}/*` || '', end: true})));

    return (
        <div className={style.mobileMenuWrapper}>
            <div className={style.mobileMenuBarWrapper}>
                {
                    leftMenu && leftMenu
                }
                <i className={open ? style.mobileMenuCloseButton : style.mobileMenuButton}
                   onClick={e => setOpen(!open)}/>
            </div>
            <div className={`${open ? style.mobileMenuContentWrapper : 'hidden'}`}>
                <RenderMobileTabs
                    mode={'mobile'}
                    activeTab={activeTab} tabsToRender={menuItems}
                    rootTabStyle={style.rootTabStyle} activeRootTabStyle={style.activeRootTabStyle}
                    childTabStyle={style.childTabStyle} activeChildTabStyle={style.activeChildTabStyle}
                    mobileSubNavWrapper={style.mobileSubNavWrapper}
                    flyoutDownIcon={style.flyoutDownIcon}
                    onClick={({tab, flyout, setFlyout}) => setFlyout(flyout === tab?.name ? undefined : tab?.name)}
                />

                <div className={''}>
                    {
                        rightMenu && rightMenu
                    }
                </div>
            </div>
        </div>
    )
}

const AwesomeNav = (props) => {
    return (
        <nav>
            <DesktopNav {...props} />
            <MobileNav {...props} />
        </nav>
    )
}

export default AwesomeNav;