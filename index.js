// var HTTPSnippet = require("httpsnippet");

// var onRun = function (method, url) {
//   var snippet = new HTTPSnippet({
//     method: method,
//     url: url
//   });
//   return snippet.convert("swift");
// };

// global.onRun = onRun;

// Use Paw extension

const CodeGenerator = require("./src/code-generator");

var onRun = (request) => {

  const result = CodeGenerator.convert(request, "swift")
  console.log(result);
}

var request = {}
onRun(request);
