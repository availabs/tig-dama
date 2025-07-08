import React from 'react';
import { Link } from 'react-router'
import { Button, Input } from "~/modules/avl-components/src/";

const LoginComp = ({ email, password, update, canSubmit, handleSubmit }) => {
  return (
    <div className="h-full  flex flex-col justify-center sm:px-6 lg:px-8 mt-32">
      <form className="space-y-6" >
      <div className=" sm:mx-auto sm:w-full md:w-3/4 px-4 -mt-2">
        <div className="bg-tigGray-50 py-8 px-10 md:px-32 border-t-4 border-[#679d89]  rounded-t">
          <div className="sm:mx-auto sm:w-full sm:max-w-md border-b border-gray-200">
            <h2 className="text-4xl font-medium text-gray-900 w-full text-center">Sign In</h2>
          </div>
          
          <div className="flex flex-col pt-2">
            <div className="flex px-2 pb-1 text-xs text-gray-400 capitalize">
              Email
            </div>
            <div className="flex pl-1">
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={ e => update({ email: e }) }
                autoComplete="email"
                placeholder='Enter your email'
                required
                themeOptions={{width:"full"}}
              />
            </div>
          </div>

          <div className="flex flex-col pt-2">
            <div className="flex px-2 pb-1 text-xs text-gray-400 capitalize">
              Password
            </div>
            <div className="flex pl-1">
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={e => update({ password: e })}
                autoComplete="current-password"
                placeholder='Enter your password'
                required
                themeOptions={{width:"full"}}
              />
            </div>
          </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            </div>      
          </div>
          <div className="mt-3">
            <Button
              type="submit"
              onClick={handleSubmit}
              themeOptions={{color: 'tig'}}
            >
              Sign in
            </Button>
            <div className="text-sm text-right" style={{float: "right"}}>
              <Link to='/auth/signup' className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
              <br/>
              <Link to='/auth/reset-password' className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LoginComp