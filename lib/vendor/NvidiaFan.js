const CommandLineExecutor = require("../CommandLineExecutor");
const NvidiaErrorHandler = require("./NvidiaErrorHandler");

class NvidiaFan {
  constructor(display = ":0") {
    this.display = display;
    this.assignments = [];
  }

  setFanSpeed(gpuIndex, fanIndex, speed) {
    this.assignments.push({ gpuIndex, fanIndex, speed });
  }

  async apply() {
    if (this.assignments.length === 0) {
      return;
    }

    const args = this.assignments
      .map(
        assignment =>
          ` -a [gpu:${assignment.gpuIndex}]/GPUFanControlState=1` +
          ` -a [fan:${assignment.fanIndex}]/GPUTargetFanSpeed=${assignment.speed}`
      )
      .join("");

    const executor = new CommandLineExecutor();
    executor.errorHandler(new NvidiaErrorHandler());
    await executor.execute(`nvidia-settings -c ${this.display} ${args}`);
  }
}

module.exports = NvidiaFan;
