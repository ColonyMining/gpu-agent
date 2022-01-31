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
        const tmpFile = `/tmp/${uuid()}.out`;
        const stream = fs.createWriteStream(tmpFile);

        childProcess.execSync(command, { stdio: [stream, stream, stream] });

        response = fs.readFileSync(tmpFile).toString("utf-8");
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
