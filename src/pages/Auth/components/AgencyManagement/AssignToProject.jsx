import React from "react";
import { Button, Input } from "~/modules/avl-components/src";
import Select from "~/modules/avl-components/src/components/Inputs/select";

export default (props) => {
  const {
    otherGroups,
    user,
    assignToProject
  } = props;

  const [selectedAgency, setSelectedAgency] = React.useState({});
  const [authLevel, setAuthLevel] = React.useState(-1);

  console.log("groups in assignToProj",props)

  const canSubmit = selectedAgency && (authLevel >= 0) && (user.authLevel >= authLevel);
  const handleSubmit = (e) => {
    e.preventDefault();
    assignToProject(selectedAgency.name, authLevel);
  }
  return (
    <>
      <div className=" mb-1">
        <div className="grid grid-cols-4 gap-1">
          <div className="col-span-2 font-bold">Agency</div>
          <div className="col-span-1">Authority Level</div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 gap-1">
          <div className="col-span-2">
            <Select
              domain={otherGroups}
              accessor={(g) => g.name}
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e)}
              placeholder="Select a agency..."
            />
          </div>
          <div className="col-span-1">
            <Input
              type="number"
              min="0"
              max={user.authLevel}
              required
              value={authLevel}
              onChange={(v) => setAuthLevel(v)}
            />
          </div>
          <div className="col-span-1 grid">
            <Button
              themeOptions={{ size: "sm" }}
              type="submit"
              block
              disabled={!canSubmit}
            >
              assign
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};
