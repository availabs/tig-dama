import React from "react";
import { ThemeContext } from "~/modules/avl-components/src";

import AssignToProject from "./AssignToProject";
import CreateGroup from "./CreateGroup";
import GroupsInProject from "./GroupsInProject";

const GroupManagementTile = ({
  children,
  title = "",
  tileWidth = "sm:max-w-md",
}) => {
  const myTheme = React.useContext(ThemeContext);

  return (
    <div className={`mt-8 ${tileWidth}`}>
      <div
        className={`${
          myTheme.tile ?? "bg-white py-8 px-4 shadow-lg sm:rounded-md sm:px-10"
        }`}
      >
        <div className="sm:w-full border-gray-200">
          <h2 className="text-xl font-medium text-gray-900 mb-2">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default (props) => {
  return (
    <div className={props.className}>
      <div className="flex flex-wrap mt-10">
        <div className={`text-3xl w-full`}>Agencies</div>
        <GroupManagementTile tileWidth="w-full" title="Create Agency">
          <CreateGroup {...props} />
        </GroupManagementTile>
        <GroupManagementTile tileWidth="w-full" title="">
          <GroupsInProject {...props} />
        </GroupManagementTile>
      </div>
    </div>
  );
};
