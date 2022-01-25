const NvidiaGpu = require("./NvidiaGpu");

function listGpus(display) {
  return NvidiaGpu.list(display);
}

function gpuDetails(gpus, ignore) {
  NvidiaGpu.details(gpus, ignore);
}

function GpuFan() {
  const nvidiaFans = new NvidiaGpu.fans();
  return {
    setFanSpeed: function (gpuIndex, fanIndex, speed) {
      nvidiaFans.setFanSpeed(gpuIndex, fanIndex, speed);
    },

    apply: function (display) {
      nvidiaFans.apply(display);
    }
  };
}

function GpuOverclock(display) {
  const nvidiaOverclock = NvidiaGpu.overclock(display);

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

const Gpu = {
  list: listGpus,
  details: gpuDetails,
  fans: GpuFan,
  overclock: GpuOverclock
};

module.exports = { Gpu };
