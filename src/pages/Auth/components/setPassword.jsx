import React from "react"
import {useParams} from 'react-router-dom'


//import wrapper from "../wrappers/ams-set-password"

export default ({ password, verify, title, update, canSubmit, handleSubmit }) => {
  const params = useParams()
  console.log('setting password', params)
  
  return (
    <div className="h-full  flex flex-col justify-center sm:px-6 lg:px-8 mt-32">
      <form className="space-y-6" onSubmit={handleSubmit} >
        <div className=" sm:mx-auto sm:w-full md:w-3/4 px-4 -mt-2">
          <div className="bg-tigGray-50 py-8 px-10 md:px-32 border-t-4 border-[#679d89]  rounded-t">
            <div className="sm:mx-auto sm:w-full sm:max-w-md border-b border-gray-200">
              <h2 className="text-4xl font-medium text-gray-900 w-full text-center">Reset Password</h2>
            </div>
            <div className='pt-4'>
              <label htmlFor="password" className="block text-sm  text-gray-900">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={ e => update({ password: e.target.value }) }
                  autoComplete="password"
                  placeholder='Enter your password'
                  required
                  className="appearance-none block w-full px-3 py-2 border-b border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>  
            <div className='pt-4'>
              <label htmlFor="email" className="block text-sm  text-gray-900">
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="verify"
                  name="verify"
                  type="password"
                  value={verify}
                  onChange={ e => update({ verify: e.target.value }) }
                  autoComplete="email"
                  placeholder='Re-enter new password'
                  required
                  className="appearance-none block w-full px-3 py-2 border-b border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>  
            <div>
              <button
                type="submit"
                className="my-4 flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-gray-800 bg-[#d2d2d2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Set Password
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// import React from 'react';
// import { Link } from 'react-router-dom'

// const ResetPasswordComp = ({ email, verify, update, canSubmit, handleSubmit, title="" }) => {
//   return (
//     <div className="h-full  flex flex-col justify-center sm:px-6 lg:px-8 mt-32">
//       <form className="space-y-6" onSubmit={handleSubmit} >
//       <div className=" sm:mx-auto sm:w-full md:w-3/4 px-4 -mt-2">
//         <div className="bg-tigGray-50 py-8 px-10 md:px-32 border-t-4 border-[#679d89]  rounded-t">
//           <div className="sm:mx-auto sm:w-full sm:max-w-md border-b border-gray-200">
//             <h2 className="text-4xl font-medium text-gray-900 w-full text-center">Reset Password</h2>
//           </div>
          
//             <div className='pt-4'>
//               <label htmlFor="email" className="block text-sm  text-gray-900">
//                 Email
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={email}
//                   onChange={ e => update({ email: e.target.value }) }
//                   autoComplete="email"
//                   placeholder='Enter your email'
//                   required
//                   className="appearance-none block w-full px-3 py-2 border-b border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 />
//               </div>
//             </div>  
//           </div>
//           <div>
//             <button
//               type="submit"
//               className="my-4 flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-gray-800 bg-[#d2d2d2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//             >
//               Send reset instructions
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default ResetPasswordComp;