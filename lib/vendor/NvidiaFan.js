const colors = require("colors");
const CommandLineExecutor = require("../CommandLineExecutor");
const NvidiaErrorHandler = require("./NvidiaErrorHandler");

function NvidiaFan(display = ":0") {
  const assignments = [];

  return {
    setFanSpeed: function (gpuIndex, fanIndex, speed) {
      assignments.push({ gpuIndex, fanIndex, speed });
    },

    apply: function () {
      if (assignments.length === 0) {
        return;
      }

      const args = assignments
        .map(
          assignment =>
            ` -a [gpu:${assignment.gpuIndex}]/GPUFanControlState=1` +
            ` -a [fan:${assignment.fanIndex}]/GPUTargetFanSpeed=${assignment.speed}`
        )
        .join("");
      try {
        const executor = new CommandLineExecutor();
        executor.errorHandler(NvidiaErrorHandler);
        executor.execute(`nvidia-settings -c ${display} ${args}`);
      } catch (e) {
        console.error("Error applying fan speed".red, e);
      }
    }
  };
}

module.exports = NvidiaFan;
