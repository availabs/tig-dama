//import { useFalcor } from "~/modules/avl-components/src"
import { dmsPageFactory, registerDataType, Selector, registerComponents  } from "~/modules/dms/src"
import { withAuth } from "@availabs/ams" 
import checkAuth  from "~/layout/checkAuth"
//import {Logo} from '~/layout/ppdaf-layout'
//import AuthMenu from "~/pages/Auth/AuthMenu"

import {siteConfig} from '~/modules/dms/src/patterns/page/siteConfig'
import { DamaMap } from '~/pages/DataManager'
import { DMSGraphComponent, CenrepTableNew } from '~/modules/component_registry'
// import BuildingFootprintsDownload from "./buildings_download"

registerComponents({
  "Map: Dama Map": DamaMap,
  "Table: Cenrep": CenrepTableNew, 
  "Graph: DMS Graph Component": DMSGraphComponent
})
//registerComponents(ComponentRegistry)
registerDataType("selector", Selector)
//import ComponentRegistry from '~/component_registry'

// import BuildingFootprintsDownload from "./buildings_download"




const theme = {
  page: {
    wrapper1: 'w-full flex-1 flex flex-col  ', // first div inside Layout
    wrapper2: 'w-full h-full flex-1 flex flex-row', // inside page header, wraps sidebar
    wrapper3: 'flex flex-1 w-full flex-col border shadow bg-white relative text-md font-light leading-7 min-h-[calc(100vh_-_51px)]', // content wrapepr
  }
}


const Routes = [
  {
    ...dmsPageFactory(
      siteConfig({ 
        app: "tig-dama",
        type: "tig-data",
        baseUrl: "/data",
        theme,
        pgEnv:'tig_dama_dev',
        API_HOST: 'https://tig22.nymtc.org/graph'
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