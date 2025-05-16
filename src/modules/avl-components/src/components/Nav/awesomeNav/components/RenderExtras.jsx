import {useState} from "react";
import {RenderFlyout} from "./RenderFlyout";
import {useMatch} from "react-router";

export const RenderExtras = ({
                                 activeTab,
                                 extraTabs,
                                 rootTabStyle,
                                 activeRootTabStyle,
                                 childTabStyle,
                                 activeChildTabStyle,
    flyoutDownIcon,
    ...rest
                             }) => {
    const [displayMore, setDisplayMore] = useState(false);
    const isActive = extraTabs.reduce((acc, tab) => acc || activeTab.name === tab.name, false);

    if (!extraTabs?.length) return null;

    return (
        <div className={isActive ? activeRootTabStyle : rootTabStyle}>
            <div onClick={() => setDisplayMore(!displayMore)}>
                More <i className={flyoutDownIcon}/>
            </div>
            <RenderFlyout tabs={extraTabs} display={displayMore} tabStyle={childTabStyle}
                          activeTabStyle={activeChildTabStyle} {...rest} />
        </div>
    )
}