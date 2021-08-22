const URI = require("URIjs");

exports.generate = function (request) {
  request.urlParameters = URI(request.url).search(true);
  const config = {
      method: request.method,
      url: request.urlBase,
      ...extract(request, 'urlParameters', 'params'),
      ...extract(request, 'headers'),
      ...extract(request, 'httpBasicAuth', 'auth'),
      ...extract(request, 'timeout'),
      ...body(request)
  };

  return `axios(${JSON.stringify(config, 2, '\t')})`;
}

const isEmpty = (value) => {
  return value === undefined || value === null ||
      (typeof value === "object" && Object.keys(value).length === 0) ||
      (typeof value === "string" && value.trim().length === 0)
}

const extract = (request, pawKey, axiosKey = pawKey) => {
  if (request[pawKey] && !isEmpty(request[pawKey])) {
      return { [axiosKey]: request[pawKey] };
  } else {
      return {};
  }
}

const body = (request) => {
  if (['PUT', 'POST', 'PATCH'].indexOf(request.method) >= 0) {
      return { data: request.jsonBody || request.body || {} };
  } else {
      return {};
  }
}

const metadata = {
  name: "Axios",
  fileExtension: "swift",
  identifier: "com.proxyman.plugin.axiosCodeGenerator",
  author: "Paw and Proxyman",
  version: "1.0.0"
};