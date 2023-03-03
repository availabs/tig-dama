import React from "react"

import { Link } from "react-router-dom"

import get from "lodash.get"

import { useComponents } from "../index"

import { useClickOutside } from "../utils"
import { useTheme } from "../../wrappers/with-theme"
import withAuth from "../../wrappers/with-auth"

export const TopUserMenuControl = ({ open = false, className = "", style = {}, ...props}) => {
  const theme = useTheme();
  return (
    <div { ...props }
      className={ `
        flex items-center rounded cursor-pointer ${ theme.textInfo }
        ${ open ? theme.borderInfo : "border-transparent" }
        hover:${ theme.borderInfo } ${ theme.transition }
        flex items-center justify-center ${ className }
      ` }
      style={ {
        width: "2.5rem", height: "2.5rem",
        borderRadius: "1.25rem", fontSize: "1.15rem",
        borderWidth: "3px",
        ...style
      } }>
      <span className="fas fa-user"/>
    </div>
  )
}

export const TopUserMenu = withAuth(({ user }) => {
  const [open, setOpen] = React.useState(false),
    toggle = React.useCallback(e => {
      setOpen(open => !open);
    }, []),

    clickedOutside = React.useCallback(() => setOpen(false), []),
    [setRef] = useClickOutside(clickedOutside),

    theme = useTheme();



  const { UserMenuItems, TopUserMenuControl } = useComponents();

  return !user ? null : (
    !user.authed ?
      <Link to="/auth/login">
        <TopUserMenuControl />
      </Link>
    :
      <div className="relative" ref={ setRef }>
        <TopUserMenuControl open={ open }
          onClick={ toggle }/>

        { !open ? null :
          <div className={ `
              ${ theme.menuBg } ${ theme.menuText }
              p-2 right-0 absolute
            ` }
            style={ { top: "100%", minWidth: "8rem" } }>

            <UserMenuItems toggle={ toggle }/>

          </div>
        }
      </div>
  )
})

export const SideUserMenuControl = ({ open = false, label = "", className = "", style = null, ...props}) => {
  const theme = useTheme();
  return (
    <div { ...props }
      className={ `
        w-full py-1 pl-4 transition cursor-pointer
        ${ theme.menuBgHover } ${ theme.menuTextHover } ${ className }
      ` }
      style={ style }>
      <span className="fas fa-user mr-2"/>{ label }
    </div>
  )
}

export const SideUserMenu = withAuth(({ user }) => {
  const [open, setOpen] = React.useState(false),
    toggle = React.useCallback(() => {
      setOpen(open => !open);
    }, []),

    clickedOutside = React.useCallback(() => setOpen(false), []),
    [setRef] = useClickOutside(clickedOutside),

    theme = useTheme();

  const { SideUserMenuControl, UserMenuItems } = useComponents();

  return !user ? null : (
    <div className="pb-6">
      { !user.authed ?
        <Link to="/auth/login">
          <SideUserMenuControl label="Login"/>
        </Link>
        :
          <div className="relative" ref={ setRef }>
            <SideUserMenuControl label="User Menu"
              open={ open }
              onClick={ toggle }/>

            { !open ? null :
              <div className={ `
                  ${ theme.menuBg } ${ theme.menuText } mt-1 p-2 left-0 absolute
                ` }
                style={ { bottom: "100%", minWidth: "8rem" } }>

                <UserMenuItems toggle={ toggle }/>

              </div>
            }
          </div>
      }
    </div>
  )
})

export const UserMenuItems = withAuth(({ user = {}, toggle }) => {
  const { UserMenuSeparator, UserMenuItem } = useComponents();
  return (
    <>
      <div className="mb-1 border-b-2">
        { user.email }
      </div>
      <UserMenuItem to="/auth/profile"
        toggle={ toggle }>
        Profile
      </UserMenuItem>
      { get(user, "authLevel", -1) < 5 ? null :
        <UserMenuItem to="/auth/project-management"
          toggle={ toggle }>
          Project Management
        </UserMenuItem>
      }
      <UserMenuSeparator />
      <UserMenuItem to="/auth/logout"
        toggle={ toggle }>
        Logout
      </UserMenuItem>
    </>
  )
})

export const UserMenuItem = ({ to = "#", toggle, children }) => {
  const theme = useTheme();
  return (
    <div onClick={ toggle }>
      <Link to={ to }>
        <div className={ `
          rounded cursor-pointer px-2 whitespace-nowrap
          ${ theme.menuBg } ${ theme.menuBgHover }
          ${ theme.menuText } ${ theme.menuTextHover }
        ` }>
          { children }
        </div>
      </Link>
    </div>
  )
}

export const UserMenuSeparator = () =>
  <div className="border my-1"/>
