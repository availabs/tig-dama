import React from 'react';
// import {getSubdomain} from "utils"

const Documentation = () => {
  // const SUBDOMAIN = getSubdomain(window.location.host)

  return (
    <div className='max-w-4xl mx-auto bg-white p-16'>
      Docs
    </div>
  )
}




const config = [{
  name:'Documentation',
  path: "/docs",
  exact: true,
  auth: false,
  mainNav: false,
  sideNav: {
    color: 'dark',
    size: 'none'
  },
  component: Documentation
}]

export default config;
