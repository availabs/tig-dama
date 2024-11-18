import React, {useState} from "react";
import { matchSorter } from 'match-sorter'

import GroupComponent, { GroupHeader } from "./components/GroupComponent";

export default ({ groups, ...props }) => {
  const [groupSearch, setGroupSearch] = useState('');

  const filteredGroups = matchSorter(groups, groupSearch, { keys: ["name"] });
  return (
    <>
      <GroupHeader value={groupSearch} onChange={setGroupSearch} />
      {filteredGroups.map((group) => (
        <GroupComponent key={group.name} {...props} group={group} groupSearch={groupSearch} setGroupSearch={setGroupSearch}/>
      ))}
    </>
  );
};
