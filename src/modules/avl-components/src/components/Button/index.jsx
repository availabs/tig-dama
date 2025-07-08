import React from "react";
import { Link } from "react-router";
import { useTheme } from "../../wrappers/with-theme";

const defaultTheme = (opts = {}) => {
    const {color = 'white', size = 'base', width = 'block'} = opts
    let colors = {
        white: `
            border border-gray-300  text-gray-700 bg-white hover:text-gray-500
            focus:outline-none focus:shadow-outline-blue focus:border-blue-300
            active:text-gray-800 active:bg-gray-50 transition duration-150 ease-in-out
            disabled:cursor-not-allowed
        `,
        cancel: `
            text-red-700 bg-white hover:text-red-500
            focus:outline-none focus:shadow-outline-blue focus:border-blue-300
            active:text-red-800 active:bg-gray-50 transition duration-150 ease-in-out
            disabled:cursor-not-allowed
        `,
        transparent: `
            border border-gray-300  text-gray-700 bg-white hover:text-gray-500
            focus:outline-none focus:shadow-outline-blue focus:border-blue-300
            active:text-gray-800 active:bg-gray-50 hover:bg-gray-100 hover:text-gray-900
            transition duration-150 ease-in-out
            disabled:cursor-not-allowed
        `,
        primary: `
            border border-transparent shadow
            text-sm leading-4 text-white bg-blue-600 hover:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`,
        danger: `
          border border-red-300 text-white bg-red-500 
          focus:outline-none focus:shadow-outline-blue focus:border-blue-300
          active:bg-red-600 hover:bg-red-700 transition duration-150 ease-in-out
          disabled:cursor-not-allowed
        `
    }

    let sizes  = {
        base: 'px-4 py-4 leading-5 font-medium',
        xs: 'text-xs px-1 py-0.5 leading-5 font-thin rounded-sm',
        sm: 'text-sm px-2 py-2 leading-5 font-medium rounded-md',
        lg: 'text-lg px-6 py-6 leading-5 font-medium rounded-md',
        xl: 'text-2xl px-12 py-8 leading-5 font-medium rounded-lg'
    }

    let widths = {
        'block': '',
        'full' : 'w-full'
    }

    return {
        button: `
          ${colors[color]} ${sizes[size]} ${widths[width]}
        `,
        vars: {
            color: colors,
            size: sizes,
            width: widths
        }
    }
}


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
  className = "",
  showConfirm=false,
  confirmMessage = "click to confirm",
  themeOptions={},
  ...props
}) => {
  //const fullTheme = useTheme();
  //let theme = fullTheme?.['button'](themeOptions) || ''

  // const theme = typeof useTheme === 'function' && useTheme()?.button ? useTheme().button(themeOptions) : defaultTheme(themeOptions);
  const theme = defaultTheme(themeOptions);


  if (showConfirm) {
    return (
      <ConfirmButton
        type={type}
        {...props}
        confirmMessage={confirmMessage}
        className={`${theme.button} ${className}`}
      >
        {children}
      </ConfirmButton>
    );
  }
  return (
    <button
      type={type}
      {...props}
      className={`${theme.button} ${className}`}
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
