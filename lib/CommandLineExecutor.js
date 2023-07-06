const childProcess = require("child_process");
const util = require("util");

const exec = util.promisify(childProcess.exec);

class CommandLineExecutor {
  constructor() {
    this.globalErrorHandler = { handle: () => {} };
  }

  errorHandler(errorHandler) {
    this.globalErrorHandler = errorHandler;
  }

  async execute(command) {
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
      this.globalErrorHandler.handle(response);
    } catch (e) {
      console.error(`ERROR: ${(e.message || "").red}`, e);
      process.exit(1);
    }
  }
}

module.exports = CommandLineExecutor;
