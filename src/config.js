export const PROJECT_NAME = "TIG";

let API_HOST = "https://tig22.nymtc.org/graph/"; //"https://graph.availabs.org/";
let AUTH_HOST = "https://availauth.availabs.org";
let CLIENT_HOST = "tig22.nymtc.org";
let DAMA_HOST = "https://tig22.nymtc.org/dama";

if (process.env.NODE_ENV === "development") {
  // API_HOST = "https://graph.availabs.org";
  // API_HOST =  "http://localhost:4444";
  CLIENT_HOST = "localhost:3000";
  // DAMA_HOST = "http://localhost:4444"
  // DAMA_HOST = "https://dama-dev.availabs.org";
  
}

export { API_HOST, AUTH_HOST, CLIENT_HOST, DAMA_HOST };
