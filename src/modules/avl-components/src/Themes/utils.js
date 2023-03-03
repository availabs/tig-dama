const compose = (themeType, theme) => {
	const [base, ...rest] = themeType.split(/(?<!^)(?=[A-Z])/);
	if (!theme.$compositions) return theme[base] || "";
	if (!theme.$compositions[base]) return theme[base] || "";

	return theme.$compositions[base].reduce((a, c) => {
		let option = c.$default || "";
		for (const opt of rest) {
			if (opt in c) {
				option = c[opt];
			}
		}
		a.push(option);
		return a;
	}, []).filter(Boolean).join(" ");
}

const composeDefaults = theme => {
	const composedTheme = JSON.parse(JSON.stringify(theme));

	for (const key in composedTheme) {
		if (key === "$compositions") continue;

		const classNames = composedTheme[key].split(/\s+/),
			atRegex = /^[@](.+)$/;
		composedTheme[key] = classNames.map(c => {
			const match = atRegex.exec(c);
			if (match) {
				const [, key] = match;
				return composedTheme[key];
			}
			return c;
		}).join(" ")
	}

	if (composedTheme.$compositions) {
		const { $defaults = [], ...rest } = composedTheme.$compositions;

		for (const type in rest) {
			composedTheme.$compositions[type].forEach(options => {
				for (let option in options) {
					const atRegex = /^[@](.+)$/;
					options[option] = options[option].split(/\s+/).map(o => {
						const match = atRegex.exec(o);
						if (match) {
							const [, key] = match;
							return composedTheme[key]
						}
						return o;
					}).join(" ");
					const $regex = /^\$(.+)$/,
						$match = $regex.exec(options[option]);
					if ($match) {
						const [, value] = $match;
						if (value in composedTheme) {
							options[option] = composedTheme[value];
							$defaults.push(value);
						}
					}
				}
			});
		}
		$defaults.forEach(themeType => {
			composedTheme[themeType] = compose(themeType, composedTheme);
		});
	}
	return composedTheme;
}

const handler = {
	get: (theme, definition, receiver) => {
		if (!(definition in theme)) {
			theme[definition] = compose(definition, theme);
		}
		return theme[definition];
	}
}

export const makeProxy = theme => new Proxy(theme, handler);

export const composeTheme = theme =>
  new Proxy(composeDefaults(theme), handler);
