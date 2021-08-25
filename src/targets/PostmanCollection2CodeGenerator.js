const makePmAuthKeyValueRaw = (key, value, type) => {
  const pmAuthKeyValue = {
    key,
    value,
    type,
  };
  return pmAuthKeyValue;
};
const makePmAuthKeyValue = (key, value, context) => {
  let pmValue = "";
  if (typeof value === "string") {
    pmValue = value;
  } else if (value) {
    pmValue = convertEnvString(value, context);
  }
  return makePmAuthKeyValueRaw(key, pmValue, "string");
};
const convertAuthBasic = (pawBasicAuth, context) => {
  const pmAuth = {
    type: "basic",
    basic: [
      makePmAuthKeyValue("username", pawBasicAuth.username, context),
      makePmAuthKeyValue("password", pawBasicAuth.password, context),
    ],
  };
  return pmAuth;
};
const convertAuthOAuth1 = (pawOAuth1, context) => {
  const pmAuth = {
    type: "oauth1",
    oauth1: [
      makePmAuthKeyValue("consumerKey", pawOAuth1.oauth_consumer_key, context),
      makePmAuthKeyValue(
        "consumerSecret",
        pawOAuth1.oauth_consumer_secret,
        context
      ),
      makePmAuthKeyValue("token", pawOAuth1.oauth_token, context),
      makePmAuthKeyValue("tokenSecret", pawOAuth1.oauth_token_secret, context),
      makePmAuthKeyValue(
        "signatureMethod",
        pawOAuth1.oauth_signature_method || "",
        context
      ),
      makePmAuthKeyValue("version", pawOAuth1.oauth_version || "", context),
      makePmAuthKeyValueRaw("addParamsToHeader", false, "boolean"),
      makePmAuthKeyValueRaw("addEmptyParamsToSign", false, "boolean"),
    ],
  };
  return pmAuth;
};
const convertAuthOAuth2 = (pawOAuth2, context) => {
  const pmAuth = {
    type: "oauth2",
    oauth2: [
      makePmAuthKeyValue("accessToken", pawOAuth2.token || null, context),
      makePmAuthKeyValue("addTokenTo", "header", context),
    ],
  };
  return pmAuth;
};
const convertAuthDigest = (pawDigestDv, context) => {
  const pmAuth = {
    type: "digest",
    digest: [
      makePmAuthKeyValue("username", pawDigestDv.username, context),
      makePmAuthKeyValue("password", pawDigestDv.password, context),
    ],
  };
  return pmAuth;
};
const convertAuthHawk = (pawHawkDv, context) => {
  const pmAuth = {
    type: "hawk",
    hawk: [
      makePmAuthKeyValue("authId", pawHawkDv.id, context),
      makePmAuthKeyValue("authKey", pawHawkDv.key, context),
      makePmAuthKeyValue("algorithm", pawHawkDv.algorithm, context),
    ],
  };
  return pmAuth;
};
const convertAuth = (pawRequest, context) => {
  // basic auth
  const pawBasicAuth = pawRequest.getHttpBasicAuth(true);
  if (pawBasicAuth) {
    return convertAuthBasic(pawBasicAuth, context);
  }
  // OAuth 1
  const pawOAuth1 = pawRequest.getOAuth1(true);
  if (pawOAuth1) {
    return convertAuthOAuth1(pawOAuth1, context);
  }
  // OAuth 2
  const pawOAuth2 = pawRequest.getOAuth2(true);
  if (pawOAuth2) {
    return convertAuthOAuth2(pawOAuth2, context);
  }
  // Get Auth Header
  const pawAuthHeader = pawRequest.getHeaderByName("Authorization", true);
  if (!pawAuthHeader) {
    return null;
  }
  const pawAuthHeaderDv = pawAuthHeader.getOnlyDynamicValue();
  if (!pawAuthHeaderDv) {
    return null;
  }
  // Digest
  if (
    pawAuthHeaderDv.type ===
    "com.luckymarmot.PawExtensions.DigestAuthDynamicValue"
  ) {
    return convertAuthDigest(pawAuthHeaderDv, context);
  }
  // Hawk
  if (pawAuthHeaderDv.type === "uk.co.jalada.PawExtensions.HawkDynamicValue") {
    return convertAuthHawk(pawAuthHeaderDv, context);
  }
  return null;
};
const makeContentTypeHeader = (contentType) => {
  const pmHeader = {
    key: "Content-Type",
    value: contentType,
    disabled: false,
    description: null,
  };
  return [pmHeader];
};
const convertRaw = (dynamicString, onlyDynamicValue, context) => {
  // make header
  let pmHeaders = [];
  if (
    onlyDynamicValue &&
    onlyDynamicValue.type === "com.luckymarmot.JSONDynamicValue"
  ) {
    pmHeaders = makeContentTypeHeader("application/json");
  }
  // make body
  const value = convertEnvString(dynamicString, context);
  const pmBody = {
    mode: "raw",
    disabled: false,
    raw: value,
  };
  return [pmBody, pmHeaders];
};
const convertBodyUrlEncoded = (pawUrlEncodedBody, context) => {
  const pmParams = Object.entries(pawUrlEncodedBody).map(([key, value]) => {
    const pmParam = {
      key: key || "",
      value: convertEnvString(value, context),
      disabled: false,
      description: null,
    };
    return pmParam;
  });
  const pmBody = {
    mode: "urlencoded",
    disabled: false,
    urlencoded: pmParams,
  };
  return [pmBody, makeContentTypeHeader("application/x-www-form-urlencoded")];
};
const convertBodyMultipart = (pawMultipartBody, context) => {
  const pmParams = Object.entries(pawMultipartBody).map(([key, value]) => {
    // file
    const valueOnlyDv = value ? value.getOnlyDynamicValue() : null;
    if (
      valueOnlyDv &&
      valueOnlyDv.type === "com.luckymarmot.FileContentDynamicValue"
    ) {
      const pmParam = {
        key: key || "",
        disabled: false,
        type: "file",
        description: null,
        src: null,
      };
      return pmParam;
    }
    // string/text
    const pmParam = {
      key: key || "",
      value: convertEnvString(value, context),
      disabled: false,
      type: "text",
      description: null,
    };
    return pmParam;
  });
  const pmBody = {
    mode: "formdata",
    disabled: false,
    formdata: pmParams,
  };
  return [pmBody, makeContentTypeHeader("multipart/form-data")];
};
const convertBodyFile = (pawRequest) => {
  const pmBodyFile = {
    src: null,
    content: pawRequest.body || null,
  };
  const pmBody = {
    mode: "file",
    disabled: false,
    file: pmBodyFile,
  };
  return [pmBody, []];
};
const convertBody = (pawRequest, context) => {
  // URL-Encoded (urlencoded)
  const pawUrlEncodedBody = pawRequest.getUrlEncodedBody(true);
  if (pawUrlEncodedBody) {
    return convertBodyUrlEncoded(pawUrlEncodedBody, context);
  }
  // Multipart (formdata)
  const pawMultipartBody = pawRequest.getMultipartBody(true);
  if (pawMultipartBody) {
    return convertBodyMultipart(pawMultipartBody, context);
  }
  // Body as DV
  const pawBody = pawRequest.getBody(true);
  if (!pawBody) {
    return [null, []];
  }
  const pawBodyDv = pawBody.getOnlyDynamicValue();
  // File
  if (
    pawBodyDv &&
    pawBodyDv.type === "com.luckymarmot.FileContentDynamicValue"
  ) {
    return convertBodyFile(pawRequest);
  }
  // Raw
  return convertRaw(pawBody, pawBodyDv, context);
};
const convertEnvString = (dynamicString, context) => {
  if (!dynamicString) {
    return "";
  }
  return dynamicString.components
    .map((component) => {
      if (typeof component === "string") {
        return component;
      }
      if (
        component.type === "com.luckymarmot.EnvironmentVariableDynamicValue"
      ) {
        const envVarId = component.environmentVariable;
        const envVar = context.getEnvironmentVariableById(envVarId);
        if (envVar) {
          return `{{${envVar.name}}}`;
        }
      }
      return component.getEvaluatedString();
    })
    .join("");
};
const convertHeader = (pawHeader, pawRequest, context) => {
  // find any request variable
  let { value } = pawHeader;
  let description = null;
  const onlyDv = value ? value.getOnlyDynamicValue() : null;
  if (onlyDv && onlyDv.type === "com.luckymarmot.RequestVariableDynamicValue") {
    const requestVariableId = onlyDv.variableUUID;
    const requestVariable = pawRequest.getVariableById(requestVariableId);
    if (requestVariable) {
      value = requestVariable.value;
      description = requestVariable.description || null;
    }
  }
  const pmHeader = {
    key: pawHeader.name ? pawHeader.name.getEvaluatedString() : "",
    value: convertEnvString(value, context),
    disabled: !pawHeader.enabled,
    description,
  };
  return pmHeader;
};
const convertHeaders = (pawRequest, context) => {
  return pawRequest.getHeadersArray().map((pawHeader) => {
    return convertHeader(pawHeader, pawRequest, context);
  });
};
const convertUrlBaseEnvString = (urlString) => {
  if (!urlString) {
    return {
      protocol: null,
      host: [""],
      port: null,
      path: null,
    };
  }
  // parse URL string
  const match = urlString.match(
    /^([^:]+):\/\/([^:/]+)(?::([0-9]*))?(?:(\/.*))?$/i
  );
  if (!match) {
    return {
      protocol: null,
      host: [urlString],
      port: null,
      path: null,
    };
  }
  // split host
  let host = [];
  if (match[2]) {
    host = match[2].split(".");
  }
  // split path
  let path = [];
  if (match[4]) {
    path = match[4].split("/").filter((component) => {
      return !!component;
    });
  }
  return {
    protocol: match[1] || null,
    host,
    port: match[3] || null,
    path,
  };
};
const convertUrlBase = (pawRequest, context) => {
  // first convert to a Postman Env String which will be easier to parse
  const urlString = convertEnvString(pawRequest.getUrlBase(true), context);
  return convertUrlBaseEnvString(urlString);
};
const convertQueryParam = (pawQueryParam, pawRequest, context) => {
  // find any request variable
  let { value } = pawQueryParam;
  let description = null;
  const onlyDv = value ? value.getOnlyDynamicValue() : null;
  if (onlyDv && onlyDv.type === "com.luckymarmot.RequestVariableDynamicValue") {
    const requestVariableId = onlyDv.variableUUID;
    const requestVariable = pawRequest.getVariableById(requestVariableId);
    if (requestVariable) {
      value = requestVariable.value;
      description = requestVariable.description || null;
    }
  }
  const pmQueryParam = {
    key: pawQueryParam.name ? pawQueryParam.name.getEvaluatedString() : "",
    value: convertEnvString(value, context),
    disabled: !pawQueryParam.enabled,
    description,
  };
  return pmQueryParam;
};
const convertQueryParams = (pawRequest, context) => {
  const pawQueryParams = pawRequest.getUrlParametersArray();
  if (!pawQueryParams || pawQueryParams.length === 0) {
    return null;
  }
  return pawQueryParams.map((pawQueryParam) => {
    return convertQueryParam(pawQueryParam, pawRequest, context);
  });
};
const convertUrl = (pawRequest, context) => {
  const { protocol, host, port, path } = convertUrlBase(pawRequest, context);
  const pmUrl = {
    raw: convertEnvString(pawRequest.getUrl(true), context),
    query: convertQueryParams(pawRequest, context),
    protocol,
    host,
    port,
    path,
  };
  return pmUrl;
};
const makeCollection = (items, context) => {
  const pmCollectionInfo = {
    name: context.document.name || "Paw Export",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  };
  const pmCollection = {
    info: pmCollectionInfo,
    item: items,
  };
  return pmCollection;
};

exports.generate = (context, requests, options) => {
  const items = convertItems(requests);
  const pmCollection = makeCollection(items, context);
  return JSON.stringify(pmCollection, null, 2);
};

function convertItems(pawItems) {
  return pawItems.map((pawItem) => {
    if (pawItem.toString().match(/^RequestGroup/)) {
      return convertRequestGroup(pawItem);
    }
    return convertRequest(pawItem);
  });
}
function convertRequestGroup(pawGroup) {
  const pawChildren = pawGroup.getChildren().sort((a, b) => {
    return a.order - b.order;
  });
  const pmChildren = convertItems(pawChildren);
  const pmItem = {
    name: pawGroup.name,
    item: pmChildren,
    protocolProfileBehavior: null,
    response: [],
  };
  return pmItem;
}

function convertRequest(pawRequest) {
  // url
  const pmUrl = convertUrl(pawRequest, this.context);
  // body
  let [pmBody, pmBodyExtraHeaders] = convertBody(pawRequest, this.context);
  // auth
  const pmAuth = convertAuth(pawRequest, this.context);
  // header
  let pmHeaders = convertHeaders(pawRequest, this.context);
  const hasContentTypeHeader = pmHeaders.reduce((acc, pmHeader) => {
    return (
      acc ||
      (pmHeader.key && pmHeader.key.trim().toLowerCase() === "content-type")
    );
  }, false);
  if (hasContentTypeHeader) {
    pmBodyExtraHeaders = [];
  }
  // filter out `Authorization` header
  if (pmAuth) {
    pmHeaders = pmHeaders.filter((header) => {
      return !header.key || header.key.trim().toLowerCase() !== "authorization";
    });
  }
  const pmRequest = {
    method: pawRequest.getMethod(false),
    url: pmUrl,
    description: pawRequest.description,
    header: (pmBodyExtraHeaders || []).concat(pmHeaders),
    body: pmBody,
    auth: pmAuth,
  };
  const pmOptions = {
    followRedirects: pawRequest.followRedirects,
    followOriginalHttpMethod: pawRequest.redirectMethod,
    followAuthorizationHeader: pawRequest.redirectAuthorization,
  };
  const pmItem = {
    name: pawRequest.name,
    request: pmRequest,
    protocolProfileBehavior: pmOptions,
    response: [],
  };
  return pmItem;
}
