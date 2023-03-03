import Modal from "./Modal";
import {Button} from "../Button"
import React from 'react'
//import { useTheme } from "../../wrappers";

const Identity = (i) => i;

export default {
	
	name: "Modal",
	themeVar: 'modal',
	description: "It pops up and then goes back to where it came",
	props: [
		
		{ name: "open", default: false, type: "Boolean" },
		
		
	],
	examples: [{
		title: 'Simple',
		props: [
			{ 
				name: "open", 
				default: false
			},

		],
		Component: (props) => {
			const [open, toggle] = React.useState(false)
			return (
				<div className="h-full w-full bg-gray-100">
					<div className="max-w-5xl mx-auto py-12">
						<Button onClick={e => toggle(!open)}> Toggle </Button>
						<Modal {...props} open={open}>
							<div className='p-6'>
								<div className=''>
				                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
				                    <i className=" fa fa-check" aria-hidden="true" />
				                  </div>
				                  <div className="mt-3 text-center sm:mt-5">
				                    <div as="h3" className="text-lg leading-6 font-medium text-gray-900">
				                      Payment successful
				                    </div>
				                    <div className="mt-2">
				                      <p className="text-sm text-gray-500">
				                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius aliquam laudantium explicabo
				                        pariatur iste dolorem animi vitae error totam. At sapiente aliquam accusamus facere veritatis.
				                      </p>
				                    </div>
				                  </div>
				                </div>
				                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
				                  <button
				                    type="button"
				                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
				                    onClick={() => toggle(false)}
				                  >
				                    Deactivate
				                  </button>
				                  <button
				                    type="button"
				                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
				                    onClick={() => toggle(false)}
				                   
				                  >
				                    Cancel
				                  </button>
				                </div>
				            </div>
						</Modal>
					</div>
				</div>
			);
		},
	}],
};
