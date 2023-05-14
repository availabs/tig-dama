import React from 'react'

import { useTheme } from "../../wrappers/with-theme"

export const Content = ({ children, className = "", ...rest }) => {
	const theme = useTheme();
	return (
		<div { ...rest }
			className={ `
				mx-auto ${ className }
				${ theme.contentWidth } ${ theme.contentPadding }
			` }>
				{ children }
			</div>
	)
}

export const Card = ({ children, className = "", ...props }) => {
	return (
		<div { ...props }
			className={ `
				p-2 rounded shadow-lg ${ className }
			` }>
			{ children }
		</div>
	)
}
