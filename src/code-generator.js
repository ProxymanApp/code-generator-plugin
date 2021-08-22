const SwiftAlamofireCodeGenerator = require("./targets/SwiftAlamofireCodeGenerator");
const SwiftNSURLSessionGenerator = require("./targets/SwiftNSURLSessionCodeGenerator");
const SwiftMoyaCodeGenerator = require("./targets/SwiftMoyaCodeGenerator");
const ObjectiveCNSURLSession = require("./targets/ObjCNSURLConnectionCodeGenerator");
const AxiosCodeGenerator = require("./targets/AxiosCodeGenerator");

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

exports.convert = (request, target) => {
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
    default:
      return `Unknow target ${target}`;
  }
};
