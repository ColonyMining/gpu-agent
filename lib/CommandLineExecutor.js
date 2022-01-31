const childProcess = require("child_process");

function CommandLineExecutor() {
  let globalErrorHandler = { handle: () => {} };

  return {
    errorHandler(errorHandler = { handle: () => {} }) {
      globalErrorHandler = errorHandler;
    },

    execute: function (command) {
      let response;

      try {
        const output = childProcess.execSync(command, {
          stdio: ["pipe", "pipe", "ignore"]
        });
        response = output.toString("utf-8").trim();

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
