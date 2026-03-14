const URI = require("URIjs");

exports.generate = (harContent, options) => {
  const postmanContent = {
    info: generateInfo(),
    item: generateItems(harContent)
  };

  // Ugly way to get option data
  // For some reasons, webpack could not build the ?? or || operator
  var isPrettyPrint = true;
  if (options) {
    if (options.isPrettyPrint !== undefined) {
      isPrettyPrint = options.isPrettyPrint;
    }
  }
  if (isPrettyPrint) {
    return JSON.stringify(postmanContent, 2, '\t');
  } else {
    return JSON.stringify(postmanContent);
  }
};

const generateInfo = () => {
  return {
    name: "Proxyman Code Generator: PostmanCollection2",
    description: "",
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
  const harRequestUrl = new URI(harRequest.url);
  const harResponse = harContentEntry.response;
  const item = {
    name: generateItemName(
      harRequest.method,
      harRequestUrl.pathname()
    ),
    request: generateItemRequest(harRequest),
  };
  return item;
};

const generateItemName = (method, path) => {
  return method + " " + path;
};

const generateItemRequest = (harRequest) => {
  const harRequestUrl = new URI(harRequest.url);
  var itemRequest = {
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
  var itemRequestUrl = {
    raw: harRequestUrl.toString(),
    protocol: harRequestUrl.protocol(),
    host: harRequestUrl.hostname(),
    path: harRequestUrl.path(),
  };
  if (harRequestUrl.port().length != 0) {
    itemRequestUrl.port = harRequestUrl.port();
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
    ":scheme",
    ":authority",
    ":method",
    ":path",
    ":host"
  ];
  return !irrelevantHarHeaders.includes(header.name.toLowerCase());
};

const renameHeaderKey = (header) => {
  return { key: header.name, value: header.value };
};

const generateItemRequestBody = (requestBody) => {
  const mimeType = (requestBody.mimeType || "").toLowerCase();

  if (mimeType.includes("application/x-www-form-urlencoded")) {
    return {
      mode: "urlencoded",
      urlencoded: (requestBody.params || []).map((p) => ({
        key: p.name,
        value: p.value,
      })),
    };
  }

  if (mimeType.includes("multipart/form-data")) {
    return {
      mode: "formdata",
      formdata: (requestBody.params || []).map((p) => ({
        key: p.name,
        value: p.value,
      })),
    };
  }

  // Raw body modes
  var language = "text";
  if (mimeType.includes("application/json")) {
    language = "json";
  } else if (mimeType.includes("xml")) {
    language = "xml";
  } else if (mimeType.includes("text/html")) {
    language = "html";
  }

  return {
    mode: "raw",
    raw: requestBody.text,
    options: { raw: { language: language } },
  };
};