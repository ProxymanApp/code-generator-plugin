exports.generate = (harContent) => {
  const postmanContent = {
    info: generateInfo(),
    item: generateItems(harContent)
  };
  return JSON.stringify(postmanContent);
};

const generateInfo = () => {
  return {
    name: "Proxyman Code Generator: PostmanCollection2",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  };
};

const generateItems = (harContent) => {
  return harContent.log.entries.map((e) => {
    return generateItem(e);
  });
};

const generateItem = (harContentEntry) => {
  const harRequest = harContentEntry.request;
  const harRequestUrl = new URL(harRequest.url);
  const harResponse = harContentEntry.response;
  const item = {
    name: generateItemName(
      harRequest.method,
      harRequestUrl.pathname,
      harResponse.status
    ),
    request: generateItemRequest(harRequest),
  };
  return item;
};

const generateItemName = (method, path, responseCode) => {
  let status = "";
  switch (responseCode) {
    case 200:
      status = "successfully";
      break;
    case 201:
      status = "created";
      break;
    case 202:
      status = "accepted";
      break;
    case 204:
      status = "no-content";
      break;
    case 403:
      status = "forbidden";
      break;
  }
  let itemName = method + " " + path;
  return itemName;
};

const generateItemRequest = (harRequest) => {
  const harRequestUrl = new URL(harRequest.url);
  const itemRequest = {
    method: harRequest.method,
    url: generateItemRequestUrl(harRequestUrl, harRequest.queryString),
    header: generateItemRequestHeaders(
      harRequest.headers,
      Boolean(harRequest.bodySize)
    ),
  };
  if (harRequest.bodySize > 0) {
    itemRequest.body = generateItemRequestBody(harRequest.postData);
  }
  if (itemRequest.header.length == 0) {
    delete itemRequest.header;
  }
  return itemRequest;
};

const generateItemRequestUrl = (harRequestUrl, queryString) => {
  const harPathnameArray = harRequestUrl.pathname.split("/");
  const itemRequestUrl = {
    raw: harRequestUrl.toString(),
    protocol: harRequestUrl.protocol.slice(0, -1),
    host: harRequestUrl.hostname.split("."),
    path: harPathnameArray.slice(1),
  };
  if (harRequestUrl.port.length != 0) {
    itemRequestUrl.port = harRequestUrl.port;
  }
  if (queryString.length > 0) {
    itemRequestUrl.query = generateQueryParams(queryString);
  }
  return itemRequestUrl;
};

const generateQueryParams = (queryString) => {
  queryString.forEach((queryParam) => {
    queryParam.key = queryParam.name;
    delete queryParam.name;
  });
  return queryString;
};

const generateItemRequestHeaders = (harRequestHeaders, requestHasBody) => {
  return harRequestHeaders
    .filter(isNotContentTypeHeader(requestHasBody))
    .filter(isRelevantHeader)
    .map(renameHeaderKey);
};

const isNotContentTypeHeader = (requestHasBody) => (header) => {
  return !requestHasBody ? "content-type" != header.name.toLowerCase() : true;
};

const isRelevantHeader = (header) => {
  const irrelevantHarHeaders = [
    "host",
    "connection",
    "content-length",
    "pragma",
    "cache-control",
    "accept",
    "sec-fetch-dest",
    "user-agent",
    "origin",
    "sec-fetch-site",
    "sec-fetch-mode",
    ,
    "sec-fetch-user",
    "referer",
    "accept-encoding",
    "accept-language",
    "cookie",
    "upgrade-insecure-requests",
    ":scheme",
    ":authority",
    ":method",
    ":path",
    "api_key",
  ];
  return !irrelevantHarHeaders.includes(header.name.toLowerCase());
};

const renameHeaderKey = (header) => {
  return { key: header.name, value: header.value };
};

const generateItemRequestBody = (requestBody) => {
  return {
    mode: "raw",
    raw: requestBody.text,
    options: { raw: { language: "json" } },
  };
};