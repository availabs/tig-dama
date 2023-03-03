import React from "react"
import 'styles/tailwind.css';

const noop = () => {}

export const ListItemRemovable = ({item, remove=noop}) => (
  <li>
    <div className="hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out">
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

export const EndorsementListItem = ({name, role, quote, remove}, i) => (
  <li key={i}>
    <div className="hover:bg-gray-50 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-1 md:gap-4">
            <div className="">
              <div>
                <div className="text-sm leading-5 text-gray-600">
                  {quote}
                </div>
                <div className="mt-2 flex items-center text-lg leading-5 text-gray-800">
                  {name}
                </div>
                <div className="flex items-center text-md leading-5 text-blue-400">
                  {role}
                </div>
              </div>
            </div>
          </div>
        </div>
        {remove ? (
          <div>
            <svg onClick={remove} className="h-5 w-5 text-gray-400 hover:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </div>) : ''
        }
      </div>
    </div>
  </li>
)

export const PressListItem = ({title, publication, url, remove}, i) => (
  <li key={i}>
    <div className="hover:bg-gray-50 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-1 md:gap-4">
            <div className="">
              <div>
                <div className="text-sm leading-5 text-gray-600">
                  {title}
                </div>
                { url.length > 0 ?
                  (<div className="mt-2 flex items-center text-lg leading-5 text-gray-800">
                    {publication}
                  </div>) :
                  (<div className="mt-2 flex items-center text-lg leading-5 text-gray-800">
                    <a href={url} target='_blank' rel="noopener noreferrer"> {publication} </a>
                  </div>)
                }
              </div>
            </div>
          </div>
        </div>
        {remove ? (
          <div>
            <svg onClick={remove} className="h-5 w-5 text-gray-400 hover:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </div>) : ''
        }
      </div>
    </div>
  </li>
)

export const List = ({children}) => (
  <div className="bg-white overflow-hidden sm:rounded-md">
    <ul>
      {children}
    </ul>
  </div>
)
