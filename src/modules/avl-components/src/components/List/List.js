import React  from "react"

const noop = () => {}

export const ListItemRemovable = ({item, remove=noop}) => (
  <li>
    <div className="block hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-1 md:gap-4">
            <div>
              <div className="text-lg leading-5 font-dark text-gray-600 truncate">{item}</div>
            </div>
          </div>
        </div>
        <div>
          <svg className="h-5 w-5 text-gray-400 hover:text-red-400" fill="currentColor" viewBox="0 0 20 20" onClick={remove}>
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>
  </li>
)

export const ListItemAction = ({item, action, remove=noop}) => (
  <li>
    <div className="block hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-1 md:gap-4">
            <div>
              <div className="text-lg leading-5 font-dark text-gray-600 truncate">{item}</div>
            </div>
          </div>
        </div>
        <div className="flex">
          {action}
        </div>
      </div>
    </div>
  </li>
)

export const List = ({children, className}) => (
  <div className={`bg-white overflow-hidden sm:rounded-md ${className}`}>
    <ul>
      {children}
    </ul>
  </div>
)
