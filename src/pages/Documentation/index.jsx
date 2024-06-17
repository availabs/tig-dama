//import { useFalcor } from "~/modules/avl-components/src"
import { dmsPageFactory, registerDataType, Selector, registerComponents  } from "~/modules/dms/src"
import { withAuth } from "@availabs/ams" 
import checkAuth  from "~/layout/checkAuth"
//import {Logo} from '~/layout/ppdaf-layout'
//import AuthMenu from "~/pages/Auth/AuthMenu"

import {siteConfig} from '~/modules/dms/src/patterns/page/siteConfig'
//import ComponentRegistry from '~/component_registry'
// import { } from "~/modules/dms/src"
// import BuildingFootprintsDownload from "./buildings_download"

//registerComponents(ComponentRegistry)
registerDataType("selector", Selector)

const theme = {
  page: {
    wrapper1: 'w-full flex-1 flex flex-col bg-white border', // first div inside Layout
    wrapper2: 'w-full h-full flex-1 flex flex-row px-1 md:px-6 py-6', // inside page header, wraps sidebar
    wrapper3: 'flex flex-1 w-full  flex-col   relative text-md font-light leading-7 p-4 min-h-[calc(100vh_-_102px)]' , // content wrapepr
  }
}


const Routes = [
  {
    ...dmsPageFactory(
      siteConfig({ 
        app: "tig-dama",
        type: "tig-docs2",
        baseUrl: "/docs",
        theme,
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