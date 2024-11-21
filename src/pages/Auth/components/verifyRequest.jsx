import React from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "~/modules/avl-components/src/";
const VerifyRequest = ({
  password,
  verify,
  update,
  canSubmit,
  handleSubmit,
  ...props
}) => {
  return (
    <div className="h-full  flex flex-col justify-center sm:px-6 lg:px-8 mt-32">
      <form onSubmit={handleSubmit}>
        <div className=" sm:mx-auto sm:w-full md:w-3/4 px-4 -mt-2">
          <div className="bg-tigGray-50 py-8 px-10 md:px-32 border-t-4 border-[#679d89]  rounded-t">
            <div className="sm:mx-auto sm:w-full sm:max-w-md border-b border-gray-200">
              <h2 className="text-4xl font-medium text-gray-900 w-full text-center">
                Create Password
              </h2>
            </div>
            <div className="flex flex-col pt-2">
              <div className="flex px-2 pb-1 text-xs text-gray-400 capitalize">
                Password
              </div>
              <div className="flex pl-1">
                <Input
                  type="password"
                  id="password"
                  required
                  autoFocus
                  value={password}
                  placeholder="Password..."
                  onChange={(v) => update({ password: v })}
                  themeOptions={{ width: "full" }}
                />
              </div>
            </div>
            <div className="flex flex-col pt-2">
              <div className="flex px-2 pb-1 text-xs text-gray-400 capitalize">
                Verify Password
              </div>
              <div className="flex pl-1">
                <Input
                  type="password"
                  id="verify"
                  required
                  value={verify}
                  placeholder="Verify password..."
                  onChange={(v) => update({ verify: v })}
                  themeOptions={{ width: "full" }}
                />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Button type="submit" onClick={handleSubmit}>
              Create Account
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VerifyRequest;
