import React from "react";

export default ({ icon, className }) => (
  <div className={`${className} flex justify-center items-center`}>
    <span className={icon} />
  </div>
);
