const Cache = require("./Cache");
const NvidiaGpu = require("./vendor/NvidiaGpu");
const GpuOverclock = require("./GpuOverclock");

class Gpu {
  constructor(display = ":0") {
    this.display = display;
    this.cache = new Cache();
    this.nvidiaGpu = new NvidiaGpu(display);
  }

  async list() {
    let gpus = this.cache.getGpus();
    if (gpus) {
      return gpus;
    }

    gpus = await this.nvidiaGpu.list();
    this.cache.setGpus(gpus);
    return gpus;
  }

  async details(gpus, ignore) {
    await this.nvidiaGpu.details(gpus, ignore, this.display);
  }

  fans() {
    const nvidiaFans = this.nvidiaGpu.fans();
    return {
      setFanSpeed: function (gpuIndex, fanIndex, speed) {
        nvidiaFans.setFanSpeed(gpuIndex, fanIndex, speed);
      },

      apply: async function () {
        await nvidiaFans.apply(this.display);
      }
    };
  }

  overclock() {
    const gpuOverclock = new GpuOverclock(this.display);

    return {
      reset: function (gpu) {
        gpuOverclock.reset(gpu);
      },

      fan: function (gpuIndex, fanIndex, speed) {
        gpuOverclock.fan(gpuIndex, fanIndex, speed);
      },

      power: function (gpuIndex, value) {
        gpuOverclock.power(gpuIndex, value);
      },

      lockGraphicsClock: function (gpuIndex, value) {
        gpuOverclock.lockGraphicsClock(gpuIndex, value);
      },

      resetLockGraphicsClock: function (gpuIndex) {
        gpuOverclock.resetLockGraphicsClock(gpuIndex);
      },

      lockMemoryClock: function (gpuIndex, value) {
        gpuOverclock.lockMemoryClock(gpuIndex, value);
      },

      resetLockMemoryClock: function (gpuIndex) {
        gpuOverclock.resetLockMemoryClock(gpuIndex);
      },

      core: function (gpuIndex, value) {
        gpuOverclock.core(gpuIndex, value);
      },

      memory: function (gpuIndex, value) {
        gpuOverclock.memory(gpuIndex, value);
      },

      apply: async function (verbose) {
        await gpuOverclock.apply(verbose);
      }
    };
  }
}

function filterGpus(gpus, selectedGpus = "all") {
  const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(gpuIndex => parseInt(gpuIndex));
  return gpus.filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1);
}

module.exports = { Gpu, filterGpus };
