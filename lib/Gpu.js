const Cache = require("./Cache");
const NvidiaGpu = require("./vendor/NvidiaGpu");
const GpuOverclock = require("./GpuOverclock");

function Gpu(display = ":0") {
  const cache = new Cache();
  const nvidiaGpu = new NvidiaGpu(display);

  return {
    list: async function () {
      let gpus = cache.getGpus();
      if (gpus) {
        return gpus;
      }

      gpus = await nvidiaGpu.list();
      cache.setGpus(gpus);
      return gpus;
    },

    details: async function (gpus, ignore) {
      await nvidiaGpu.details(gpus, ignore, display);
    },

    fans: function () {
      const nvidiaFans = nvidiaGpu.fans();
      return {
        setFanSpeed: function (gpuIndex, fanIndex, speed) {
          nvidiaFans.setFanSpeed(gpuIndex, fanIndex, speed);
        },

        apply: async function () {
          await nvidiaFans.apply(display);
        }
      };
    },

    overclock: function () {
      const gpuOverclock = new GpuOverclock(display);

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
  };
}

function filterGpus(gpus, selectedGpus = "all") {
  const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(gpuIndex => parseInt(gpuIndex));
  return gpus.filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1);
}

module.exports = { Gpu, filterGpus };
