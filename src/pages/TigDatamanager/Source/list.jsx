import React, { useEffect, useMemo, useState } from "react";
import { useFalcor } from "~/modules/avl-components/src";
import { Link } from "react-router-dom";
import get from "lodash/get";
import SourcesLayout from "./layout";
import { useParams } from "react-router-dom";
import { DamaContext } from "~/pages/DataManager/store";
import { SourceAttributes, ViewAttributes, getAttributes } from "~/pages/DataManager/components/attributes";
import baseUserViewAccess  from "../Utils/authLevel";

const SourceThumb = ({ source }) => {
  const { falcor, falcorCache } = useFalcor();
  const {pgEnv, baseUrl} = React.useContext(DamaContext)

  useEffect(() => {
    async function fetchData() {
      const lengthPath = ["dama", pgEnv, "sources", "byId", source.source_id, "views", "length"];
      const resp = await falcor.get(lengthPath);
      await falcor.get([
        "dama", pgEnv, "sources", "byId",
        source.source_id, "views", "byIndex",
        { from: 0, to: get(resp.json, lengthPath, 0) - 1 },
        "attributes", Object.values(ViewAttributes)
      ]);
    }

    fetchData();
  }, [falcor, falcorCache, source, pgEnv]);


  return (
    <div className="w-full p-4 bg-white hover:bg-blue-50 block border-t border-gray-400 flex items-center justify-between">
      <div>
        <Link to={`${baseUrl}/source/${source.source_id}`} className="text-md font-medium w-full block hover:text-[#E47B44] border-b border-white hover:border-[#E47B44]">
          <span>{source.name}</span>
        </Link>
        <div>
          {(get(source, "categories", []) || [])
            .map(cat => cat.map((s, i) => (
              <Link key={i} to={`${baseUrl}/cat/${i > 0 ? cat[i - 1] + "/" : ""}${s}`}
                    className="text-xs p-1 px-2 bg-blue-200 text-blue-600 mr-2">{s}</Link>
            )))
          }
        </div>
{/*        <Link to={`${baseUrl}/source/${source.source_id}`} className="py-2 block">
          {source.description}
        </Link>*/}
      </div>

      
    </div>
  );
};


const SourcesList = () => {
  // const { falcor, falcorCache } = useFalcor();
  const [layerSearch, setLayerSearch] = useState("");
  const { cat1, cat2 } = useParams();


  const {pgEnv, baseUrl, user, falcor, falcorCache} = React.useContext(DamaContext);
  const userAuthLevel = user.authLevel;

  useEffect(() => {
    async function fetchData() {
      const lengthPath = ["dama", pgEnv, "sources", "length"];
      const resp = await falcor.get(lengthPath);
      console.log(resp)
      await falcor.get([
        "dama", pgEnv, "sources", "byIndex",
        { from: 0, to: get(resp.json, lengthPath, 0) - 1 },
        "attributes", Object.values(SourceAttributes)
      ]);
    }

    fetchData();
  }, [falcor, pgEnv]);

  const sources = useMemo(() => {
    return Object.values(get(falcorCache, ["dama", pgEnv, "sources", "byIndex"], {}))
      .map(v => getAttributes(get(falcorCache, v.value, { "attributes": {} })["attributes"]));
  }, [falcorCache, pgEnv]);

  return (

    <SourcesLayout baseUrl={baseUrl}>
      <div className='w-full flex flex-cols md:flex-rows'>
        <div className='flex-1 border-b-2 border-[#679d89]'>
          <div className="py-4">
            <div className="flex items-center border-t-2 border-[#679d89]">
              <div className='py-3 px-6 bg-[#679d89] text-gray-100 text-lg'> Catalog </div>
              <input
                className="w-full h-[52px] flex-1 text-lg p-2 border-b focus:outline-none focus:border-[#E47B44] border-gray-300 "
                placeholder="Search datasources"
                value={layerSearch}
                onChange={(e) => setLayerSearch(e.target.value)}
              />
            </div>
          </div>
          
          {
            sources
              .filter(source => {
                let output = true;
                if (cat1) {
                  output = false;
                  (get(source, "categories", []) || [])
                    .forEach(site => {
                      if (site[0] === cat1 && (!cat2 || site[1] === cat2)) {
                        output = true;
                      }
                    });
                }
                return output;
              })
              .filter(source => {
                let searchTerm = (source.name + " " + get(source, "categories[0]", []).join(" "));
                return !layerSearch.length > 2 || searchTerm.toLowerCase().includes(layerSearch.toLowerCase());
              })
              .filter(source => source?.statistics?.visibility !== "hidden")
              .filter(source => {
                const sourceAuthLevel = baseUserViewAccess(source?.statistics?.access || {});
                return (sourceAuthLevel <= userAuthLevel);
              })
              .sort((a,b) => a.name.localeCompare(b.name))
              .map((s, i) => <SourceThumb key={i} source={s} baseUrl={baseUrl} />)
          }
        </div>
        <div className='w-full md:w-[450px]'>
          <div className="p-4">
            <div className="flex items-center border-t-2 border-[#679d89]">
              <div className='py-4 px-6 bg-[#679d89] text-gray-100 text-sm'> Recent Activity </div>
              
            </div>
          </div>
        </div>
      </div>

    </SourcesLayout>

  );
};


export default SourcesList;
