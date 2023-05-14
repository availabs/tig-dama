import TabPanel from "./TabPanel";
import React from 'react'
//import { useTheme } from "../../wrappers";

const Identity = (i) => i;

export default {
	
	name: "TabPanel",
	themeVar: 'tabpanel',
	description: "Tab Panel for showing one thing at a time.",
	props: [
		
		{ name: "tabs", default: [], type: "Array" },
		{ name: "tabLocation", default: "top", type: "String" },
		{ name: "activeIndex", default: null, type: "Number" },
		{ name: "setActiveIndex", default: null, type: "Function" },
		
	],
	examples: [{
		title: 'Simple',
		props: [
			{ 
				name: "tabs", 
				default: [
					{
						name:"tab one",
						icon: 'fa fa-album',
						Component: () => <div> This is Tab One</div>
					},
					{
						name:"tab two",
						icon: 'fa-duotone fa-album',
						Component: () => <div> This is Tab two</div>
					},{
						name:"tab three",
						icon: 'fa-thin fa-album',
						Component: () => <div>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</div>
					}

				]
			},
		],
		Component: (props) => {
			const [selected, setSelected] = React.useState('')
			return (
				<div className="h-full w-full bg-gray-100">
					<div className="max-w-5xl mx-auto py-12">
						
						<TabPanel 
							{...props}
						/>
					</div>
				</div>
			);
		},
	}],
};
