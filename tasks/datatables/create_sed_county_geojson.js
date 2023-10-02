const db = require("./db.js");
var sql = require("sql");

var flatMapDeep = require("lodash").flatMapDeep;
var keys = require("lodash").keys;

sql.setDialect("postgres");

// let vars = {
//   tot_pop: { name: "Total Population" },
//   hh_pop: { name: "Households" },
//   hh_num: { name: "Household Population" },
//   hh_size: { name: "Household Size" },
//   hh_inc: { name: "Household Income" },
//   elf: { name: "Employed Labor Force" },
//   emptot: { name: "Total Employment" },
//   empret: { name: "Retail Employment" },
//   empoff: { name: "Office Employment" },
//   empprop: { name: "Proprietors Employment"},
//   earnwork: { name: "Earnings" },
//   unvenrol: { name: "University Enrollment" },
//   k_12_etot: { name: "School Enrollment" },
//   gqpop: { name: "Group Quarters Population" },
//   gqpopins: { name: "Group Quarters Institutional Population" },
//   gqpopstr: { name: "Group Quarters Other Population" },
//   gqpopoth: { name: "Group Quarters Homeless Population" }
// };



let vars = {
    "tot_pop": {name: "Total Population"},
    "tot_emp": {name: 'Total Employment'},
    "emp_pay": {name: 'Payroll Employment'},
    "emp_prop": {name: 'Proprietors Employment'},
    "hh_pop": {name: 'Household Population'},
    "gq_pop": {name: 'Group Quarters Population'},
    "hh_num": {name: 'Households'},
    "hh_size": {name: 'Household Size'},
    "emplf": {name: 'Employed Labor Force'},
    "lf": {name: 'Labor Force'}
}

const fetch = async () => {
  // change sources below, and server in db.js
  const schema = "sed_taz";
  // const getSourcesSql = `select id from public.sources where datasource_type = 'sed_taz'`
  // let {rows: sources } = await db.query(getSourcesSql);
  // console.log('sources', sources)
  // 45 , 64
  const sources = [{ id: 45 }];
  return (
    sources
      //.filter(s => s.id === 61)
      .reduce(
        async (acc, s) =>
          acc.then(async () => {
            //let tablename = `sed_taz_source_${s.id}`
            const sql = `
            with s as (
SELECT
        areas.name,
        df.area_id,
        view_id,
        statistics.name as stat,
        jsonb_agg(
            json_build_object( statistics.name || '_' || df.year, value)
        ) as values
    FROM   public.demographic_facts df
    JOIN public.areas areas                 
        ON area_id = areas.id
    join public.statistics as statistics on statistics.id = df.statistic_id 
    WHERE view_id IN (
        SELECT v.id
        FROM public.views v
        JOIN sources s
        ON v.source_id = s.id
        
        where s.id = ${s.id}
      and deleted_at is null
    )
    group by areas.name, df.area_id,df.view_id, statistics.name
    
),
    t as (
     select name, 
        s.area_id, 
        jsonb_agg(
            values
        ) as value 
    from s
        group by name, s.area_id
    )


    SELECT areas.name as county,
        value
        ,st_asgeojson(geom) as geometry 
    from t
    JOIN public.areas areas
    ON t.area_id = areas.id
    JOIN base_geometries geoms
    ON geoms.id = base_geometry_id
        
        `;
            // console.log('sql', sql)
            let res = await db.query(sql);
            res = res.rows || [];

            const output = {
              type: "FeatureCollection",
              features: [],
            };

            const innerKeys = flatMapDeep(res[0]?.value[0], (obj) => keys(obj));
            let years = innerKeys?.map((k) => Number(k?.split("_")[1]));
            years = years?.sort();

            //console.log(JSON.stringify(res[0]))
            res.forEach((taz) => {
              let feature = {
                type: "Feature",
                properties: {
                  county: taz?.taz,
                  county: taz?.county,
                },
                geometry: JSON.parse(taz?.geometry),
              };
              taz?.value?.forEach((v, i) => {
                v?.forEach((col, j) => {
                  let colName = Object.keys(col)[0];
                  let colValue = Object.values(col)[0];
                  let shortName = Object.keys(vars).filter(
                    (k) => vars[k].name === colName.split("_")[0]
                  );

                  let year = colName.split("_")[1] || 2000;
                  let indexOfYear = years?.indexOf(Number(year));
                  feature.properties[`${shortName[0]}_${indexOfYear}`] =
                    colValue;
                });
              });
              output.features.push(feature)
            })
            console.log(JSON.stringify(output))
          }),
        Promise.resolve()
      )
  );
};

fetch().then((d) => {
  //console.log('done')
});
