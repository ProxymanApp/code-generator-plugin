const SwiftAlamofireCodeGenerator = require("./targets/SwiftAlamofireCodeGenerator");

exports.convert = (request, target) => {
  console.log(SwiftAlamofireCodeGenerator.generate(request))
  return "Hi"
}