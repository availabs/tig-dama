export const PROJECT_NAME = "TIG";

let API_HOST = "https://tig22.nymtc.org/graph"; //"https://graph.availabs.org/";
let AUTH_HOST = "https://availauth.availabs.org";
let CLIENT_HOST = "tig22.nymtc.org";
let DAMA_HOST = "https://tig22.nymtc.org/dama";
let PG_ENV = 'tig_dama_dev'

if (process.env.NODE_ENV === "development") {

  // API_HOST =  "http://localhost:4444";
  // DAMA_HOST = "http://localhost:4444";
  DAMA_HOST = "https://tig22.nymtc.org/graph";
  // PG_ENV = 'pan';
  // PG_ENV = "freight_data";
  CLIENT_HOST = "localhost:5173";
}

export { API_HOST, AUTH_HOST, CLIENT_HOST, DAMA_HOST, PG_ENV };
