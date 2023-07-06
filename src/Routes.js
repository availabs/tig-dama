
import Auth from "./pages/Auth"
import NoMatch from "./pages/404"
import DataManager from "./pages/DataManager"
import Documentation from "./pages/Documentation"

import List from '~/pages/TigDatamanager/Source/list'

const pgEnv = 'tig_dama_dev' 
// const pgEnv = 'pan'

const Routes = [
  Auth,
  ...DataManager('',pgEnv,false, {List}),
  // ...DataManager('','pan',false, {List}),
  ...Documentation,
  NoMatch
]

export default Routes
