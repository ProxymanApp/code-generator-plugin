const CodeGenerator = require("./src/code-generator");

const onRun = (request, target) => {
  return CodeGenerator.convert(request, target);
};

// Testing
// const body = {
//   "Name": "Proxyman",
//   "Country": "Singapore"
// }

// var request = {
//   name: "Swift Alamofire 4",
//   method: "POST",
//   url: "https://proxyman.io/get?data=123",
//   _headers: [
//     ["Host", "proxyman.io"],
//     ["Content-Type", "application/json"],
//     ["Content-Length", 123],
//     ["Acceptance", "json"]
//   ],
//   jsonBody: body
// }
// console.log(onRun(request, "swift-alamofire"));

// Export to JavascriptCore
global.onRun = onRun;