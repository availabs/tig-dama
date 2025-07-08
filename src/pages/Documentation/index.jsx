//import { useFalcor } from "~/modules/avl-components/src"
import { dmsPageFactory, registerDataType, Selector, registerComponents  } from "~/modules/dms/src"
import { withAuth } from "@availabs/ams" 
import checkAuth  from "~/layout/checkAuth"
//import {Logo} from '~/layout/ppdaf-layout'
//import AuthMenu from "~/pages/Auth/AuthMenu"

import pagesConfig from '~/modules/dms/src/patterns/page/siteConfig'
//import ComponentRegistry from '~/component_registry'

// import BuildingFootprintsDownload from "./buildings_download"

//registerComponents(ComponentRegistry)
registerDataType("selector", Selector)

const theme = {
  page: {
    wrapper1: 'w-full flex-1 flex flex-col bg-white border', // first div inside Layout
    wrapper2: 'w-full h-full flex-1 flex flex-row px-1 md:px-6 py-6', // inside page header, wraps sidebar
    wrapper3: 'flex flex-1 w-full  flex-col   relative text-md font-light leading-7 p-4 min-h-[calc(100vh_-_102px)]' , // content wrapepr
  },
  layout:{
  wrapper: 'relative isolate flex min-h-svh w-full max-lg:flex-col',
  wrapper2: 'flex-1 flex items-start flex-col items-stretch max-w-full',
  wrapper3: 'flex flex-1',
  childWrapper: 'flex-1 h-full',
  topnavContainer1:`sticky top-0 left-0 right-0 z-20 `,
  topnavContainer2:``,
  sidenavContainer1: 'w-44',
  sidenavContainer2: 'sticky top-0 h-[calc(100vh_-_50px)]',
  navTitle: `flex-1 text-[24px] font-['Oswald'] font-[500] leading-[24px] text-[#2D3E4C] py-3 px-4 uppercase`
},
  sidenav:{
   "fixed": "",
   "logoWrapper": "w-44 bg-neutral-100 text-slate-800",
   "topNavWrapper": "flex flex-row md:flex-col", //used in layout
   "sidenavWrapper": "hidden md:block  border-r w-44 h-full z-20",
   "menuItemWrapper": "flex flex-col",
   "menuIconSide": "group w-6 mr-2 text-blue-500  group-hover:text-blue-800",
   "menuIconSideActive": "group w-6 mr-2 text-blue-500  group-hover:text-blue-800",
   "itemsWrapper": "border-slate-200 pt-5  ",
   "navItemContent": "transition-transform duration-300 ease-in-out flex-1",
   "navItemContents": ['text-[12px] font-500 uppercase hover:bg-blue-50 text-slate-700 px-4 py-2'],
   "navitemSide": `
    group  flex flex-col
    group flex 
    focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300
    transition-all cursor-pointer border-l-2 border-white`,
   "navitemSideActive": `
    group  flex flex-col   
      focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300
    transition-all cursor-pointer border-l-2 border-blue-300`,
   "indicatorIcon": "ChevronUpSquare",
   "indicatorIconOpen": "ChevronDownSquare",
   "subMenuWrappers": ['w-full bg-[#F3F8F9] rounded-[12px]','w-full '],
   "subMenuOuterWrappers": ['pl-4'],
   "subMenuWrapper": "pl-2 w-full",
   "subMenuParentWrapper": "flex flex-col w-full",
   "bottomMenuWrapper": ""
  },
  navOptions: {
    logo: '',
    sideNav: {
      size: 'compact',
      search: 'none',
      logo: 'none',
      dropdown: 'none',
      fixedMargin: 'lg:ml-44',
      position: 'fixed',
      nav: 'main'
    },
    topNav: {
      size: 'none',
      dropdown: 'right',
      search: 'right',
      logo: 'left',
      position: 'sticky',
      nav: 'none' 
    }
  },
}


const Routes = [
  {
    ...dmsPageFactory(
      pagesConfig[0]({ 
        app: "tig-dama",
        type: "tig-docs2",
        baseUrl: "/docs",
        themes: {default: theme},
        checkAuth: () => true
      }), 
      withAuth
    ),
    authLevel: -1,
    name: "CMS",
    sideNav: {
      size: "none"
    },
    topNav: {
      position: "fixed"
    }
  }
]


export default Routes