const childProcess = require("child_process");
const util = require("util");

const exec = util.promisify(childProcess.exec);

function CommandLineExecutor() {
  let globalErrorHandler = { handle: () => {} };

  return {
    errorHandler(errorHandler = { handle: () => {} }) {
      globalErrorHandler = errorHandler;
    },

    execute: async function (command) {
      let response;

      try {
        const { stdout, stderr } = await exec(command);
        if (stdout && stdout.trim() !== "") {
          response = stdout.trim();
        } else {
          response = stderr.trim();
        }
      } catch (e) {
        response = e.stderr.trim();
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
