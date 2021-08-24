const URI = require("URIjs");

const addslashes = function (str) {
  return ("" + str).replace(/[\\"]/g, "\\$&").replace(/[\n\r\f]/gm, "\\n");
};

const urlTransform = function (request) {
  var name, url_params, url_params_object, value;
  url_params_object = (function () {
    var _uri;
    _uri = URI(request.url);
    return _uri.search(true);
  })();
  url_params = (function () {
    var results;
    results = [];
    for (name in url_params_object) {
      value = url_params_object[name];
      results.push({
        name: addslashes(name),
        value: addslashes(value),
      });
    }
    return results;
  })();
  return {
    fullpath: request.url,
    base: addslashes(
      (function () {
        var _uri;
        _uri = URI(request.url);
        _uri.search("");
        return _uri;
      })()
    ),
    params: url_params,
    has_params: url_params.length > 0,
  };
};

exports.generate = function (request) {
  const url = urlTransform(request);
  const headline = `${request.method.toUpperCase()} ${url.base}`;

  var config = {
    method: request.method.toLowerCase(),
    ...extract(request, "urlParameters", "params"),
    ...extract(request, "headers"),
  };

  let bodyConfig = body(request);
  var bodyStr = "";
  if (bodyConfig) {
    bodyStr = `const body = ${JSON.stringify(bodyConfig?.body, 2, "\t")}
  config.body = body
    `;
  }

  return `
  import fetch from 'node-fetch';
  
  // Proxyman Code Generator (${metadata.version}): NodeJS + Fetch
  // ${headline}

  var config = ${JSON.stringify(config, 2, "\t")}
  ${bodyStr}
  const response = await fetch('${request.url}', config);
  const data = await response.json();
  console.log(data);
  `;
};

const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
};

const extract = (request, pawKey, axiosKey = pawKey) => {
  if (request[pawKey] && !isEmpty(request[pawKey])) {
    return { [axiosKey]: request[pawKey] };
  } else {
    return {};
  }
};

const body = (request) => {
  if (["PUT", "POST", "PATCH"].indexOf(request.method) >= 0) {
    return {
      body: request.jsonBody || request.urlEncodedBody || request.body || null,
    };
  } else {
    return null;
  }
};

const metadata = {
  name: "NodeJS Fetch",
  fileExtension: "js",
  identifier: "com.proxyman.plugin.nodeFetchCodeGenerator",
  author: "Paw and Proxyman",
  version: "1.0.0",
};
