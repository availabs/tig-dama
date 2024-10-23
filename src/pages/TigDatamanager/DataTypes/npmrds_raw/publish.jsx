import React from "react";
import { useNavigate } from "react-router-dom";
import { DamaContext } from "~/pages/DataManager/store";
import { ScalableLoading } from "~/modules/avl-components/src";
import { DAMA_HOST } from "~/config";

const submitUpload = (props, navigate, pgEnv) => {
  const {baseUrl} = React.useContext(DamaContext)
  props.setLoading(true);
  const runPublishNpmrdsRaw = async () => {
    try {
      const publishData = {
        source_id: props?.source_id || null,
        name: props?.name,
        type: props?.type,
        startDate: props?.startDate,
        endDate: props?.endDate,
        states: props?.states,
        user_id: props?.user_id,
        pgEnv: pgEnv || props?.pgEnv,
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
  const navigate = useNavigate();
  const { loading, pgEnv } = props;
  return (
    <>
      <button
        className={`cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
        onClick={() => submitUpload(props, navigate, pgEnv)}
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
