import React from "react"

import HeaderComponent from "./Header/HeaderComponent"
import { NavMenu, NavMenuItem, NavMenuSeparator } from "./Nav/Menu"
import NavItem from './Nav/Item'
import Dropdown from './Dropdown'
import FlyoutMenu from './Menu/FlyoutMenu'
import Table from './Table'
import GridTable from "./Table/grid-table"
import SideNav from './Nav/Side'
import TopNav from './Nav/Top'
import AwesomeTopNav from './Nav/awesomeNav/Top'
import Layouts from "./Layouts"
import Loading, { ScalableLoading } from "./Loading"
import Scrollspy from "./Sidebar/scrollSpy/scrollspy";
import TabPanel from "./TabPanel/TabPanel"
import Modal from "./Modal/Modal"

import {
	TopUserMenu, TopUserMenuControl,
	SideUserMenu, SideUserMenuControl,
	UserMenuItem, UserMenuSeparator,
	UserMenuItems
} from "./Header/UserMenu"

export * from "./Containers"
export * from './Inputs'
export * from "./Button"
export * from "./utils"
export * from "./List/DndList"

export * from "./Sidebar/collapsible-sidebar"
export * from "./Legend/legend"
export * from "./Draggable/draggable"

export { default as AvlModal } from "./Modal/avl-modal"

const ComponentContextDefaults = {
	TopUserMenu, TopUserMenuControl,
	SideUserMenu, SideUserMenuControl,
	UserMenuItem, UserMenuSeparator,
	UserMenuItems
}

const ComponentContext = React.createContext(ComponentContextDefaults)

export const useComponents = () => {
	return React.useContext(ComponentContext);
}

export const ComponentProvider = ({ children, ...props }) => {
	return (
		<ComponentContext.Provider value={ { ...ComponentContextDefaults, ...props } }>
			{ children }
		</ComponentContext.Provider>
	)
}

export {
	Dropdown,
	HeaderComponent,
	TopUserMenu,
	TopUserMenuControl,
	SideUserMenu,
	SideUserMenuControl,
	UserMenuItem,
	UserMenuSeparator,
	UserMenuItems,
	Table,
	GridTable,
	SideNav,
	TopNav,
	AwesomeTopNav,
	NavItem,
	NavMenu,
	NavMenuItem,
	NavMenuSeparator,
	FlyoutMenu,
	Layouts,
	Loading,
	ScalableLoading,
	Scrollspy,
	TabPanel,
	Modal
}
