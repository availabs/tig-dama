import React from "react";
import { useTheme } from "../../wrappers/with-theme";

const Menu = React.forwardRef(
  ({ children, searchable, opened, direction, customTheme }, ref) => {
    const theme = useTheme();
    return (
      <div
        className={`${opened ? "block" : "hidden"} absolute left-0 z-40 overflow-hidden w-full`}
        style={direction === "down" ? { top: "100%" } : { bottom: "100%" }}
        ref={ref}
      >
        <div className={`${theme.accent3} my-1 ${searchable ? "pt-1" : ""}`}>
          {children}
        </div>
      </div>
    );
  }
);

const MenuItem = ({ children, isActive, customTheme, ...props }) => {
  const theme = useTheme();
  return (
    <div
      {...props}
      className={`
        px-2 whitespace-no-wrap
        ${theme.itemText}
        ${
          isActive
            ? `cursor-not-allowed ${theme.accent2}`
            : `cursor-pointer hover:${theme.accent2}`
        }
      `}
    >
      {children}
    </div>
  );
};