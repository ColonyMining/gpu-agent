const colors = require("colors");
const CommandLineExecutor = require("./CommandLineExecutor");
const NvidiaErrorHandler = require("./vendor/NvidiaErrorHandler");
const NvidiaOverclock = require("./vendor/NvidiaOverclock");

class GpuOverclock {
  constructor(display = ":0") {
    this.nvidiaOverclock = new NvidiaOverclock(display);
    this.commands = [];
  }

  reset(gpu) {
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
  }

  fan(gpuIndex, fanIndex, speed) {
    this.commands.push({
      bucket: `${gpuIndex}-FAN`,
      message: `GPU ${gpuIndex}`.cyan + ` set fan speed ` + `${speed}`.green,
      execute: this.nvidiaOverclock.fan(gpuIndex, fanIndex, speed),
      errorMessage: `Cannot set fan speed ${speed}% to GPU ${gpuIndex}, fan: ${fanIndex}`
    });
  }

  power(gpuIndex, value) {
    this.commands.push({
      bucket: `${gpuIndex}-POWER`,
      message: `GPU ${gpuIndex}`.cyan + ` Set power limit ` + `${value}`.green,
      execute: this.nvidiaOverclock.power(gpuIndex, value),
      errorMessage: `Cannot set power to GPU ${gpuIndex}`
    });
  }

  lockGraphicsClock(gpuIndex, value) {
    this.commands.push({
      bucket: `${gpuIndex}-LGC`,
      message: `GPU ${gpuIndex}`.cyan + ` set lock graphics clock ` + `${value}`.green,
      execute: this.nvidiaOverclock.lockGraphicsClock(gpuIndex, value),
      errorMessage: `Cannot set lock graphics clock to GPU ${gpuIndex}`
    });
  }

  resetLockGraphicsClock(gpuIndex) {
    this.commands.push({
      bucket: `${gpuIndex}-LGC`,
      message: `GPU ${gpuIndex}`.cyan + ` reset lock graphics clock`,
      execute: this.nvidiaOverclock.resetLockGraphicsClock(gpuIndex),
      errorMessage: `Cannot reset lock graphics clock to GPU ${gpuIndex}`
    });
  }

  lockMemoryClock(gpuIndex, value) {
    this.commands.push({
      bucket: `${gpuIndex}-LMC`,
      message: `GPU ${gpuIndex}`.cyan + ` set lock memory clock ` + `${value}`.green,
      execute: this.nvidiaOverclock.lockMemoryClock(gpuIndex, value),
      errorMessage: `Cannot set lock memory clock to GPU ${gpuIndex}`
    });
  }

  resetLockMemoryClock(gpuIndex) {
    this.commands.push({
      bucket: `${gpuIndex}-LMC`,
      message: `GPU ${gpuIndex}`.cyan + ` reset lock memory clock`,
      execute: this.nvidiaOverclock.resetLockMemoryClock(gpuIndex),
      errorMessage: `Cannot reset lock memory clock to GPU ${gpuIndex}`
    });
  }

  core(gpuIndex, value) {
    this.commands.push({
      bucket: `${gpuIndex}-CORE`,
      message: `GPU ${gpuIndex}`.cyan + ` set graphics clock offset ` + `${value}`.green,
      execute: this.nvidiaOverclock.core(gpuIndex, value),
      errorMessage: `Cannot set graphics core clock offset to GPU ${gpuIndex}`
    });
  }

  memory(gpuIndex, value) {
    this.commands.push({
      bucket: `${gpuIndex}-MEMORY`,
      message: `GPU ${gpuIndex}`.cyan + ` set memory transfer rate offset ` + `${value}`.green,
      execute: this.nvidiaOverclock.memory(gpuIndex, value),
      errorMessage: `Cannot set memory transfer rate offset to GPU ${gpuIndex}`
    });
  }

  async apply(verbose = false) {
    const organizedCommands = organize(this.commands);

    await Promise.all(
      organizedCommands.map(command => {
        const executor = new CommandLineExecutor();
        executor.errorHandler(new NvidiaErrorHandler());
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
}

function organize(commands) {
  const object = {};
  commands.forEach(command => (object[command.bucket] = command));
  return Object.keys(object).map(key => object[key]);
}

module.exports = GpuOverclock;
