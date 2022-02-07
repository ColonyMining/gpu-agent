const Cache = require("./Cache");
const NvidiaGpu = require("./vendor/NvidiaGpu");

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
      const nvidiaOverclock = nvidiaGpu.overclock(display);

      return {
        reset: function (gpu) {
          nvidiaOverclock.reset(gpu);
        },

        fan: function (gpuIndex, fanIndex, speed) {
          nvidiaOverclock.fan(gpuIndex, fanIndex, speed);
        },

        power: function (gpuIndex, value) {
          nvidiaOverclock.power(gpuIndex, value);
        },

        lockGraphicsClock: function (gpuIndex, value) {
          nvidiaOverclock.lockGraphicsClock(gpuIndex, value);
        },

        resetLockGraphicsClock: function (gpuIndex) {
          nvidiaOverclock.resetLockGraphicsClock(gpuIndex);
        },

        lockMemoryClock: function (gpuIndex, value) {
          nvidiaOverclock.lockMemoryClock(gpuIndex, value);
        },

        resetLockMemoryClock: function (gpuIndex) {
          nvidiaOverclock.resetLockMemoryClock(gpuIndex);
        },

        core: function (gpuIndex, value) {
          nvidiaOverclock.core(gpuIndex, value);
        },

        memory: function (gpuIndex, value) {
          nvidiaOverclock.memory(gpuIndex, value);
        },

        apply: async function (verbose) {
          await nvidiaOverclock.apply(verbose);
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
