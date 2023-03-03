export const button = [
// add base styles
	{ $default: "rounded inline-flex items-center justify-center @transition disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-50 focus:outline-none border",
		Text: "inline-flex items-center justify-center @transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none border"
 	},
// add text colors
	{ $default: "text-gray-400 disabled:text-gray-300",
		Primary: "text-blue-400 disabled:text-blue-300",
		Success: "text-green-400 disabled:text-green-300",
		Danger: "text-red-400 disabled:text-red-300",
		Info: "text-teal-400 disabled:text-teal-300"
	},
// add borders
	{ $default: "border-gray-400",
		Primary: "border-blue-400",
		Success: "border-green-400",
		Danger: "border-red-400",
		Info: "border-teal-400",
		Text: "border-none"
	},
// add hover
	{ $default: "hover:bg-gray-400 hover:text-white",
		Primary: "hover:bg-blue-400 hover:text-white",
		Success: "hover:bg-green-400 hover:text-white",
		Danger: "hover:bg-red-400 hover:text-white",
		Info: "hover:bg-teal-400 hover:text-white",
		Text: ""
	},
// add padding
	{ $default: "px-4 py-1 @textBase",
		Large: "px-6 py-2 @textLarge",
		Small: "px-2 py-0 @textSmall",
	},
	{ Block: "w-full" }
]
export const input = [
	{ $default: "w-full block rounded cursor-pointer disabled:cursor-not-allowed @transition @text @placeholder @inputBg @inputBorder" },
	{ $default: "@paddingBase @textBase", // <<-- padding based on size
		Large: "@paddingLarge @textLarge",
		Small: "@paddingSmall @textSmall"
	}
]
export const navitem = [
	{ $default: "border-transparent font-medium focus:outline-none @transition"},
	{ Top: "h-16 flex flex-1 items-center px-4 text-base leading-5",
		Side: "h-12 mb-1 flex pl-3 pr-4 py-2 border-l-4 text-base"
	},
	{ $default: "@menuBg @menuBgHover @menuText @menuTextHover",
		Active: "@menuBgActive @menuBgActiveHover @menuTextActive @menuTextActiveHover" }
]
export const textbutton = [
	{ $default: "@transition inline-flex px-2 hover:font-bold disabled:font-normal disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none" },
	{ $default: "$textbutton",
 		Info: "text-teal-400 hover:text-teal-500 disabled:text-teal-400"
	},
	{ $default: "text-base",
		Large: "text-lg",
		Small: "text-sm"
	},
	{ $default: "font-normal cursor-pointer",
		Active: "font-bold cursor-default"
	}
]
export const list = [
	{ $default: "@transition rounded"
	},
	{ $default: "p-2 bg-opacity-50",
		Item: "py-1 px-3 bg-gray-300 mb-2"
	},
	{ $default: "bg-opacity-50",
		Dragging: "bg-opacity-75"
	},
	{ $default: "bg-gray-400",
		Success: "bg-green-400"
	}
]
export const $compositions = {
	$defaults: [
		"input",
		"navitemTop",
		"navitemTopActive",
		"navitemSide",
		"navitemSideActive"
	], // <-- these are generated in theme during composeDefaults
	button,
	input,
	navitem,
	textbutton,
	list
}
