import React, { useEffect, useState } from "react";
import get from "lodash/get";
import { falcorGraph } from "~/modules/avl-components/src";

const API_HOST = "https://tigtest2.nymtc.org/api2/graph";
const tig_falcor = falcorGraph(API_HOST);

const npmrdsHoverComp = (props) => {
  const { data, layer } = props;
  const yearFilterValue = layer?.filters?.year?.value;
  const hourFilterValue = layer?.filters?.hour?.value;
  const [hoverData, setHoverData] = useState();
  const tmcId = data[2].tmc;
  const { props: layerProps } = layer;

  const mapData = layerProps?.symbology?.data;
  const mapTmcData = mapData[tmcId];

  useEffect(() => {
    async function getTmcData() {
      const tmcData = await tig_falcor.get([
        "tmc",
        tmcId,
        "meta",
        yearFilterValue,
        ["miles", "roadname", "aadt", "f_system", "nhs", "frc"],
      ]);
      const parsedData = get(tmcData, [
        "json",
        "tmc",
        tmcId,
        "meta",
        yearFilterValue,
      ]);
      setHoverData(parsedData);
    }

    if (tmcId && mapTmcData) {
      getTmcData();
    }
  }, [tmcId]);

  const cols = [
    { col: "tmcId", name: "TMC", display: (d) => <>{tmcId}</> },
    {
      col: "direction",
      name: "Direction",
      display: (d) => <>{mapTmcData["direction"]}</>,
    },
    { col: "roadname", name: "Road name", display: (d) => d },
    {
      col: "avg_speed",
      name: "Avg. speed",
      display: (d) => <>{mapTmcData["s"][hourFilterValue]}</>,
    },
    { col: "f_system", name: "f_system", display: (d) => d },
    { col: "frc", name: "frc", display: (d) => d },
    { col: "miles", name: "Miles", display: (d) => d },
    { col: "nhs", name: "NHS", display: (d) => d },
  ];

  if (!mapTmcData) {
    return;
  }

  return (
    <div className="bg-white px-4 py-2 max-w-[300px] scrollbar-xs overflow-y-scroll">
      {cols.map((k) => (
        <div className="flex border-b pt-1" key={`col-${k.name}`}>
          <div className="flex-1 font-medium text-sm pl-1">{k.name}</div>
          <div className="flex-1 text-right font-thin pl-4 pr-1">
            {k.display(hoverData?.[k.col])}
          </div>
        </div>
      ))}
    </div>
  );
};

export { npmrdsHoverComp };
