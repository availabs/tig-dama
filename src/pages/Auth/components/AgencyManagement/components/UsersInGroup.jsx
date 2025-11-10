import React, { useState } from "react"
import { isEqual } from "lodash"
import { matchSorter } from 'match-sorter'
import { Button, Input } from '~/modules/avl-components/src'

const UserHeader = ({ value, onChange, ...props }) =>
  <div className="grid grid-cols-11 font-bold">
    <div className="col-span-4 border-b-2">
      <div>User Email</div>
      <div className="mb-1">
        <Input themeOptions={{size:"small"}}  placeholder="Search users..."
          value={ value } onChange={ e => onChange(e) }/>
      </div>
    </div>
    <div className="col-span-3 border-b-2 flex justify-center items-end">
      Remove from Agency
    </div>
    <div className="col-span-2 border-b-2 flex justify-center items-end">
      Delete User
    </div>
    <div  className="col-span-2 border-b-2 flex justify-center items-end">
      Confirm
    </div>
  </div>

const UserInGroup = ({ group, User, removeFromGroup, deleteUser, ...props }) => {
  const [stageDelete, setStageDelete] = useState(false);
  const [stageRemove, setStageRemove] = useState(false);

  const handleConfirmClick = () => {
    if(stageDelete) {
      deleteUser(User.email)
    }
    if(stageRemove) {
      removeFromGroup(User.email, group.name)
    }
  };

  const isConfirmButtonEnabled = (stageRemove || stageDelete);
  return (
    <div className="grid grid-cols-11 my-1">
      <div className="col-span-4">
        { User.email }
      </div>
      <div className="col-span-3 flex justify-center">
        <Button 
          themeOptions={{color: stageRemove ? "transparent" : "cancel", size:"sm"}}
          onClick={ e => setStageRemove(!stageRemove) }
        >
          { stageRemove ? "Cancel" : "Remove" }
        </Button>
      </div>
      <div className="col-span-2 flex justify-center">
        <Button
          themeOptions={{color: stageDelete ? "transparent" : "danger", size:"sm"}}
          onClick={ e => setStageDelete(!stageDelete) }
        >
          { stageDelete ? "Cancel" : "Delete" }
        </Button>
      </div>
      <div className="col-span-2 flex justify-center">
        <Button
          themeOptions={{ size: "sm", color: stageDelete ? "cancel" : stageRemove ? "cancel" : "transparent" }}
          type="button"
          onClick={handleConfirmClick}
          disabled={!isConfirmButtonEnabled}
        >
          Confirm { stageDelete ? " Deletion" : stageRemove ? "" : "" }
        </Button>
      </div>
    </div>
  )
}
const UserNotInGroup = ({ group, User, assignToGroup, ...props }) => {
  return (
    <div className="grid grid-cols-12 mb-1 flex items-center">
      <div className="col-span-8">
        { User.email }
      </div>
      <div className="col-span-4">
        <Button 
          themeOptions={{size:"sm"}} 
          onClick={ e => assignToGroup(User.email, group.name) }
        >
          add to agency
        </Button>
      </div>
    </div>
  )
}

export default ({ group, users, updateGroupMeta, ...props }) => {
  const defaultGroupMeta = JSON.parse(group.meta) ?? {description:'', url:''};
  const [num, setNum] = React.useState(5),
    [groupMeta, setGroupMeta] = React.useState(defaultGroupMeta),
    [userSearch, setUserSearch] = React.useState(""),
    [otherUserSearch, setOtherUserSearch] = React.useState(""),
    [usersInGroup, otherUsers] = users.reduce(([a1, a2], c) => {
      if (c.groups.includes(group.name)) {
        a1.push(c);
      }
      else {
        a2.push(c);
      }
      return [a1, a2];
    }, [[], []]);

  usersInGroup.sort((a, b) => a.email < b.email ? -1 : a.email > b.email ? 1 : 0);

  const otherSearch = matchSorter(otherUsers, otherUserSearch, { keys: ["email"] });
  const canSaveMeta = !isEqual(defaultGroupMeta, groupMeta);

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="col-span-3 flex gap-8 content-center flex-wrap items-end">
          <div className="flex flex-col">
            <div className="flex pb-1 text-sm text-gray-400 capitalize">
              Description: 
            </div>
            <div>
              <Input
                value={groupMeta.description}
                onChange={ e => setGroupMeta({...groupMeta, description:e}) }
                placeholder="Agency Description..."
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex pb-1 text-sm text-gray-400 capitalize">
              Link: 
            </div>
            <div>
              <Input
                value={groupMeta.url}
                onChange={ e => setGroupMeta({...groupMeta, url:e}) }
                placeholder="Agency link..."
              />
            </div>
          </div>
          <div className="flex flex-col">
            <Button 
              themeOptions={{size:"sm"}}
              onClick={() => {
                updateGroupMeta(group.name, groupMeta)
              }}
              disabled={!canSaveMeta}
            >
              Save meta changes
              </Button>
          </div>
        </div>
        <div className="col-span-1 relative">
          <div className="flex flex-col pt-2">
            <div className="flex pb-1 text-sm text-gray-400 capitalize">
              Add user to agency: 
            </div>
            <div>
              <Input
                value={ otherUserSearch }
                onChange={ e => setOtherUserSearch(e) }
                placeholder="User email..."
              />
            </div>
          </div>

          { otherUserSearch && otherSearch.length ?
            <div className="absolute left-0 bottom-0 right-0">
              { otherSearch.length <= 5 ? null :
                <div className="flex justify-center">
                  <Button
                    themeOptions={{size:"sm"}} 
                    onClick={ e => setNum(num - 5) }
                    disabled={ num === 5 }
                  >
                    Show Fewer
                  </Button>
                  <Button
                    themeOptions={{size:"sm"}} 
                    onClick={ e => setNum(num + 5) }
                    disabled={ num > otherSearch.length }
                  >
                    Show More
                  </Button>
                </div>
              }
            </div> : null
          }
        </div>
        <div className="col-span-2">
          { !otherUserSearch ? null :
            <div>
              { otherSearch.length ? null :
                <div className="pt-1">No users found...</div>
              }
              { otherSearch.slice(0, num)
                  .map(u =>
                    <UserNotInGroup { ...props } key={ u.email } group={ group } User={ u }/>
                  )
              }
              { otherSearch.length < num ? null :
                <div>Plus { otherSearch.length - num } others...</div>
              }
            </div>
          }
        </div>
      </div>
      <UserHeader onChange={ setUserSearch } value={ userSearch }/>
      { matchSorter(usersInGroup, userSearch, { keys: ["email"] })
          .map(user =>
            <UserInGroup { ...props } key={ user.email } User={ user }
              group={ group }>
              { user.email }
            </UserInGroup>
          )
      }
    </div>
  )
}
