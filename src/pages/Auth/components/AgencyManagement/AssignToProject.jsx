import React from "react";
import { ThemeContext, Button } from "~/modules/avl-components/src";
import Select from "~/modules/avl-components/src/components/Inputs/select";

export default ({
  groups,
  user,
  group,
  authLevel,
  update,
  canSubmit,
  handleSubmit,
}) => {
  const myTheme = React.useContext(ThemeContext);
  const numericInputClass = myTheme.input().input;
  return (
    <>
      <div className=" mb-1">
        <div className="grid grid-cols-4 gap-1">
          <div className="col-span-2 font-bold">Group</div>
          <div className="col-span-1">Authority Level</div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 gap-1">
          <div className="col-span-2">
            <Select
              domain={groups}
              accessor={(g) => g.name}
              value={group}
              onChange={(e) => update({ group: e })}
              placeholder="Select a group..."
            />
          </div>
          <div className="col-span-1">
            <input
              className={`h-full ${numericInputClass}`}
              type="number"
              min="0"
              max={user.authLevel}
              required
              value={authLevel}
              onChange={(v) => update({ authLevel: v.target.value })}
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
