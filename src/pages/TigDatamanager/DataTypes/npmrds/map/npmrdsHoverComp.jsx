import React, { useEffect, useState } from "react";
import get from "lodash/get";
import { DamaContext } from "~/pages/DataManager/store"

const npmrdsHoverComp = (props) => {
  const { data, layer } = props;
  const yearFilterValue = layer?.filters?.year?.value;
  const hourFilterValue = layer?.filters?.hour?.value;
  const [hoverData, setHoverData] = useState();
  const tmcId = data[2].tmc;
  const { props: layerProps } = layer;

  const mapData = layerProps?.symbology?.data;

  const mapTmcData = mapData[tmcId];
  const { falcor, falcorCache, pgEnv } = React.useContext(DamaContext);
  const tig_falcor = falcor;
  const cols = [
    { col: "tmcId", name: "TMC", display: (d) => <>{tmcId}</> },
    { col: "road", name: "Road name", display: (d) => d },
    {
      col: "direction",
      name: "Direction",
      display: (d) => <>{mapTmcData["direction"]}</>,
    },
    {
      col: "speed",
      name: "Avg Speed",
      display: (d) => `${d?.toFixed(2)}mph`
    },
    {
      col: "avg_speedlimit",
      name: "Avg Speed Limit",
      display: (d) => `${d?.toFixed(2)}mph`
    },
    // { col: "f_system", name: "f_system", display: (d) => d },
    // { col: "frc", name: "frc", display: (d) => d },
    { col: "miles", name: "Miles", display: (d) => d },
    { col: "nhs", name: "NHS", display: (d) => d },
  ];

  if (!mapTmcData) {
    return (
      <div className="bg-white px-4 py-2 max-w-[300px] scrollbar-xs overflow-y-scroll">
        <div className="flex border-b pt-1" key={`col-tmc`}>
          <div className="flex-1 font-medium text-sm pl-1">TMC</div>
          <div className="flex-1 text-right font-thin pl-4 pr-1">{tmcId}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white px-4 py-2 max-w-[300px] scrollbar-xs overflow-y-scroll">
      {cols.map((k) => (
        <div className="flex border-b pt-1" key={`col-${k.name}`}>
          <div className="flex-1 font-medium text-sm pl-1">{k.name}</div>
          <div className="flex-1 text-right font-thin pl-4 pr-1">
            {k.display(mapTmcData?.[k.col])}
          </div>
        </div>
      ))}
    </div>
  );
};

export { npmrdsHoverComp };
