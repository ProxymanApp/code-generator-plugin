const SwiftAlamofireCodeGenerator = require("./targets/swift-alamofire/SwiftAlamofireCodeGenerator");

exports.convert = (request, target) => {
  switch (target) {
    case "swift-alamofire":
      return SwiftAlamofireCodeGenerator.generate(request);
    default:
      return `Unknow target ${target}`;
  }
};
