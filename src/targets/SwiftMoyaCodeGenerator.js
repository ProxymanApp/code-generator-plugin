const Mustache = require("mustache");
const URI = require("URIjs");

exports.generate = function (request) {
  request.name = "makeRequest"
  var apiName = "";
  var url = URI.parse(request.url);
  var requestMethod = request.method.toLowerCase();
  var headers = "";

  var requestParameter = "";
  var requestName = request.name;
  var queryParamsType = "";
  var pathExtension = url.path;

  if (request.parent) {
    apiName = request.parent.name;
  }

  if (request.name.indexOf("{") > 0) {
    requestParameter = request.name.match("{([^']+)}")[1];
    requestName = requestName.replace(request.name.match("{([^']+)}")[0], "");
    queryParamsType = requestParameter + ": Int";
  }

  requestName = requestName.replace("/", "");

  var pathFragments = pathExtension.split("/");
  for (var i = 0; i < pathFragments.length; i++) {
    if (pathFragments[i] == requestName) {
      pathExtension = pathExtension.replace(
        pathFragments[i + 1],
        "\\(" + requestParameter + ")"
      );
      break;
    }
  }

  for (header_name in request.headers) {
    var header_value = request.headers[header_name];
    if (header_name.toLowerCase() !== "authorization") {
      if (headers) {
        headers = headers + ", \n                ";
      }
      headers = headers + '"' + header_name + '" : "' + header_value + '"';
    }
  }

  var view = {
    request: request,
    baseURL: url.protocol + "://" + url.hostname,
    pathExtension: pathExtension,
    requestName: requestName,
    requestParameter: "let " + requestParameter,
    apiName: apiName,
    requestMethod: requestMethod,
    headers: headers,
  };

  var query = url.query;
  if (query) {
    var fragments = query.split("&");
    var keyvalue = fragments[0].split("=");

    if (queryParamsType) {
      queryParamsType =
        queryParamsType +
        ", " +
        keyvalue[0] +
        ": " +
        typeForObject(keyvalue[1]);
    } else {
      queryParamsType = keyvalue[0] + ": " + typeForObject(keyvalue[1]);
    }
    var queryParamsTemplate = "_";
    var queryParams = "let " + keyvalue[0];
    var queryDictString = '"' + keyvalue[0] + '": ' + keyvalue[0];

    for (var i = 1; i < fragments.length; i++) {
      keyvalue = fragments[i].split("=");
      queryParamsType += ", " + keyvalue[0] + ": " + typeForObject(keyvalue[1]);
      queryParamsTemplate += ", _";
      queryParams += ", let " + keyvalue[0];
      queryDictString += ', "' + keyvalue[0] + '": ' + keyvalue[0];
    }

    view["queryParamsTemplate"] = queryParamsTemplate;
    view["queryParams"] = queryParams;
    view["queryDictString"] = queryDictString;
  }

  view["queryParamsType"] = queryParamsType;

  var jsonBody = request.jsonBody;
  if (jsonBody && Object.keys(jsonBody).length > 0) {
    var firstKey = Object.keys(jsonBody)[0];
    var jsonBodyParamsType =
      firstKey + ": " + typeForObject(jsonBody[firstKey]);
    var jsonBodyParamsTemplate = "_";
    var jsonBodyParams = "let " + firstKey;
    var jsonBodyDictString = '"' + firstKey + '": ' + firstKey;
    for (var i = 1; i < Object.keys(jsonBody).length; i++) {
      var key = Object.keys(jsonBody)[i];
      if (jsonBody.hasOwnProperty(key)) {
        jsonBodyParamsType += ", " + key + ": " + typeForObject(jsonBody[key]);
        jsonBodyParamsTemplate += ", _";
        jsonBodyParams += ", let " + key;
        jsonBodyDictString += ', "' + key + '": ' + key;
      }
    }

    view["jsonBodyParamsType"] = jsonBodyParamsType;
    view["jsonBodyParamsTemplate"] = jsonBodyParamsTemplate;
    view["jsonBodyParams"] = jsonBodyParams;
    view["jsonBodyDictString"] = jsonBodyDictString;
    view["headline"] = `${requestMethod.toUpperCase()} ${url.hostname}`;
    view["version"] = metadata.version;
  }

  return Mustache.render(codeTemplate, view);
};

function isNumber(obj) {
  return !isNaN(parseFloat(obj));
}

function typeForObject(obj) {
  return isNumber(obj) ? "Int" : "String";
}

const metadata = {
  name: "Swift Moya",
  fileExtension: "swift",
  identifier: "com.proxyman.plugin.SwiftMoyaGenerator",
  author: "Paw and Proxyman",
  version: "1.0.0",
};

// Inlcude a template because we could not build require("fs") in webpack

const codeTemplate = 
`import Moya

/**
 Proxyman Code Generator ({{{version}}}): Swift + Moya
 {{{headline}}}
 */

public enum {{{apiName}}}API {
    case {{{requestName}}}{{#queryParamsType}}({{{queryParamsType}}}){{/queryParamsType}}
}

extension {{{apiName}}}API: TargetType {

    public var baseURL: URL { return URL(string: "{{{baseURL}}}")! }

    public var path: String {
        switch self {
        case .{{{requestName}}}:
            return "{{{pathExtension}}}"
        }
    }

    public var method: Moya.Method {
        switch self {
        case .{{{requestName}}}:
            return .{{{requestMethod}}}
        }
    }

    public var task: Task {
        switch self {
        {{#queryParams}}
        case .{{{requestName}}}({{{queryParams}}}):
            return {{#queryDictString}}.requestParameters(parameters: [{{{queryDictString}}}], encoding: URLEncoding.default){{/queryDictString}}
        {{/queryParams}}
        {{#jsonBodyParams}}
        case .{{{requestName}}}({{{jsonBodyParams}}}):
            return {{#jsonBodyDictString}}.requestParameters(parameters: [{{{jsonBodyDictString}}}], encoding: URLEncoding.default){{/jsonBodyDictString}}
        {{/jsonBodyParams}}
        {{^queryParams}}
        {{^jsonBodyParams}}
        case .{{{requestName}}}:
            return .requestPlain
        {{/jsonBodyParams}}
        {{/queryParams}}
        }
    }

    public var headers: [String: String]? {
        return [{{#headers}}{{{headers}}}{{/headers}}]
    }

    public var sampleData: Data {
        switch self {
        case .{{{requestName}}}:
            return "{}".data(using: String.Encoding.utf8)!
        }
    }
}
`;
