import React from "react"

import colorbrewer from "colorbrewer"

import get from "lodash.get"

const ColorRanges = {}

for (const type in colorbrewer.schemeGroups) {
	colorbrewer.schemeGroups[type].forEach(name => {
		const group = colorbrewer[name];
		for (const length in group) {
			if (!(length in ColorRanges)) {
				ColorRanges[length] = [];
			}
			ColorRanges[length].push({
				type: `${ type[0].toUpperCase() }${ type.slice(1) }`,
				name,
				category: "Colorbrewer",
				colors: group[length]
			})
		}
	})
}

export { ColorRanges };
//console.log("ColorRanges", ColorRanges);

export const getColorRange = (size, name, reverse=false) => {
	let range = get(ColorRanges, [size], [])
		.reduce((a, c) => c.name === name ? c.colors : a, []).slice();
	if(reverse) {
		range.reverse()
	}
	return range
}


export const ColorBar = ({ colors, size = 3 }) => {
  return (
    <div className={ `flex` }>
      { colors.map((c, i) =>
          <div key={ i }
						style={ {
							backgroundColor: c,
							transition: "background-color 0.5s"
						} }
            className={ `flex-1 h-${ size }` }/>
        )
      }
    </div>
  )
}
