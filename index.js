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

const body = {
  "Name": "Proxyman",
  "Country": "Singapore"
}

var request = {
  name: "Swift Generator",
  method: "GET",
  url: "https://proxyman.io/get?data=123",
  headers: {
    "Host": "proxyman.io",
    "Content-Type": "application/json"
  },
  jsonBody: body
}
onRun(request);
