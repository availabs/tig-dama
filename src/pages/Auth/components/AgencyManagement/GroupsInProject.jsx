import React from "react";

import GroupComponent, { GroupHeader } from "./components/GroupComponent";


export default ({ groups, groupSearch, setGroupSearch, ...props }) => (
  <>
    <GroupHeader value={groupSearch} onChange={setGroupSearch} />
    {groups.map((group) => (
      <GroupComponent key={group.name} {...props} group={group} />
    ))}
  </>
);
