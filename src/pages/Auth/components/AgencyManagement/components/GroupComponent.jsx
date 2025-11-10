import React, { useState } from "react"

import UsersInGroup from "./UsersInGroup"

import get from "lodash/get"
import { Button, Input } from '~/modules/avl-components/src'
import { ThemeContext } from "~/modules/avl-components/src";

export const GroupHeader = ({ onChange, value }) =>
  <div className="grid grid-cols-11 gap-3 text-center font-bold mb-1">
    <div className="col-span-4 text-left border-b-2 text-xl mb-1">
      <div className="mb-1">
        <Input themeOptions={{size:"small"}} placeholder="Search agencies..."
          value={ value } onChange={ e => onChange(e) }/>
      </div>
    </div>
    <div className="col-span-3 border-b-2 flex justify-center items-end">
      Adjust Project Authority
    </div>
    <div className="col-span-2 border-b-2 flex justify-center items-end">
      Delete Group
    </div>
    <div  className="col-span-2 border-b-2 flex justify-center items-end">
      Confirm Changes
    </div>
  </div>

const verify = (currAL, newAL) =>
  !isNaN(newAL) && (currAL !== newAL) && (newAL >= 0) && (newAL <= 10);

export default ({ group, project, adjustAuthLevel, deleteGroup, removeFromProject, ...props }) => {
  const [groupToDelete, setGroupToDelete] = useState(null);
  const theme = React.useContext(ThemeContext);

  const handleDeleteClick = (e, groupName) => {
    e.preventDefault();
    if (groupToDelete !== groupName) {
      setGroupToDelete(groupName);
    } else {
      setGroupToDelete(null);
    }
  };

  const handleConfirmClick = () => {
    if(canAdjustAuthLevel) {
      adjustAuthLevel(group.name, authLevel);
    }
    if(isSelectedForDeletion) {
      deleteGroup(group.name);
      setGroupToDelete(null);
    }
  };

  const [opened, setOpened] = React.useState(false),
    toggle = React.useCallback(() => setOpened(!opened), [opened]),
    Project = group.projects.reduce((a, c) => c.project_name === project ? c : a, {}),
    [authLevel, setAuthLevel] = React.useState(get(Project, "auth_level", -1));

  const submit = React.useCallback(e => {
    e.preventDefault();
    adjustAuthLevel(group.name, authLevel);
  }, [adjustAuthLevel, group.name, authLevel]);

  const isSelectedForDeletion = groupToDelete === group.name;

  const canAdjustAuthLevel = verify(+Project.auth_level, +authLevel);
  const isConfirmButtonEnabled = (canAdjustAuthLevel || groupToDelete);
  return (
    <div className={ `
        mb-1 py-1 px-2 rounded ${ opened ? theme.accent1 : "" }`
      }>
      <div className="grid grid-cols-11 gap-3">
        <div className="col-span-4 flex items-center">
          <div className={ `
              px-2 py-1 mr-1 cursor-pointer rounded flex justify-center
              hover:${ theme.accent2 } ${ theme.transition }
            ` } onClick={ toggle }>
            { opened ?
              <span className="fa fa-minus"/> :
              <span className="fa fa-plus"/>
            }
          </div>
          <div className="flex-1">{ group.name }</div>
        </div>
        <div className="col-span-3">
          <form onSubmit={ submit }>
            <div className="flex justify-center gap-2 ">
              <div className="col-span-6">
                <Input type="number" min="0" max="10" required
                  value={ authLevel } onChange={ e => setAuthLevel(e) }/>
              </div>
              <div className="col-span-6">
                <Button 
                  themeOptions={{size:"sm"}}
                  type="submit"
                  disabled={ !verify(+Project.auth_level, +authLevel) }
                >
                  adjust
                </Button>
              </div>
            </div>
          </form>
        </div>
        <div className="col-span-2 flex justify-center">
          <div className="col-span-2 grid">
            <Button
              themeOptions={{ size: "sm", color: isSelectedForDeletion ? "transparent" : "cancel" }} 
              type="button"
              onClick={(e) => handleDeleteClick(e, group.name)}
            >
              {isSelectedForDeletion ? "Cancel" : "Delete"}
            </Button>
          </div>
        </div>
        <div className="col-span-2 flex justify-center">
          <div className="col-span-1 grid">
            <Button
              themeOptions={{ size: "sm", color: groupToDelete ? "cancel" : canAdjustAuthLevel ? "primary" : "transparent" }}
              type="button"
              onClick={handleConfirmClick}
              disabled={!isConfirmButtonEnabled}
            >
              Confirm {groupToDelete ? " Deletion" : canAdjustAuthLevel ? "" : ""}
            </Button>
          </div>
        </div>
      </div>
      { !opened ? null :
        <div className="mx-10 mt-2">
          <UsersInGroup group={ group } { ...props }/>
        </div>
      }
    </div>
  )
}
