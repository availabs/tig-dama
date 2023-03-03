import React from 'react';
// import {getSubdomain} from "utils"
import nri_methodology from './nri_methodology'
import Markdoc from '@markdoc/markdoc';

import { callout } from './schema/callout.markdoc';
import heading from './schema/heading.markdoc'
import './md.css'


const DocsRender= () => {
  const ast = Markdoc.parse(nri_methodology);
  const variables = {
    flags: {
      show_secret_feature: false
    }
  };
  const config = {
    tags: {
      callout
    },
    nodes: {
      heading
    },
    variables: variables
  };
  const components = {
    callout
  };
  const content = Markdoc.transform(ast,config);
  

  return Markdoc.renderers.react(content, React,{components});
}

const Documentation = () => {
  // const SUBDOMAIN = getSubdomain(window.location.host)

  return (
    <div className='max-w-4xl mx-auto markdoc bg-white p-16'>
      <DocsRender />
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
