import {useEffect, useContext} from "react";
import { NPMRDS_ATTRIBUTES } from "../constants";
import { DamaContext } from "~/pages/DataManager/store";

import {
  falcorGraph,
} from "~/modules/avl-components/src"

const API_HOST = 'https://tigtest2.nymtc.org/api2/graph'
const tig_falcor = falcorGraph(API_HOST)


// export const npmrdsMapFilter = (props) => {
//   console.log("npmrds map filter props::", props)
//   const {filters} = props;
//   // useEffect(() => {
//   //   // let year = filters.year.value,
//   //   // month = filters.month.value,
//   //   // geoids = filters.geography.domain.filter(d => d.name === filters.geography.value)[0].value,
//   //   // filtered = this.geographies
//   //   //     .filter(({value}) => geoids.includes(value));

//   //   // // console.log('request', ['tig','npmrds',`${month}|${year}`,filtered.map(d => `${d.geolevel}|${d.value}`), 'data'])

//   //   // let requests = filtered.reduce((a, c) => {
//   //   //     a.push(['tig', 'npmrds', `${month}|${year}`, `${c.geolevel}|${c.value}`, 'data'])
//   //   //     a.push(["geo", c.geolevel.toLowerCase(), c.value, "geometry"]);
//   //   //     return a;
//   //   // }, [])
//   //   // return falcor.get(...requests).then(() => this.updateLegendTitle())

//   //   //https://tigtest2.nymtc.org/api2/graph?paths=%5B%5B%22tig%22%2C%22datasources%22%2C%22views%22%2C%22sourceId%22%2C%5B2%2C5%2C7%2C8%2C9%2C45%2C47%2C48%2C49%2C50%2C61%2C64%2C69%2C70%2C71%2C72%2C73%2C74%2C75%2C76%2C77%2C78%2C79%2C88%2C89%2C90%2C91%5D%2C%22length%22%5D%5D&method=get
//   //   //tigtest2.nymtc.org/api2/graph?paths=
      


//   //   async function getData() {
//   //     console.log("getting data");
//   //     //const url = `https://tigtest2.nymtc.org/api2/graph?paths=%5B%5B%22tig%22%2C%22datasources%22%2C%22views%22%2C%22sourceId%22%2C%5B2%2C5%2C7%2C8%2C9%2C45%2C47%2C48%2C49%2C50%2C61%2C64%2C69%2C70%2C71%2C72%2C73%2C74%2C75%2C76%2C77%2C78%2C79%2C88%2C89%2C90%2C91%5D%2C%22length%22%5D%5D&method=get`
//   //     const res = await fetch(
//   //       "https://tigtest2.nymtc.org/api2/graph?" +
//   //         new URLSearchParams({
//   //           paths: '[["tig", "npmrds", "10|2020", ["county_code|10001"], "data"]]',
//   //           method: "get",
//   //         })
//   //     );
//   //     const pollingData = await res.json();
//   //     console.log(pollingData);
//   //   }

//   //   getData();
//   // },[filters])



//   return (
//     <div>
//       Hello world
//     </div>
//   );
// }


const npmrdsMapFilter = ({ filters, setFilters, filterType = "mapFilter" }) => {
  const allContext = useContext(DamaContext);
  const year =  filters?.year?.value;
console.log("npmrds map filter, allContext::", allContext)
  useEffect(() => {
    const newFilters = {...filters};
    if (!year) {
      newFilters.year = { value: 2019 }
    }    
    setFilters(newFilters)
  }, []);


  useEffect(() => {


    //https://tigtest2.nymtc.org/api2/graph?paths=%5B%5B%22tig%22%2C%22datasources%22%2C%22views%22%2C%22sourceId%22%2C%5B2%2C5%2C7%2C8%2C9%2C45%2C47%2C48%2C49%2C50%2C61%2C64%2C69%2C70%2C71%2C72%2C73%2C74%2C75%2C76%2C77%2C78%2C79%2C88%2C89%2C90%2C91%5D%2C%22length%22%5D%5D&method=get
    //tigtest2.nymtc.org/api2/graph?paths=
      


    async function getData() {
      console.log("getting data");
      // let year = filters.year.value,
      // month = filters.month.value,
      // geoids = filters.geography.domain.filter(d => d.name === filters.geography.value)[0].value,
      // filtered = this.geographies
      //     .filter(({value}) => geoids.includes(value));

      // console.log('request', ['tig','npmrds',`${month}|${year}`,filtered.map(d => `${d.geolevel}|${d.value}`), 'data'])

      let requests = ["tig", "npmrds", "10|2020", ["county_code|10001"], "data"]
      return tig_falcor.get(requests).then((resp) => {
        console.log("resp from tig_falcor", resp)
      })
    }

    getData();
  },[filters])


  return (
    <div className="flex flex-wrap flex-1 border-blue-100 pt-1 pb-1 justify-start gap-y-2">
      {Object.keys(NPMRDS_ATTRIBUTES).filter(attrKey => NPMRDS_ATTRIBUTES[attrKey][filterType]).map(attrName => {
        return <FilterInput key={`filter_input_${attrName}`} setFilters={setFilters} filters={filters} name={attrName} attribute={NPMRDS_ATTRIBUTES[attrName]} value={filters[attrName]?.value || ""}/>
      })}
    </div>
  );
};

const FilterInput = ({ attribute, name, value, setFilters, filters }) => {
  const { values, type } = attribute;
  const inputValue = type === "range" ? value[0] : value;
  return (
    <div className="flex justify-start content-center flex-wrap">
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">
        {name.split("_").join(" ")}:
      </div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={inputValue}
          onChange={(e) =>
            setFilters({
              ...filters,
              [name]: { value: e.target.value },
            })
          }
        >
          {values?.map((k, i) => (
            <option key={i} className="ml-2  truncate" value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export { npmrdsMapFilter };