import Select from "./Select";
import React from 'react'
//import { useTheme } from "../../wrappers";

const Identity = (i) => i;

export default {
	
	name: "Select",
	themeVar: 'select',
	description: "Select component supports, multi, search ",
	props: [
		{ name: "multi", default: true, type: "Boolean" },
		{ name: "searchable", default: true, type: "Boolean" },
		{ name: "domain", default: [], type: "Array" },
		{ name: "options", default: [], type: "Array" },
		{ name: "value", default: null, type: "String" },
		{ name: "placeholder", default: "Select a value...", type: "String" },
		{ name: "accessor", default: Identity, type: "Boolean" },
		{ name: "valueAccessor", default: Identity, type: "Boolean" },
		{ name: "displayAccessor", default: null, type: "Function" },
		{ name: "listAccessor", default: null, type: "Function" },
		{ name: "id", default: "avl-select", type: "String" },
		{ name: "autoFocus", default: false, type: "Boolean" },
		{ name: "disabled", default: false, type: "Boolean" },
		{ name: "removable", default: true, type: "Boolean" },
	],
	examples: [
		{
		title: 'Simple Select',
		props: [
			{
				name: "options",
				default: [
					"Afghanistan",
					"Albania",
					"Algeria",
					"Andorra",
					"Angola",
					"Antigua",
					"Argentina",
					"Armenia",
					"Australia",
					"Austria",
					"Really long selection to test what happens when something like this is selected"
				]
			},
		],
		Component: (props) => {
			const [selected, setSelected] = React.useState('')
			return (
				<div className="h-full w-full bg-gray-100">
					<div className="w-60 mx-auto py-12">
						Select:
						<Select
							{...props}
							value={selected}
							onChange={(v) => setSelected(v)}
							className=''
						/>
					</div>
				</div>
			);
		},
	},

		{
		title: 'Wrap Style',
		props: [
			{
				name: "options",
				default: [
					"Really long selection to test what happens when something like this is selected"
				]
			},
			{
				name: 'themeOptions',
				default: {
					color: 'white',
					size: 'mini',
					wrapStyle: 'wrap'
				}
			},
		],
		Component: (props) => {
			const [selected, setSelected] = React.useState('')
			return (
				<div className="h-full w-full bg-gray-100">
					<div className="w-60 mx-auto py-12">
						Select:
						<Select
							{...props}
							value={selected}
							onChange={(v) => setSelected(v)}
							className=''
						/>
					</div>
				</div>
			);
		},
	},
	{
		title: 'Multi Select',
		props: [
			{
				name: "options",
				default: [
					"Afghanistan",
					"Albania",
					"Algeria",
					"Andorra",
					"Angola",
					"Antigua",
					"Argentina",
					"Armenia",
					"Australia",
					"Austria",
					"Really long selection to test what happens when something like this is selected"
				]
			},
			{
				name: "multi",
				default: true
			},
			{
				name: "removable",
				default: true
			},


		],
		Component: (props) => {
			const [selected, setSelected] = React.useState('')
			return (
				<div className="h-full w-full bg-gray-100">
					<div className="w-72 mx-auto py-12">
						Select:
						<Select
							{...props}
							value={selected}
							onChange={(v) => setSelected(v)}
							className=''
						/>
					</div>
				</div>
			);
		},
	},
	],
};
