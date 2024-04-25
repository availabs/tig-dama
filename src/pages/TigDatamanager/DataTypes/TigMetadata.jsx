import React from "react";
import moment from "moment";
import { DamaContext } from "~/pages/DataManager/store";

const OverviewEdit = ({ source, views, activeViewId }) => {
  const { pgEnv, baseUrl, user } = React.useContext(DamaContext);
  const [showContributors, setShowContributors] = React.useState(true);
  const [showLibrarians, setShowLibrarians] = React.useState(true);

  const activeView = React.useMemo(() => {
    return (
      views && activeViewId && views.find((v) => v.view_id === activeViewId)
    );
  }, [activeViewId]);

  const Tab = ({ columns = [] }) => {
    return (
      <>
        <div className="relative m-2 overflow-x-auto">
          <table className="w-full border-collapse border text-center	border-slate-500">
            <tbody>
              <tr className="bg-tigGreen-50 border-slate-500 border-collapse border border-slate-500">
                <td className="min-w-[25px] px-3 py-1 border-collapse border border-tigGreen-50 font-semibold	">
                  Columns
                </td>
                {columns &&
                  (columns || []).map((row, i) => (
                    <td
                      className="px-3 py-1 border-collapse border border-tigGreen-50"
                      key={Math.random() * i}
                    >
                      {row?.name}
                    </td>
                  ))}
              </tr>
              <tr className="border-collapse border border-slate-500	">
                <td className="min-w-[25px] px-3 py-1 border-collapse border border-tigGreen-50 font-semibold	">
                  Labels
                </td>
                {columns &&
                  (columns || []).map((row, i) => (
                    <td
                      className="px-3 py-1 border-collapse border border-tigGreen-50"
                      key={Math.random() * 10 * i}
                    >
                      {row?.display}
                    </td>
                  ))}
              </tr>
              <tr className="bg-tigGreen-50 border-collapse border border-slate-500	">
                <td className="min-w-[25px] px-3 py-1  border-collapse border border-tigGreen-50 font-semibold	">
                  Column Types
                </td>
                {columns &&
                  (columns || []).map((row, i) => (
                    <td
                      className="px-3 py-1 border-collapse border border-tigGreen-50"
                      key={Math.random() * 100 * i}
                    >
                      {row?.type}
                    </td>
                  ))}
              </tr>
              <tr className="border-collapse border border-slate-500	">
                <td className="min-w-[25px] px-3 py-1 border-collapse border border-tigGreen-50 font-semibold	">
                  Value Columns
                </td>
                {columns &&
                  (columns || []).map((row, i) => (
                    <td
                      className="px-3 py-1 border-collapse border border-tigGreen-50"
                      key={Math.random() * 1000 * i}
                    >
                      {row?.val || "N/A"}
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <>
      <div className=" flex flex-col md:flex-row mt-3 mb-3">
        <div className="flex-1">
          <div className="flex justify-between group">
            <div className="flex-1 grid grid-cols-12 px-6">
              <div className="col-span-7">
                <div>
                  <div className="flex border-tigGreen-100 border-t-2 mr-6 mt-2">
                    <div className="-mt-px mr-1">
                      <span className="bg-tigGreen-100 inline-block py-2 px-4 text-blue-700 text-white text-[16px] p-6">
                        Topic
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="my-2 text-[13px] leading-[18px]">
                      <em>Agency:</em>
                      <br />
                      {source && source?.agency ? `${source?.agency}` : "N/A"}
                    </p>
                    <div className="my-2 text-[13px] leading-[18px]">
                      Description:{" "}
                      <p>
                        {source && source?.description
                          ? `${source?.description}`
                          : "N/A"}
                      </p>
                    </div>
                    <hr className=" mr-6" />
                    <p className="my-2 text-[13px] leading-[18px]">
                      <em>Data Starts On:</em>
                      <br />
                      {activeView && activeView._created_timestamp
                        ? activeView._created_timestamp
                        : null}
                    </p>
                    <p className="my-2 text-[13px] leading-[18px]">
                      <em>Data Ends On:</em>
                      <br />
                      {activeView && activeView.end_date
                        ? activeView.end_date
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <div>
                    <div className="flex border-tigGreen-100 border-t-2 mr-6 mt-4">
                      <div className="-mt-px mr-1">
                        <span className="bg-tigGreen-100 inline-block py-2 px-4 text-blue-700 text-white text-[16px]">
                          Visibility
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-[24px]">
                        {source.user_cnt || 0} {" Contributors"}
                      </span>
                      <p className="text-[13px]">
                        {source.user_cnt || 0} contributors to this view:
                      </p>
                      <ul
                        className={`text-[13px] block list-disc mt-2 ml-4 ${
                          showContributors ? " min-h-9" : "min-h-3 "
                        }`}
                        id="contributors"
                      >
                        {source &&
                          (source.contributed_users || []).map((user, _) => (
                            <li>{user || ""}</li>
                          ))}
                      </ul>
                      <span
                        className=" text-[13px] float-right mr-6 cursor-pointer	"
                        onClick={() => setShowContributors(!showContributors)}
                      >
                        {`show ${showContributors ? "less" : "more"}`}
                      </span>
                      <br />

                      <hr className=" mr-6" />
                      <span className="font-bold text-[24px]">
                        {source.librarians_cnt || 0}
                        {" Librarians"}
                      </span>
                      <p className="text-[13px]">
                        {source.librarians_cnt || 0} librarians to this view:
                      </p>
                      <ul
                        className={`text-[13px] block list-disc mt-2 ml-4 ${
                          showLibrarians ? " min-h-9" : "min-h-3"
                        }`}
                        id="librarians"
                      >
                        {source &&
                          (source.librarians || []).map((lib, _) => (
                            <li>{lib || ""}</li>
                          ))}
                      </ul>
                      <span
                        className=" text-[13px] float-right mr-6 cursor-pointer	"
                        onClick={() => setShowLibrarians(!showLibrarians)}
                      >
                        {`show ${showLibrarians ? "less" : "more"}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-5">
                <div>
                  <div className="flex border-tigGreen-100 border-t-2 mr-6 mt-2">
                    <div className="-mt-px mr-1">
                      <span className="bg-tigGreen-100 inline-block py-2 px-4 text-blue-700 text-white text-[16px]">
                        Origin
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-[24px]">
                    {"About "}
                    {activeView && activeView?._created_timestamp
                      ? moment().diff(activeView?._created_timestamp, "years")
                      : 0}
                    {" years ago"}
                  </span>
                  <p className="my-2 text-[13px] leading-[18px]">
                    {activeView && activeView?._created_timestamp ? (
                      <>
                        {"This info was originally uploaded on "}
                        {activeView?._created_timestamp}
                        <br />
                        {user && user.name ? `By ${user.name}` : null}
                      </>
                    ) : null}
                  </p>
                  <hr className=" mr-6" />
                  <p className="my-2 text-[13px] leading-[18px]">
                    <em>Source:</em>
                    <br />
                    {source && source.name ? (
                      <>
                        <a href={`/sources/${source?.source_id}`}>
                          {source.name}
                        </a>
                      </>
                    ) : (
                      <></>
                    )}
                  </p>
                </div>
                <div>
                  <div className="flex border-tigGreen-100 border-t-2 mr-6 mt-6">
                    <div className="-mt-px mr-1">
                      <span className="bg-tigGreen-100 inline-block py-2 px-4 text-blue-700 text-white text-[16px]">
                        Updates
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-[24px] mt-2">
                    {activeView && activeView?._modified_timestamp
                      ? `Over ${moment().diff(
                          activeView?._modified_timestamp,
                          "years"
                        )} Years Ago`
                      : 0}
                  </span>
                  <p className="text-[13px]">
                    This view was last updated on{" "}
                    {activeView && activeView?._modified_timestamp
                      ? activeView?._modified_timestamp
                      : "N/A"}
                  </p>

                  <span className="font-bold text-[24px] mt-2">
                    {"About "}
                    {activeView && activeView?._modified_timestamp
                      ? moment().diff(activeView?._modified_timestamp, "years")
                      : 0}
                    {" Years Ago"}
                  </span>
                  <p className="text-[13px] ">
                    {activeView && activeView?._modified_timestamp ? (
                      <>
                        {"The rows of this view were last updated on "}
                        {activeView?._modified_timestamp}
                        <br />
                        {user && user.name ? `By ${user.name}` : null}
                      </>
                    ) : null}
                  </p>

                  <span className="font-bold text-[24px] mt-2">
                    {(activeView && activeView?.update_cnt) || 0}
                    {" Updates"}
                  </span>
                  <p className="text-[13px]">
                    This info has been updated{" "}
                    {(activeView && activeView?.update_cnt) || 0} times
                  </p>
                  <span className="font-bold text-[24px] mt-2">
                    {(activeView && activeView?.upload_cnt) || 0}
                    {" Uploads"}
                  </span>
                  <p className="text-[13px] ">
                    {(activeView && activeView?.upload_cnt) || 0} uploads made
                    to this set of data.{" "}
                  </p>

                  <span className="font-bold text-[24px] mt-2">
                    {(activeView && activeView?.download_cnt) || 0}
                    {" Downloads"}
                  </span>
                  <p className="text-[13px]">
                    This info has been downloaded{" "}
                    {(activeView && activeView?.download_cnt) || 0} times.
                  </p>
                  <span className="font-bold text-[24px] mt-2">
                    {(activeView && activeView?.view_cnt) || 0}
                    {" Views"}
                  </span>
                  <p className="text-[13px] ">
                    This info has been viewed{" "}
                    {(activeView && activeView?.view_cnt) || 0} times.
                  </p>
                </div>
              </div>
              <div className="col-span-12">
                <div>
                  <div className="flex border-tigGreen-100 border-t-2 mr-6 mt-4">
                    <div className="-mt-px mr-1">
                      <span className="bg-tigGreen-100 inline-block py-2 px-4 text-blue-700 text-white text-[16px]">
                        Functionality
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-7">
                      <p className="my-2 text-[13px] leading-[18px]">
                        <em>Statistics Involved:</em>
                        <br />
                        {activeView && activeView.statistics
                          ? activeView.statistics
                          : "N/A"}
                      </p>
                      <p className="my-2 text-[13px] leading-[18px]">
                        <em>Data Model:</em>
                        <br />
                        {activeView && activeView.model
                          ? activeView.model
                          : "N/A"}
                      </p>
                      <p className="my-2 text-[13px] leading-[18px]">
                        <em>Data Levels:</em>
                        <br />
                        {activeView && activeView.level
                          ? activeView.level
                          : "N/A"}
                      </p>
                      <p className="my-2 text-[13px] leading-[18px]">
                        <em>Available Actions:</em>
                        {activeView &&
                          (activeView.actions || []).map((act) => {
                            ` ${act || ""}, `;
                          })}
                      </p>
                    </div>
                    <div className="col-span-5">
                      <p className="my-2 text-[13px] leading-[18px]">
                        <em>Data Hierarchy:</em>
                        <br />
                        {activeView && activeView.hierarchy
                          ? activeView.hierarchy
                          : "N/A"}
                      </p>
                      <p className="my-2 text-[13px] leading-[18px]">
                        <em>Spatial Level:</em>
                        <br />
                        {activeView && activeView.spatial
                          ? activeView.spatial
                          : "N/A"}
                      </p>
                      <p className="my-2 text-[13px] leading-[18px]">
                        <em>Value Name:</em>
                        <br />
                        {activeView && activeView.name
                          ? activeView.name
                          : "N/A"}
                      </p>
                    </div>
                    <div className="col-span-12">
                      <span className="my-2 text-[13px] leading-[18px]">
                        {" "}
                        Data columns included in this view:{" "}
                      </span>
                      {(source?.metadata?.columns || []).length > 0 ? (
                        <Tab columns={source?.metadata?.columns} />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewEdit;
