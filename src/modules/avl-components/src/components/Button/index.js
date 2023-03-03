import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../wrappers/with-theme";


const ConfirmButton = ({
  onClick,
  children,
  confirmMessage,
  type,
  ...props
}) => {
  const [canClick, setCanClick] = React.useState(false);

  const timeout = React.useRef(null);

  const confirm = React.useCallback(
    (e) => {
      e.preventDefault();
      setCanClick(true);
      timeout.current = setTimeout(setCanClick, 5000, false);
    },
    [timeout]
  );
  const doOnClick = React.useCallback(
    (e) => {
      setCanClick(false);
      onClick && onClick(e);
    },
    [onClick]
  );

  React.useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, [timeout]);

  return (
    <button
      onClick={canClick ? (type === "submit" ? null : doOnClick) : confirm}
      {...props}
      type={canClick ? type : "button"}
    >
      <div className="relative w-full">
        {!canClick ? null : (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center overflow-hidden">
            <div>{confirmMessage}</div>
          </div>
        )}
        <div style={{ color: canClick ? "transparent" : null }}>{children}</div>
      </div>
    </button>
  );
};

export const Button = ({
  children,
  type = "button",
  showConfirm=false,
  confirmMessage = "click to confirm",
  themeOptions={},
  ...props
}) => {
  const fullTheme = useTheme();
  let theme = fullTheme['button'](themeOptions)

  if (showConfirm) {
    return (
      <ConfirmButton
        type={type}
        {...props}
        confirmMessage={confirmMessage}
        className={`${theme.button}`}
      >
        {children}
      </ConfirmButton>
    );
  }
  return (
    <button
      type={type}
      {...props}
      className={`${theme.button}`}
    >
      {children}
    </button>
  );
};

export const LinkButton = ({
  themeOptions={},
  className = "",
  type,
  children,
  disabled,
  ...props
}) => {
  const fullTheme = useTheme();
  let buttonTheme = fullTheme['button'](themeOptions)
  return (
    <Link
      {...props}
      onClick={(e) => e.stopPropagation()}
      className={`${buttonTheme} ${className}`}
    >
      {children}
    </Link>
  );
};
