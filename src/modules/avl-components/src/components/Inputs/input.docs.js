import { Input } from "./index";
import React from "react";
//import { useTheme } from "../../wrappers";

// const Identity = (i) => i;

export default {
	name: "Input",
	themeVar: 'input',
	description: "Input",
	props: [],
	examples:[
		{
			title: 'Simple Input',
			props: [{}],
			Component: (props) => {
				const [content, setContent] = React.useState('')
				return (
					<div className="h-full w-full bg-gray-100">
						<div className="w-96 mx-auto p-12">
							<Input
								{...props}
								value={content}
								onChange={e => setContent(e)}
							/>
						</div>
					</div>
				);
			},
		},
		{
			title: 'Simple Input Styled',
			props: [],
			Component: (props) => {
				const [content, setContent] = React.useState('')
				return (
					<div className="h-full w-full bg-gray-100">
						<div className="w-96 mx-auto p-12">
							<Input
								{...props}
								value={content}
								onChange={e => setContent(e)}
								className={'border border-1 border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:border-blue-300 rounded-sm focus:shadow-lg shadow-amber-600'}
								placeholder={''}
							/>
						</div>
					</div>
				);
			},
		}
	]
};
