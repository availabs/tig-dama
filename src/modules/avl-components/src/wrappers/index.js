import withTheme, { useTheme, ThemeContext } from "./with-theme"
import withAuth from "./with-auth"
import connect from "./connect"
import withRouter from "./with-router"
import showLoading from "./show-loading"
import shareProps from "./share-props"
import imgLoader from "./img-loader"

const Wrappers = {
  "with-theme": withTheme,
  "with-auth": withAuth,
  connect,
  "show-loading": showLoading,
  "share-props": shareProps
}
export {
  Wrappers,
  withTheme,
  ThemeContext,
  useTheme,
  withAuth,
  connect,
  shareProps,
  showLoading,
  imgLoader
}
