import childProcess from "child_process";

function NvidiaOverclock(display = ":0") {
  const commands = [];

  return {
    reset: function (gpu) {
      this.resetLockGraphicsClock(gpu.index);
      this.resetLockMemoryClock(gpu.index);
      this.core(gpu.index, 0);
      this.memory(gpu.index, 0);
      if (gpu.fans) {
        gpu.fans.forEach(fan => {
          this.fan(gpu.index, fan.index, 30);
        });
      }
      if (gpu.power && gpu.power.default) {
        this.power(gpu.index, gpu.power.default);
      }
    },

    fan: function (gpuIndex, fanIndex, speed) {
      commands.push({
        message: `GPU ${gpuIndex}`.cyan + ` set fan speed ` + `${speed}`.green,
        execute:
          `nvidia-settings -c ${display}` +
          ` -a [gpu:${gpuIndex}]/GPUFanControlState=1` +
          ` -a [fan:${fanIndex}]/GPUTargetFanSpeed=${speed}`,
        errorMessage: `Cannot set fan speed ${speed}% to GPU ${gpuIndex}, fan: ${fanIndex}`
      });
    },

    power: function (gpuIndex, value) {
      commands.push({
        message: `GPU ${gpuIndex}`.cyan + ` Set power limit ` + `${value}`.green,
        execute: `nvidia-smi -i ${gpuIndex} -pl ${value}`,
        errorMessage: `Cannot set power to GPU ${gpuIndex}`
      });
    },

    lockGraphicsClock: function (gpuIndex, value) {
      commands.push({
        message: `GPU ${gpuIndex}`.cyan + ` set lock graphics clock ` + `${value}`.green,
        execute: `nvidia-smi -i ${gpuIndex} -lgc ${value}`,
        errorMessage: `Cannot set lock graphics clock to GPU ${gpuIndex}`
      });
    },

    resetLockGraphicsClock: function (gpuIndex) {
      commands.push({
        message: `GPU ${gpuIndex}`.cyan + ` reset lock graphics clock`,
        execute: `nvidia-smi -i ${gpuIndex} -rgc`,
        errorMessage: `Cannot reset lock graphics clock to GPU ${gpuIndex}`
      });
    },

    lockMemoryClock: function (gpuIndex, value) {
      commands.push({
        message: `GPU ${gpuIndex}`.cyan + ` set lock memory clock ` + `${value}`.green,
        execute: `nvidia-smi -i ${gpuIndex} -lmc ${value}`,
        errorMessage: `Cannot set lock memory clock to GPU ${gpuIndex}`
      });
    },

    resetLockMemoryClock: function (gpuIndex) {
      commands.push({
        message: `GPU ${gpuIndex}`.cyan + ` reset lock memory clock`,
        execute: `nvidia-smi -i ${gpuIndex} -rmc`,
        errorMessage: `Cannot reset lock memory clock to GPU ${gpuIndex}`
      });
    },

    core: function (gpuIndex, value) {
      commands.push({
        message: `GPU ${gpuIndex}`.cyan + ` set graphics clock offset ` + `${value}`.green,
        execute: `nvidia-settings -c ${display} -a [gpu:${gpuIndex}]/GPUGraphicsClockOffsetAllPerformanceLevels=${value}`,
        errorMessage: `Cannot set graphics core clock offset to GPU ${gpuIndex}`
      });
    },

    memory: function (gpuIndex, value) {
      commands.push({
        message: `GPU ${gpuIndex}`.cyan + ` set memory transfer rate offset ` + `${value}`.green,
        execute: `nvidia-settings -c ${display} -a [gpu:${gpuIndex}]/GPUMemoryTransferRateOffsetAllPerformanceLevels=${value}`,
        errorMessage: `Cannot set memory transfer rate offset to GPU ${gpuIndex}`
      });
    },

    apply: function (verbose = false) {
      commands.forEach(command => {
        try {
          const result = childProcess.execSync(command.execute, { stdio: ["pipe", "pipe", "ignore"] });
          const output = result.toString("utf-8");
          if (output.indexOf("ERROR") > -1) {
            console.error(command.errorMessage.red, output);
          } else if (verbose) {
            console.log(command.message);
          }
        } catch (e) {
          console.error(command.errorMessage.red, e);
        }
      });

      commands.splice(0, commands.length);
    }
  };
}

module.exports = NvidiaOverclock;
