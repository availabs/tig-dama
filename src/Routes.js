
import Auth from "./pages/Auth"
import NoMatch from "./pages/404"
import DataManager from "./pages/DataManager"
import Documentation from "./pages/Documentation"

import List from '~/pages/TigDatamanager/Source/list'

const Routes = [
  Auth,
  ...DataManager('','tig_dama_dev',false, {List}),
  ...Documentation,
  NoMatch
]

export default Routes
