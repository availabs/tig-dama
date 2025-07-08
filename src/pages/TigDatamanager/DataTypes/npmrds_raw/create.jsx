import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  Listbox,
  ListboxOption,
  ListboxOptions,
  ListboxButton,
  Transition,
} from "@headlessui/react";

import { DamaContext } from "~/pages/DataManager/store";
import PublishNpmrdsRaw from "./publish";
export const MAX_NPMRDS_SOURCE_NAME_LENGTH = 9;

const Create = ({ source }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const { pgEnv, user } = React.useContext(DamaContext);

  const doesPassNameLengthCheck = !!source?.source_id || source?.name.length <= MAX_NPMRDS_SOURCE_NAME_LENGTH
  const isButtonEnabled = !!source?.name?.length && doesPassNameLengthCheck && !!startDate && !!endDate;

  const errorMsg = useMemo(() => {
    if(!source?.name && !!startDate && !!endDate){
      return 'Type in a source name';
    } else if (!doesPassNameLengthCheck) {
      return `The source name is too long. Please enter a name with ${MAX_NPMRDS_SOURCE_NAME_LENGTH + " "} characters or less`
    } else {
      return ''
    }
  }, [source, startDate, endDate])

  return (
    <div className="w-full p-5 m-5">
      <div className="flex flex-row mt-4">
        <div className="basis-1/2">
          <div className="flex items-center justify-left mt-4">
            <div className="w-full max-w-xs mx-auto">
              <div className="block text-sm leading-5 font-medium text-gray-700">
                Start Date
              </div>
              <div className="relative">
                <DatePicker
                  required
                  showIcon
                  toggleCalendarOnIconClick
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  maxDate={endDate}
                  isClearable
                />
              </div>
            </div>
          </div>
        </div>
        <div className="basis-1/2">
          <div className="flex items-center justify-left mt-4">
            <div className="w-full max-w-xs mx-auto">
              <div className="block text-sm leading-5 font-medium text-gray-700">
                End Date
              </div>
              <div className="relative">
                <DatePicker
                  required
                  showIcon
                  toggleCalendarOnIconClick
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  minDate={startDate}
                  isClearable
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        <p style={{height:'24px'}} className="text-red-500">
          { errorMsg.length > 0 && errorMsg }
        </p>
      }
      <PublishNpmrdsRaw
        disabled={!isButtonEnabled}
        loading={loading}
        setLoading={setLoading}
        source_id={source?.source_id || null}
        name={source?.name}
        type={source?.type}
        startDate={startDate}
        endDate={endDate}
        user_id={user?.id}
        email={user?.email}
        pgEnv={pgEnv}
      />
    </div>
  );
};

export default Create;
