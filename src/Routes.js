
import Auth from "./pages/Auth"
import NoMatch from "./pages/404"
import DataManager from "./pages/DataManager"
import Documentation from "./pages/Documentation"

import List from '~/pages/TigDatamanager/Source/list'
import { PG_ENV } from '~/config'
// const pgEnv = 'tig_dama_dev'

import { useFalcor } from "~/modules/avl-components/src"
import { useAuth } from "~/modules/ams/src"

import tigDataTypes from '~/pages/TigDatamanager/DataTypes'

const DAMA_ARGS = {
  baseUrl: "",
  defaultPgEnv: PG_ENV,
  auth: false,
  components: { List },
  dataTypes: tigDataTypes,
  useFalcor,
  useAuth
}
console.log('Documentation', Documentation)
Documentation[0].element = Documentation[0].Component
delete Documentation[0].Component

const Routes = [
  ...Auth,
  ...DataManager(DAMA_ARGS),
  ...Documentation,
  NoMatch
]

export default Routes
