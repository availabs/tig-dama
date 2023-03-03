import { Button } from "./index";
//import { useTheme } from "../../wrappers";

// const Identity = (i) => i;

export default {
	name: "Button",
	themeVar: 'button',
	description: "A button, click it. ",
	props: [],
	examples:[
		{
			title: 'Simple Button',
			props: [{}],
			Component: (props) => {
				return (
					<div className="h-full w-full bg-gray-100">
						<div className="w-96 mx-auto p-12">
							<Button {...props}>
								
								<span className="os-icon os-icon-package pr-2" /> 
								Button Text
							</Button>
						</div>
					</div>
				);
			},
		}
	]
};
