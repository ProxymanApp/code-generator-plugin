var HTTPSnippet = require("httpsnippet");

var onRun = function (method, url) {
  var snippet = new HTTPSnippet({
    method: method,
    url: url
  });
  return snippet.convert("swift");
};

global.onRun = onRun;