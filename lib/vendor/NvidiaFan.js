const childProcess = require("child_process");
const colors = require("colors");

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
        const result = childProcess.execSync(`nvidia-settings -c ${display} ${args}`, {
          stdio: ["pipe", "pipe", "ignore"]
        });
        const output = result.toString("utf-8");
        if (output.indexOf("ERROR") > -1) {
          console.error("Error applying fan speed".red, output);
        }
      } catch (e) {
        console.error("Error applying fan speed".red, e);
      }
    }
  };
}

module.exports = NvidiaFan;
