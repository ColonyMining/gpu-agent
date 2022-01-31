const childProcess = require("child_process");
const fs = require("fs");
const temp = require("temp");
fs.createWriteStream();

function CommandLineExecutor() {
  let globalErrorHandler = { handle: () => {} };

  return {
    errorHandler(errorHandler = { handle: () => {} }) {
      globalErrorHandler = errorHandler;
    },

    execute: function (command) {
      let response;

      try {
        temp.track();
        const stream = temp.createWriteStream();

        childProcess.execSync(command, { stdio: [stream, stream, stream] });

        response = stream.toString();
      } catch (e) {
        response = e.stderr.toString().trim();
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
