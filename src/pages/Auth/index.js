import Login from "./components/login"
import Signup from "./components/signup"
import ResetPassword from "./components/resetPassword"
import SetPassword from "./components/setPassword"

import  { amsFactory, wrappers } from '~/modules/ams/src'//"@availabs/ams"



// console.log('ams',wrappers)
const AuthConfig = {
  children: [
    { 
      type: wrappers['ams-login'](Login), 
      path: "login",
      props: {title: "NYMTC TIG"}
    },
    { 
      type: wrappers["ams-reset-password"](ResetPassword), 
      path: "reset-password",
      props: {title: "NYMTC TIG"}
    },
    { 
      type: "ams-logout", 
      path: "logout"

    // @props.redirectTo
    // Optional prop. Defaults to "/".
    // Redirects user to URL after logging out.
    // props: { redirectTo: "/" }
    },

    { 
      type: wrappers['ams-signup'](Signup), 
      path: "signup",
      props: { addToGroup: "123" },
      props: {title: "NYMTC TIG"}
    },
    { 
      type: "ams-profile", 
      path: "profile" 
    },
    { 
      type: "ams-verify-request" , 
      path: "verify-request"
    }, 
    { 
      type: "ams-verify-email", 
      path: "verify-email"
    }, 
    { 
      type: wrappers["ams-set-password"](SetPassword),
      path: "set-password/:key",
      props: {title: "NYMTC TIG"}
    }, 
    { 
      type: "ams-accept-invite",
      path: "accept-invite" 
    },

    { type: "ams-project-management", 
      path: "project-management",
    // @props.authLevel
    // Optional prop. This prop can be applied to any AMS child.
    // If set, users must have equal or higher authLevel to view this page.
      props: { authLevel: 5 }
    },
    { type: "ams-users",
      path:"users",
      props: { authLevel: 5 }
    }
  ]
}


export default amsFactory(AuthConfig, "/auth")