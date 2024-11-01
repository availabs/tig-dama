import React from "react";
import { Input, Button } from "~/modules/avl-components/src";

export default ({
  user,
  group,
  authLevel,
  update,
  canSubmit,
  handleSubmit,
}) => {
  return (
    <>
      <div className="mb-1">
        <div className="grid grid-cols-4 gap-1">
          <div className="col-span-2 font-bold">Name</div>
          <div className="col-span-1">Authority Level</div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 gap-1">
          <div className="col-span-2">
            <Input
              placeholder="Enter agency name..."
              required
              showClear
              value={group}
              onChange={(e) => {
                update({ group: e });
              }}
            />
          </div>
          <div className="col-span-1">
            <Input
              type="number"
              min="0"
              max={user.authLevel}
              required
              value={authLevel}
              onChange={(e) => update({ authLevel: e })}
            />
          </div>
          <div className="col-span-1 grid">
            <Button
              themeOptions={{ size: "sm" }}
              type="submit"
              block
              disabled={!canSubmit}
            >
              create
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};
