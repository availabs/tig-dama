// import { withRouter } from "react-router"
//
// export default Component => withRouter(Component);

import {
  useLocation,
  useNavigate,
  useParams
} from "react-router";

export default Component => {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return (
      <Component
        {...props}
        router={{ location, navigate, params }}
      />
    );
  }

  return ComponentWithRouterProp;
}
