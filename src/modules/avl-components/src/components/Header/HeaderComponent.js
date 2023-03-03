import React from "react"

import {useComponents} from "../index"

import {useTheme} from "../../wrappers/with-theme"
import withAuth from "../../wrappers/with-auth"


const HeaderComponent = withAuth(({
                                      title,
                                      LeftComponent = null,
                                      children,
                                      RightComponent = null,
                                      shadowed = false,
                                      user, userMenu = false,
                                      className = "",
                                      customTheme = {},
                                      toggle = () => {
                                      },
                                      open
                                  }) => {

    const theme = {...useTheme(), ...customTheme},
        {TopUserMenu} = useComponents();

    const LeftComp = title || LeftComponent,
        RightComp = children || RightComponent;

    const tnHeight = theme.topNavHeight

    return (
        <div className={`w-full relative flex items-center justify-end ${theme.headerBg} ${className} h-${tnHeight}`}
             style={shadowed ? {boxShadow: "0px 6px 3px -3px rgba(0, 0, 0, 0.25)"} : null}>

            <div className={`inset-0 z-0 text-3xl font-bold flex-1 items-center h-${tnHeight} flex-grow`}>
                {typeof LeftComp === "function" ? React.createElement(LeftComp) : LeftComp}
            </div>

            <div className="flex flex-0 items-center relative z-10 pr-8 w-48 flex-shrink">

                <div className='hidden xl:block'>
                    {RightComp}
                </div>

                {!user || !userMenu ? null :
                    <div className="ml-8">
                        <TopUserMenu/>
                    </div>
                }

                <button className={`block xl:hidden fas ${open ? `fa-times` : `fa-bars`} float-right ${theme.textContrast}`} onClick={toggle}></button>
            </div>
        </div>
    )
})
export default HeaderComponent
