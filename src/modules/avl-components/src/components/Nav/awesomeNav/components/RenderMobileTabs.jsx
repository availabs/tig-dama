import {useState} from "react";
import {useNavigate} from "react-router";

export const RenderMobileTabs = ({
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
                onClick={e => {
                    e.stopPropagation();
                    setFlyout(flyout === tab.name ? undefined : tab.name);
                }}
            >
                <div>
                    <label onClick={e => {
                        e.stopPropagation();
                        navigate(tab.path)
                    }}>
                        {tab.name}
                    </label>

                    {subMenus?.length ?
                        <i className={flyoutDownIcon}
                           onClick={e => {
                               e.stopPropagation();
                               setFlyout(flyout === tab.name ? undefined : tab.name)
                           }}
                        /> : null}

                    <div className={subMenus?.length && flyout === tab.name ? mobileSubNavWrapper : 'hidden'}>
                        <RenderMobileTabs activeTab={tab}
                                          tabsToRender={subMenus}
                                          rootTabStyle={rootTabStyle}
                                          activeRootTabStyle={activeRootTabStyle}
                                          childTabStyle={childTabStyle}
                                          activeChildTabStyle={activeChildTabStyle}
                                          flyoutDownIcon={flyoutDownIcon}
                                          mobileSubNavWrapper={mobileSubNavWrapper}
                                          onClick={onClick} {...rest} />
                    </div>
                </div>
            </div>)
    })
}