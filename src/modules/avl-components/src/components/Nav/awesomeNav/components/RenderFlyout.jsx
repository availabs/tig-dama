import {useState} from "react";
import {useMatch, useNavigate} from "react-router-dom";

export const RenderFlyout = ({display, tabs=[], tabStyle, activeTabStyle, flyoutWrapper, flyoutRightIcon, depthLevel=1}) => {
    const navigate = useNavigate();
    const [flyout, setFlyout] = useState();

    return (
        <>
            <div className={`${display ? flyoutWrapper : `hidden`} `}>
                {
                    tabs.map(tab => {
                        const subMenus = tab.subMenus;
                        const isActive = Boolean(useMatch({ path: `${tab.path}/*` || '', end: true }));

                        return (
                            <div
                                key={tab.name}
                                className={`${isActive ? activeTabStyle : tabStyle} items-center ${depthLevel > 0 ? `left-full` : ``}`}
                                onClick={e => {
                                    e.stopPropagation();
                                    navigate(tab.path)
                                }}
                                onMouseOver={e => setFlyout(tab.name)}
                                onMouseLeave={e => setFlyout(undefined)}
                                onMouseOut={e => setFlyout(undefined)}
                            >
                                {tab.name} {subMenus?.length ? <i className={`p-1 ${flyoutRightIcon}`} /> : null}
                                    {
                                        flyout === tab.name && subMenus?.length ?
                                            <div className={`pl-0 relative left-full -top-8 w-full`}>
                                                <RenderFlyout
                                                    tabs={subMenus}
                                                    display={flyout?.length}
                                                    tabStyle={`${tabStyle} border-2`}
                                                    activeTabStyle={activeTabStyle}
                                                    flyoutWrapper={flyoutWrapper}
                                                    flyoutRightIcon={flyoutRightIcon}
                                                    depthLevel={depthLevel + 1}
                                                />
                                            </div> : null
                                    }
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}