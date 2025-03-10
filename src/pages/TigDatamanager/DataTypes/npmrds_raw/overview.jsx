import React, { useMemo } from "react";
import { groupBy, orderBy } from "lodash";

export default function NpmrdsRawOverview({
  views,
}) {
  console.log({views})
  const groupbyState = useMemo(() => {
    return groupBy(
      orderBy(
        views.filter(v => v && v.metadata),
        ["metadata.start_date", "metadata.end_date"],
        ["asc", "asc"]
      ),
      (v) => v?.metadata?.state_code
    );
  }, [views]);

  const headers = [
    "View Id",
    "Version",
    "Start Date",
    "End Date",
    "Total Percent",
    "Interstate Percent",
    "Non Interstate Percent",
    "Extended TMC Percent",
    "Tmcs",
  ];

  return (
    <div className="w-full p-5">
      <div className="flex m-3">
        <div className="justify-start w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xl font-bold mb-2">
            View Data
          </label>
        </div>
      </div>

      {views.length ? (
        <div className="overflow-x-auto px-5 py-3">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {headers.map((key) => (
                  <th
                    key={key}
                    className="py-2 px-4 bg-gray-200 text-left border-b"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {views.map((view, index) => {
                return (
                  <>
                    <tr key={index}>
                      <td
                        key={`${view?.view_id}`}
                        className="py-2 px-4 border-b"
                      >
                        {view?.view_id}
                      </td>
                      <td
                        key={`npmrds_version.${index}`}
                        className="py-2 px-4 border-b"
                      >
                        {view?.metadata?.npmrds_version}
                      </td>
                      <td
                        key={`start_date.${index}`}
                        className="py-2 px-4 border-b"
                      >
                        {view?.metadata?.start_date}
                      </td>
                      <td
                        key={`end_date.${index}`}
                        className="py-2 px-4 border-b"
                      >
                        {view?.metadata?.end_date}
                      </td>
                      <td
                        key={`total.${index}`}
                        className="py-2 px-4 border-b"
                      >
                        {view?.statistics?.total && Math.round(view?.statistics?.total * 100) / 100}
                      </td>
                      <td
                        key={`interstate_percentage.${index}`}
                        className="py-2 px-4 border-b"
                      >
                        {view?.statistics?.interstate_percentage && Math.round(view?.statistics?.interstate_percentage * 100) / 100}
                      </td>
                      <td
                        key={`non_interstate_percentage.${index}`}
                        className="py-2 px-4 border-b"
                      >
                        {view?.statistics?.non_interstate_percentage && Math.round(view?.statistics?.non_interstate_percentage * 100) / 100}
                      </td>
                      <td
                        key={`extended_tmc_percentage.${index}`}
                        className="py-2 px-4 border-b"
                      >
                        {view?.statistics?.extended_tmc_percentage && Math.round(view?.statistics?.extended_tmc_percentage * 100) / 100}
                      </td>
                      <td
                        key={`${view?.metadata?.no_of_tmc}`}
                        className="py-2 px-4 border-b"
                      >
                        {view?.metadata?.no_of_tmc}
                      </td>
                    </tr>
                  </>
                )}
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          <span className="font-medium">No Views available</span>
        </div>
      )}
    </div>
  );
}
