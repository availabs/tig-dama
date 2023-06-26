import zip from './zip'
import downloadjs from "downloadjs"

export default function download(gj, options, aliasString, tmcMetaString) {
    zip(gj, options, aliasString, tmcMetaString)
      .then(function(blob) { downloadjs(blob, options.file + '.zip'); });
};
