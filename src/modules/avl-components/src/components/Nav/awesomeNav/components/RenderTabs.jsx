import {useState} from "react";
import {RenderFlyout} from "./RenderFlyout";
import {useMatch, useNavigate} from "react-router-dom";

export const RenderTabs = ({
                               mode = 'desktop',
                               activeTab,
                               tabsToRender,
                               rootTabStyle,
                               activeRootTabStyle,
                               childTabStyle,
                               activeChildTabStyle,
                               flyoutDownIcon,
                                onClick,
                               mobileSubNavWrapper,
                               ...rest
                           }) => {
    const navigate = useNavigate();
    const [flyout, setFlyout] = useState();

    if (!tabsToRender?.length) return null;

    return tabsToRender.map(tab => {
        const subMenus = tab.subMenus;
        const isActive = activeTab?.name === tab.name;

        return (
            <div
                key={tab.name}
                className={isActive ? activeRootTabStyle : rootTabStyle}
                onClick={e => onClick ? e.stopPropagation() && onClick({tab, flyout, setFlyout}) : navigate(tab.path)} //for mobile on div click setFlyout
                onMouseOver={e => setFlyout(tab.name)}
                onMouseLeave={e => setFlyout(undefined)}
                onMouseOut={e => setFlyout(undefined)}
            >
                    <div onClick={e => navigate(tab.path)}>
                        {tab.name}
                        {subMenus?.length ? <i className={flyoutDownIcon} onClick={() => {setFlyout(tab.name)}}/> : null}
                    </div>
                    {
                        subMenus?.length && flyout === tab.name && mode === 'desktop' ?
                            <RenderFlyout tabs={subMenus} display={true} tabStyle={childTabStyle}
                                          activeTabStyle={activeChildTabStyle} {...rest} /> : null
                    }
            </div>)
    })
}