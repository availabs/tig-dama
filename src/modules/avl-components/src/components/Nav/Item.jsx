import React, {useEffect} from "react";
import { useMatch, useNavigate } from "react-router-dom";

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

	const navigate = useNavigate();
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

	const routeMatch = Boolean(useMatch({ path: `${subTos[0]}/*` || '', end: true }));

	const linkClasses = type === "side" ? theme.navitemSide : theme.navitemTop;
	const activeClasses =
		type === "side" ? theme.navitemSideActive : theme.navitemTopActive;

	const isActive = routeMatch || active
	const navClass = isActive ? activeClasses : linkClasses;

	const [showSubMenu, setShowSubMenu] = React.useState(subMenuOpen || routeMatch);

	// when subMenuActivate !== onHover, and submenu needs to flyout for non-active menuItem
	const [hovering, setHovering] = React.useState(false);

	useEffect(() => {
	      setShowSubMenu(routeMatch);
	}, [routeMatch,showSubMenu,to]);

	return (
			<div className={type === "side" ? theme.subMenuParentWrapper : null}>
				<div
					className={`${className ? className : navClass}`}
					onClick={(e) => {
						e.stopPropagation();
						if (onClick) return onClick(To[0]);
						if (To[0]) navigate(To[0]);
					}}
					onMouseOutCapture={() =>
						(subMenuActivate === 'onHover' && setShowSubMenu(false)) ||
						(subMenuActivate !== 'onHover' && setHovering(false) && setShowSubMenu(false))
					}
					onMouseMove={() =>
						(subMenuActivate === 'onHover' && setShowSubMenu(true)) ||
						(subMenuActivate !== 'onHover' && setHovering(true) && setShowSubMenu(true))
					}
				>
					<div className={'flex'}>
						<div className='flex-1 flex' >
							{!icon ? null : (
								<Icon
									icon={icon}
									className={
										type === "side" ? 
											(isActive ? theme.menuIconSideActive : theme.menuIconSide)
											: (isActive ? theme.menuIconTopActive : theme.menuIconTop)

									}
								/>
							)}
							<div className={theme.navItemContent}>
								{children}
							</div>
						</div>
						<div
							onClick={() => {
								if (subMenuActivate === 'onClick') {
									// localStorage.setItem(`${to}_toggled`, `${!showSubMenu}`);
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
					{	subMenus.length ?
						<SubMenu
							showSubMenu={showSubMenu}
							subMenuActivate={subMenuActivate}
							active={routeMatch}
							hovering={hovering}
							subMenus={subMenus}
							type={type}
							themeOptions={themeOptions}
							className={className}
						/> : ''
					}
				</div>
			</div>
	);
};
export default NavItem;

const SubMenu = ({ showSubMenu, subMenus, type, hovering, subMenuActivate, active, themeOptions }) => {
	const theme = useTheme()[type === 'side' ? 'sidenav' : 'topnav'](themeOptions);

	const inactiveHoveing = !active && subMenuActivate !== 'onHover' && hovering;
	if ((!showSubMenu || !subMenus.length) && !(inactiveHoveing)) {
		return null;
	}

	return (
		<div
			className={ type === "side" ? theme.subMenuWrapper : inactiveHoveing ? theme.subMenuWrapperInactiveFlyout : theme.subMenuWrapperTop }
		>
			
			<div
				className={`${theme.contentBg}
							${inactiveHoveing && theme.subMenuWrapperInactiveFlyoutDirection}
							${!inactiveHoveing && theme.subMenuWrapperChild}
					flex ${(type === "side" || inactiveHoveing ? "flex-col" : "flex-row")}
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