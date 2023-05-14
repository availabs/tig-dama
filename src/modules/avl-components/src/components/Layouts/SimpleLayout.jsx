import React from 'react';

import { useTheme } from "../../wrappers/with-theme"

const SimpleLayout = ({ children}) => {
  const theme = useTheme();
  return (
    <div className={ `${ theme.bg }` }>
      <main>
        { children }
      </main>
    </div>
  )
}
export default SimpleLayout
