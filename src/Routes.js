
import Auth from "./pages/Auth"
import NoMatch from "./pages/404"
import DataManager from "./pages/DataManager"
import Documentation from "./pages/Documentation"

import List from '~/pages/TigDatamanager/Source/list'
import { PG_ENV } from '~/config'
// const pgEnv = 'tig_dama_dev' 


const Routes = [
  Auth,
  ...DataManager('',PG_ENV,false, {List}),
  ...Documentation,
  NoMatch
]

export default Routes
