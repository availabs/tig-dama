const db = require("./db.js");
var sql = require("sql");

var flatMapDeep = require("lodash").flatMapDeep;
var keys = require("lodash").keys;

sql.setDialect("postgres");



const fetch = async () => {
  // change sources below, and server in db.js
  const schema = "sed_taz";
  // const getSourcesSql = `select id from public.sources where datasource_type = 'sed_taz'`
  // let {rows: sources } = await db.query(getSourcesSql);
  // console.log('sources', sources)
  // 45 , 64
  const views = [{ id: 54 }];
  



  const sql = `SELECT
  jsonb_build_object(
    'type',       'Feature',
    'properties', jsonb_build_object('rtp_id',rtp_id, 'year',a.year,'ptype',b.name, 'cost', estimated_cost, 'infrastructure',c.name, 'county_id',e.name, 'county_fips', e.fips_code,'sponsor_id',d.name, 'plan_portion',f.name,'description',a.description),
    'geometry',   ST_AsGeoJSON(geography::geometry)::JSON
  ) AS feature
  FROM
public.rtp_projects as a
left join ptypes as b on a.ptype_id = b.id
left join infrastructures as c on a.infrastructure_id = c.id
left join sponsors as d on a.sponsor_id = d.id
left join areas as e on a.county_id = e.id
left join plan_portions as f on a.plan_portion_id = f.id
where view_id = 141
  `
  let resp = await db.query(sql)

  const output = {
    type: "FeatureCollection",
    features: resp.rows.map(d => d.feature)
  }

  console.log(JSON.stringify(output))

 }       


fetch().then((d) => {
  //console.log('done')
  db.end()
});
