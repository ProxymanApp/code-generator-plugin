const SwiftAlamofireCodeGenerator = require("./targets/SwiftAlamofireCodeGenerator");
const SwiftNSURLSessionGenerator = require("./targets/SwiftNSURLSessionCodeGenerator");
const SwiftMoyaCodeGenerator = require("./targets/SwiftMoyaCodeGenerator");
const ObjectiveCNSURLSession = require("./targets/ObjCNSURLSessionCodeGenerator");
const AxiosCodeGenerator = require("./targets/AxiosCodeGenerator");
const HTTPieCodeGenerator = require("./targets/HTTPieCodeGenerator");
const GoHTTPCodeGenerator = require("./targets/GoHTTPCodeGenerator");
const JavaApacheHTTPClientFluentAPICodeGenerator = require("./targets/JavaApacheHttpClientFluentAPICodeGenerator");
const JavascriptJQueryCodeGenerator = require("./targets/JavaScriptjQueryCodeGenerator");
const NodeFetchCodeGenerator = require("./targets/NodeFetchCodeGenerator");
const NodeHTTPCodeGenerator = require("./targets/NodeHTTPCodeGenerator");
const PostmanCollectionCodeGenerator = require("./targets/PostmanCollection2CodeGenerator");
const PythonRequestGenerator = require("./targets/PythonRequestsCodeGenerator");
const DartRequestGenerator = require("./targets/DartHTTPCodeGenerator");

const swiftObjectToJSObject = (items) => {
  // Convert [[String]] to JS Object
  // If we pass an Dictionary from Swift to JavascriptCore, the Object doesn't remain the key order
  // We intentionally follow this approach to keep the key order
  if (items) {
    var object = {};
    items.forEach((item) => {
      const key = item[0];
      const value = item[1];
      object[key] = value;
    });
    return object;
  }
  return items;
};

exports.convert = (request, target, options) => {
  // Convert [[String]] to JS Object
  // If we pass an Dictionary from Swift to JavascriptCore, the Object doesn't remain the key order
  // We intentionally follow this approach to keep the key order
  if (request._headers) {
    request.headers = swiftObjectToJSObject(request._headers);
  }

  // Apply to multipart
  if (request._multipartBody) {
    request.multipartBody = swiftObjectToJSObject(request._multipartBody);
  }

  // url encoded
  if (request._urlEncodedBody) {
    request.urlEncodedBody = swiftObjectToJSObject(request._urlEncodedBody);
  }

  switch (target) {
    case "swift-alamofire":
      return SwiftAlamofireCodeGenerator.generate(request);
    case "swift-urlsession":
      return SwiftNSURLSessionGenerator.generate(request);
    case "swift-moya":
      return SwiftMoyaCodeGenerator.generate(request);
    case "objc-nsurlsession":
      return ObjectiveCNSURLSession.generate(request);
    case "axios":
      return AxiosCodeGenerator.generate(request);
    case "httpie":
      return HTTPieCodeGenerator.generate(request);
    case "go":
      return GoHTTPCodeGenerator.generate(request);
    case "java":
      return JavaApacheHTTPClientFluentAPICodeGenerator.generate(request);
    case "javascript-jquery":
      return JavascriptJQueryCodeGenerator.generate(request);
    case "node-fetch":
      return NodeFetchCodeGenerator.generate(request);
    case "node-http":
      return NodeHTTPCodeGenerator.generate(request);
    case "postmanCollection2":
      // Request must be a HAR JSON string
      if (request.harString) {
        const obj = JSON.parse(request.harString);
        return PostmanCollectionCodeGenerator.generate(obj, options);
      }
    case "python-request":
      return PythonRequestGenerator.generate(request);
    case "dart":
      return DartRequestGenerator.generate(request);
    default:
      return `Unknow target ${target}`;
  }
};
