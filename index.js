const CodeGenerator = require("./src/code-generator");

const onRun = (request, target, options) => {
  return CodeGenerator.convert(request, target, options);
};

// Export to JavascriptCore
global.onRun = onRun;