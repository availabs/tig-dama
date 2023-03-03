import React from "react";

import get from "lodash.get";

import { useTheme, Legend } from "@availabs/avl-components";

import { Icon } from "./LayerPanel";

const InfoBoxContainer = ({
  activeLayers,
  width = 320,
  padding = 8,
  MapActions,
  ...props
}) => {
  const [legendLayers, infoBoxLayers, infoBoxWidth] = activeLayers.reduce(
    (a, c) => {
      if (c.legend) {
        const { show = true } = c.legend;
        let bool = show;
        if (typeof show === "function") {
          bool = show(c);
        }
        if (bool) {
          a[0].push(c);
        }
      }
      const shownInfoBoxes = c.infoBoxes.filter(({ show = true }) => {
        let bool = show;
        if (typeof show === "function") {
          bool = show(c);
        }
        return bool;
      });
      if (shownInfoBoxes.length) {
        a[1].push([c, shownInfoBoxes]);
        a[2] = Math.max(
          a[2],
          c.infoBoxes.reduce((aa, cc) => Math.max(aa, get(cc, "width", 0)), 0)
        );
      }
      return a;
    },
    [[], [], width]
  );

  const theme = useTheme();

  return (
    <div
      className={`
        absolute right-0 top-0 bottom-0
        flex flex-col items-end z-30
        pointer-events-none
      `}
      style={{ padding: `${padding}px` }}
    >
      {legendLayers.map((layer) => (
        <LegendContainer
          key={layer.id}
          {...layer.legend}
          MapActions={MapActions}
          layer={layer}
          padding={padding}
          infoBoxWidth={infoBoxWidth}
        />
      ))}

      {!infoBoxLayers.length ? null : (
        <div
          className={`
            ${theme.sidebarBg} p-1 rounded
            grid grid-cols-1 gap-1
            pointer-events-auto overflow-y-auto scrollbar-sm
          `}
          style={{
            width: `${infoBoxWidth - padding * 2}px`,
          }}
        >
          {infoBoxLayers.map(([layer, infoBoxes]) => (
            <div
              key={layer.id}
              className={`
                  grid grid-cols-1 gap-1
                  ${theme.menuBg} p-1 rounded
                `}
            >
              {infoBoxes.map((box, i) => (
                <InfoBox
                  key={i}
                  {...props}
                  {...box}
                  layer={layer}
                  MapActions={MapActions}
                  activeLayers={activeLayers}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default InfoBoxContainer;

const InfoBox = ({
  layer,
  Header,
  Component,
  MapActions,
  open = true,
  ...props
}) => {
  const [isOpen, setOpen] = React.useState(open);

  const theme = useTheme();

  return (
    <div
      className={`
      ${theme.bg} px-1 rounded
    `}
    >
      {!Header ? (
        <div className="pt-1" />
      ) : (
        <div
          className={`
            rounded text-lg font-bold
            flex items-center
          `}
        >
          <div
            className={`
              flex-1 ${isOpen ? "opacity-100" : "opacity-50"} transition
            `}
          >
            {typeof Header === "function" ? <Header layer={layer} /> : Header}
          </div>
          <div className="text-base">
            <Icon onClick={(e) => setOpen(!isOpen)}>
              <span className={`fa fa-${isOpen ? "minus" : "plus"}`} />
            </Icon>
          </div>
        </div>
      )}
      {!Component ? null : (
        <div className={`${isOpen ? "block" : "hidden"}`}>
          {typeof Component === "function" ? (
            <Component layer={layer} MapActions={MapActions} {...props} />
          ) : (
            Component
          )}
        </div>
      )}
    </div>
  );
};

const LegendContainer = ({
  infoBoxWidth,
  padding,
  width = 420,
  Title,
  MapActions,
  layer,
  ...props
}) => {
  const theme = useTheme();

  return (
    <div
      className={`
      ${theme.sidebarBg} p-1 rounded pointer-events-auto
    `}
      style={{
        width: `${Math.max(infoBoxWidth, width) - padding * 2}px`,
        marginBottom: "-0.25rem",
      }}
    >
      <div className={`${theme.menuBg} p-1 rounded`}>
        <div className={`${theme.bg} px-1 rounded`}>
          {Title ? (
            <div className={`font-medium text-lg ${theme.menuText} py-1`}>
              {typeof Title === "function" ? (
                <Title layer={layer} MapActions={MapActions} />
              ) : (
                Title
              )}
            </div>
          ) : (
            <div className="pt-1" />
          )}
          <Legend {...props} />
        </div>
      </div>
    </div>
  );
};
