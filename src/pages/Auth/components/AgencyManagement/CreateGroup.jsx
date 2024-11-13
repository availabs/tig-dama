import React, { useState, useMemo } from "react";
import { Input, Button } from "~/modules/avl-components/src";

const INTITIAL_AGENCY = {
  group: "",
  authLevel: 0,
  meta: {
    url: "",
    description: "",
  },
};

export default ({ user, assignToProject, createAndAssign }) => {
  const [agency, setAgency] = useState(INTITIAL_AGENCY);

  const canSubmit = agency.name !== "";

  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-wrap w-full">
        <div className="flex flex-col pt-2">
          <div className="flex px-2 pb-1 text-xs text-gray-400 capitalize">
            Name
          </div>
          <div className="flex pl-1">
            <Input
              placeholder="Enter agency name..."
              required
              showClear
              value={agency.group}
              onChange={(e) => {
                setAgency({ ...agency, group: e });
              }}
            />
          </div>
        </div>
        <div className="flex flex-col pt-2">
          <div className="flex px-2 pb-1 text-xs text-gray-400 capitalize">
            Authority Level
          </div>
          <div className="flex pl-1">
            <Input
              type="number"
              min="0"
              max={user.authLevel}
              required
              value={agency.authLevel}
              onChange={(e) => {
                setAgency({ ...agency, authLevel: e });
              }}
            />
          </div>
        </div>
        <div className="flex flex-col pt-2">
          <div className="flex px-2 pb-1 text-xs text-gray-400 capitalize">
            URL
          </div>
          <div className="flex pl-1">
            <Input
              placeholder="URL..."
              required
              showClear
              value={agency.meta.url}
              onChange={(e) => {
                setAgency({ ...agency, meta: { ...agency.meta, url: e } });
              }}
            />
          </div>
        </div>
        <div className="flex flex-col pt-2">
          <div className="flex px-2 pb-1 text-xs text-gray-400 capitalize">
            Description
          </div>
          <div className="flex pl-1">
            <Input
              placeholder="Description..."
              required
              showClear
              value={agency.meta.description}
              onChange={(e) => {
                setAgency({
                  ...agency,
                  meta: { ...agency.meta, description: e },
                });
              }}
            />
          </div>
        </div>
        <div className="ml-auto mt-5 mr-1">
          <Button
            themeOptions={{ size: "sm" }}
            type="submit"
            block
            disabled={!canSubmit}
            onClick={() => {
              console.log("creating and assigning");
              createAndAssign(agency.group, agency.authLevel, agency.meta);
              setAgency(INTITIAL_AGENCY);
            }}
          >
            create
          </Button>
        </div>
      </div>
    </div>
  );
};
