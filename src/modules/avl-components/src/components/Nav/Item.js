import React, {useEffect} from "react";
import { useRouteMatch, useHistory } from "react-router-dom";

import Icon from "../Icons";

import { useTheme } from "../../wrappers";

const NavItem = ({
	children,
	icon,
	to,
	onClick,
	className = null,
	type = "side",
	active = false,
	subMenus = [],
	themeOptions,
	subMenuActivate = 'onClick',
	subMenuOpen = false
}) => {
	// console.log('renderMenu')
	const theme = useTheme()[type === 'side' ? 'sidenav' : 'topnav'](themeOptions);

	const history = useHistory();
	const To = React.useMemo(() => {
		if (!Array.isArray(to)) {
			return [to];
		}
		return to;
	}, [to]);

	const subTos = React.useMemo(() => {
		const subs = subMenus.reduce((a, c) => {
			if (Array.isArray(c.path)) {
				a.push(...c.path);
			} else if (c.path) {
				a.push(c.path);
			}
			return a;
		}, []);
		return [...To, ...subs];
	}, [To, subMenus]);

	const routeMatch = Boolean(useRouteMatch({ path: subTos, exact: true }));

	const linkClasses = type === "side" ? theme.navitemSide : theme.navitemTop;
	const activeClasses =
		type === "side" ? theme.navitemSideActive : theme.navitemTopActive;

	const navClass = routeMatch || active ? activeClasses : linkClasses;

	const [showSubMenu, setShowSubMenu] = React.useState(subMenuOpen || routeMatch);
	
	useEffect(() => {
	    // check when the component is loaded
	    const localStorageToggled = localStorage.getItem(`${to}_toggled`);

	    // If is not null
	    if (localStorageToggled) {
	      setShowSubMenu(localStorageToggled === "true" || routeMatch ? true : false);
	    } else {
	      // If null set the localStorage key/value as a string.
	      localStorage.setItem(`${to}_toggled`, `${showSubMenu}`);
	    }
	}, [routeMatch,showSubMenu,to]);

	return (
		<div className={type === "side" ? theme.subMenuParentWrapper : null}>
			<div
				className={`${className ? className : navClass}`}
				onClick={() => {

					if (onClick) return onClick;

					if (To[0]) history.push(To[0]);
				}}
				onMouseLeave={() => subMenuActivate === 'onHover' ? setShowSubMenu(false) : ''}
			 	onMouseOver={() => subMenuActivate === 'onHover' ? setShowSubMenu(true) : ''}
			>
				<div className={'flex'}>
					<div className='flex-1 flex'>
						{!icon ? null : (
							<Icon
								icon={icon}
								className={type === "side" ? theme.menuIconSide : theme.menuIconTop}
							/>
						)}
						<div className={theme.navItemContent}>
							{children}
						</div>
					</div>
					<div
						onClick={() => {
									if (subMenuActivate === 'onClick') {
										localStorage.setItem(`${to}_toggled`, `${!showSubMenu}`);
										setShowSubMenu(!showSubMenu);
									}
								}}
					>
					{
						subMenus.length ?
							<Icon 

								icon={showSubMenu ? theme.indicatorIconOpen : theme.indicatorIcon}/> 
							: null
					}
					</div>
				</div>
			</div>
			{	subMenus.length ? 
				<SubMenu 
					showSubMenu={showSubMenu} 
					subMenus={subMenus} 
					type={type} 
					themeOptions={themeOptions} 
					className={className}
				/> : ''
			}
		</div>
	);
};
export default NavItem;

const SubMenu = ({ showSubMenu, subMenus, type, themeOptions }) => {
	const theme = useTheme()[type === 'side' ? 'sidenav' : 'topnav'](themeOptions);
	if (!showSubMenu || !subMenus.length) {
		return null;
	}

	return (
		<div
			className={ type === "side" ? theme.subMenuWrapper : theme.subMenuWrapperTop }
		>
			
			<div
				className={`${theme.contentBg}
					flex
					${type === "side" ? "flex-col" : "flex-row"}
				`}
			>
				{subMenus.map((sm, i) => (
					<NavItem 
						key={i} 
						to={sm.path} 
						icon={sm.icon} 
						type={type} 
						className={sm.className}
						onClick={sm.onClick}
						themeOptions={themeOptions}
						subMenus={sm.subMenus}
					>
						{sm.name}
					</NavItem>
				))}
			</div>
			
		</div>
	);
};
