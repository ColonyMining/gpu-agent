const NvidiaGpu = require("./vendor/NvidiaGpu");

function Gpu(display = ":0") {
  const nvidiaGpu = new NvidiaGpu(display);

  return {
    list: function () {
      return nvidiaGpu.list(display);
    },

    details: function (gpus, ignore) {
      nvidiaGpu.details(gpus, ignore, display);
    },

    fans: function () {
      const nvidiaFans = nvidiaGpu.fans();
      return {
        setFanSpeed: function (gpuIndex, fanIndex, speed) {
          nvidiaFans.setFanSpeed(gpuIndex, fanIndex, speed);
        },

        apply: function () {
          nvidiaFans.apply(display);
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

        apply: function (verbose) {
          nvidiaOverclock.apply(verbose);
        }
      };
    }
  };
}

function filterGpus(gpus, selectedGpus) {
  const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(gpuIndex => parseInt(gpuIndex));
  return gpus.filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1);
}

module.exports = { Gpu, filterGpus };
