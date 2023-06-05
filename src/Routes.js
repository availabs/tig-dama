
import Auth from "./pages/Auth"
import NoMatch from "./pages/404"
import DataManager from "./pages/DataManager"
import Documentation from "./pages/Documentation"

const Routes = [
  Auth,
  ...DataManager('' /*, 'tig_dama_dev' */),
  ...Documentation,
  NoMatch
]

export default Routes
