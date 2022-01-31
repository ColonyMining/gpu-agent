const childProcess = require("child_process");
const ErrorHandler = require("./ErrorHandler");

function CommandLineExecutor() {
  let globalErrorHandler = { handle: () => {} };

  return {
    errorHandler(errorHandler = { handle: () => {} }) {
      globalErrorHandler = errorHandler;
    },

    execute: function (command) {
      const output = childProcess.execSync(command, {
        stdio: ["pipe", "pipe", "ignore"]
      });
      const response = output.toString("utf-8").trim();

      try {
        globalErrorHandler.handle(response);
      } catch (e) {
        console.error(`ERROR: ${e.message}`);
        process.exit(1);
      }

      return response;
    }
  };
}

module.exports = CommandLineExecutor;
