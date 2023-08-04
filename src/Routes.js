
import Auth from "./pages/Auth"
import NoMatch from "./pages/404"
import DataManager from "./pages/DataManager"
import Documentation from "./pages/Documentation"

import List from '~/pages/TigDatamanager/Source/list'
import { PG_ENV } from '~/config'
// const pgEnv = 'tig_dama_dev'

import { useFalcor } from "~/modules/avl-components/src"
import { useAuth } from "@availabs/ams"

const DAMA_ARGS = {
  baseUrl: "",
  defaultPgEnv: PG_ENV,
  auth: false,
  components: { List },
  useFalcor,
  useAuth
}

const Routes = [
  Auth,
  ...DataManager(DAMA_ARGS),
  ...Documentation,
  NoMatch
]

export default Routes
