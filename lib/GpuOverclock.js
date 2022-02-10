const colors = require("colors");
const CommandLineExecutor = require("../CommandLineExecutor");
const NvidiaErrorHandler = require("./NvidiaErrorHandler");
const NvidiaOverclock = require("./vendor/NvidiaOverclock");

function GpuOverclock(display = ":0") {
  const nvidiaOverclock = new NvidiaOverclock(display);
  const commands = [];

  return {
    reset: function (gpu) {
      this.resetLockGraphicsClock(gpu.index);
      this.resetLockMemoryClock(gpu.index);
      this.core(gpu.index, 0);
      this.memory(gpu.index, 0);
      if (gpu.fans) {
        gpu.fans.forEach(fan => {
          this.fan(gpu.index, fan.index, 50);
        });
      }
      if (gpu.power && gpu.power.default) {
        this.power(gpu.index, gpu.power.default);
      }
    },

    fan: function (gpuIndex, fanIndex, speed) {
      commands.push({
        bucket: `${gpuIndex}-FAN`,
        message: `GPU ${gpuIndex}`.cyan + ` set fan speed ` + `${speed}`.green,
        execute: nvidiaOverclock.fan(gpuIndex, fanIndex, speed),
        errorMessage: `Cannot set fan speed ${speed}% to GPU ${gpuIndex}, fan: ${fanIndex}`
      });
    },

    power: function (gpuIndex, value) {
      commands.push({
        bucket: `${gpuIndex}-POWER`,
        message: `GPU ${gpuIndex}`.cyan + ` Set power limit ` + `${value}`.green,
        execute: nvidiaOverclock.power(gpuIndex, value),
        errorMessage: `Cannot set power to GPU ${gpuIndex}`
      });
    },

    lockGraphicsClock: function (gpuIndex, value) {
      commands.push({
        bucket: `${gpuIndex}-LGC`,
        message: `GPU ${gpuIndex}`.cyan + ` set lock graphics clock ` + `${value}`.green,
        execute: nvidiaOverclock.lockGraphicsClock(gpuIndex, value),
        errorMessage: `Cannot set lock graphics clock to GPU ${gpuIndex}`
      });
    },

    resetLockGraphicsClock: function (gpuIndex) {
      commands.push({
        bucket: `${gpuIndex}-LGC`,
        message: `GPU ${gpuIndex}`.cyan + ` reset lock graphics clock`,
        execute: nvidiaOverclock.resetLockGraphicsClock(gpuIndex),
        errorMessage: `Cannot reset lock graphics clock to GPU ${gpuIndex}`
      });
    },

    lockMemoryClock: function (gpuIndex, value) {
      commands.push({
        bucket: `${gpuIndex}-LMC`,
        message: `GPU ${gpuIndex}`.cyan + ` set lock memory clock ` + `${value}`.green,
        execute: nvidiaOverclock.lockMemoryClock(gpuIndex, value),
        errorMessage: `Cannot set lock memory clock to GPU ${gpuIndex}`
      });
    },

    resetLockMemoryClock: function (gpuIndex) {
      commands.push({
        bucket: `${gpuIndex}-LMC`,
        message: `GPU ${gpuIndex}`.cyan + ` reset lock memory clock`,
        execute: nvidiaOverclock.resetLockMemoryClock(gpuIndex),
        errorMessage: `Cannot reset lock memory clock to GPU ${gpuIndex}`
      });
    },

    core: function (gpuIndex, value) {
      commands.push({
        bucket: `${gpuIndex}-CORE`,
        message: `GPU ${gpuIndex}`.cyan + ` set graphics clock offset ` + `${value}`.green,
        execute: nvidiaOverclock.core(gpuIndex, value),
        errorMessage: `Cannot set graphics core clock offset to GPU ${gpuIndex}`
      });
    },

    memory: function (gpuIndex, value) {
      commands.push({
        bucket: `${gpuIndex}-MEMORY`,
        message: `GPU ${gpuIndex}`.cyan + ` set memory transfer rate offset ` + `${value}`.green,
        execute: nvidiaOverclock.memory(gpuIndex, value),
        errorMessage: `Cannot set memory transfer rate offset to GPU ${gpuIndex}`
      });
    },

    apply: async function (verbose = false) {
      const organizedCommands = organize(commands);

      await Promise.all(
        organizedCommands.map(command => {
          const executor = new CommandLineExecutor();
          executor.errorHandler(NvidiaErrorHandler);
          return executor
            .execute(command.execute)
            .then(() => {
              if (verbose) {
                console.log(command.message);
              }
            })
            .catch(e => console.error(command.errorMessage.red, e));
        })
      ).then(() => commands.splice(0, commands.length));
    }
  };
}

function organize(commands) {
  const object = {};
  commands.forEach(command => (object[command.bucket] = command));
  return Object.keys(object).map(key => object[key]);
}

module.exports = GpuOverclock;
