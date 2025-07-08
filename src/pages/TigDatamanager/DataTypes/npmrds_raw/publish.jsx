import React from "react";
import { useNavigate } from "react-router";
import { DamaContext } from "~/pages/DataManager/store";
import { ScalableLoading } from "~/modules/avl-components/src";
import { DAMA_HOST } from "~/config";
import { fips2Name } from "../constants";

const submitUpload = ({props, navigate, pgEnv, baseUrl}) => {
  props.setLoading(true);
  //Need to map from 
  //FIPS_Code: County Name
  //To
  //State_Abbr:[County Names]

  const npmrdsRequestAreas = Object.keys(fips2Name).reduce(
    (acc, curr) => {
      //Object should have 3 top level keys, 1 for each state
      switch (curr.substring(0, 2)) {
        case "34":
          acc["NJ"].push(fips2Name[curr]);
          break;
        case "36":
          acc["NY"].push(fips2Name[curr]);
          break;
        case "09":
        default:
          acc["CT"].push(fips2Name[curr]);
          break;
      }

      return acc;
    },
    {
      NY: [],
      NJ: [],
      CT: [],
    }
  );

  const runPublishNpmrdsRaw = async () => {
    try {
      const publishData = {
        source_id: props?.source_id || null,
        name: props?.name,
        type: props?.type,
        startDate: props?.startDate,
        endDate: props?.endDate,
        states: npmrdsRequestAreas,
        user_id: props?.user_id,
        email: props?.email,
        pgEnv: pgEnv || props?.pgEnv,
        // averagingWindowSize: 60,
      };

      const res = await fetch(
        `${DAMA_HOST}/dama-admin/${pgEnv}/npmrds-raw/publish`,
        {
          method: "POST",
          body: JSON.stringify(publishData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const publishFinalEvent = await res.json();
      const { etl_context_id, source_id } = publishFinalEvent;

      console.log(etl_context_id, source_id);
      props.setLoading(false);
      if (source_id && etl_context_id) {
        navigate(`${baseUrl}/source/${source_id}/uploads/${etl_context_id}`);
      } else {
        navigate(`${baseUrl}/source/${source_id}`);
      }
    } catch (err) {
      props.setLoading(false);
      console.log("error : ", err);
    }
  };
  runPublishNpmrdsRaw();
};

export default function PublishNpmrdsRaw(props) {
  const { baseUrl } = React.useContext(DamaContext)
  const navigate = useNavigate();
  const { loading, pgEnv } = props;

  const buttonClass = props.disabled
    ? "cursor-not-allowed bg-gray-400 text-white font-bold py-2 px-4 rounded"
    : `cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold my-4 py-2 px-4 rounded`;

  return (
    <>
      <button
        className={buttonClass}
        disabled={props.disabled}
        onClick={() => submitUpload({props, navigate, pgEnv, baseUrl})}
      >
        {" "}
        {loading ? (
          <div style={{ display: "flex" }}>
            <div className="mr-2">Publishing</div>
            <div>
              <ScalableLoading scale={0.25} color={"#fefefe"} />
            </div>
          </div>
        ) : (
          <>New Publish</>
        )}
      </button>
    </>
  );
}
