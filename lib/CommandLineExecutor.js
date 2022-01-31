const childProcess = require("child_process");
const fs = require("fs");
const { v4: uuid } = require("uuid");

function CommandLineExecutor() {
  let globalErrorHandler = { handle: () => {} };

  return {
    errorHandler(errorHandler = { handle: () => {} }) {
      globalErrorHandler = errorHandler;
    },

    execute: function (command) {
      let response;

      try {
        const output = childProcess.execSync(command, { stdio: ["pipe", "pipe", "pipe"] });
        response = output.toString().trim();
        if (response === "") {
          console.error("Error executing command");
          process.exit(1);
        }
      } catch (e) {
        console.error("ERROR", e);
        response = `ERROR: ${e.message}`;
      }

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
