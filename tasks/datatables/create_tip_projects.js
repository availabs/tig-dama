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
              'properties', jsonb_build_object('tip_id',tip_id, 'ptype_id',ptype_id, 'cost',cost, 'mpo_id',mpo_id, 'county_id',county_id, 'sponsor_id',sponsor_id, 'description',description),
              'geometry',   ST_AsGeoJSON(geography::geometry)::JSON
            ) AS feature
          FROM
        public.tip_projects
        where view_id = 54
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
