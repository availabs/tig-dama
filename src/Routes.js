
import Auth from "./pages/Auth"
import NoMatch from "./pages/404"
import DataManager from "./pages/DataManager"
import Documentation from "./pages/Documentation"

import List from '~/pages/TigDatamanager/Source/list'
import View from '~/pages/TigDatamanager/Source/view'

import { PG_ENV } from '~/config'

import { useFalcor } from "~/modules/avl-components/src"
import { useAuth } from "~/modules/ams/src"

import tigDataTypes from '~/pages/TigDatamanager/DataTypes'

const DAMA_ARGS = {
  baseUrl: "",
  defaultPgEnv: PG_ENV,
  auth: false,
  components: { List, View },
  dataTypes: tigDataTypes,
  useFalcor,
  useAuth
}

Documentation[0].element = Documentation[0].Component
delete Documentation[0].Component

const Routes = [
  ...Auth,
  ...DataManager(DAMA_ARGS),
  ...Documentation,
  NoMatch
]

export default Routes
