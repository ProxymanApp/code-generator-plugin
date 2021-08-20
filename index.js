const CodeGenerator = require("./src/code-generator");

const onRun = (request, target) => {
  return CodeGenerator.convert(request, target);
};

// Export to JavascriptCore
global.onRun = onRun;