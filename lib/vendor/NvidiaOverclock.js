function NvidiaOverclock(display = ":0") {
  return {
    fan: function (gpuIndex, fanIndex, speed) {
      return (
        `nvidia-settings -c ${display}` +
        ` -a [gpu:${gpuIndex}]/GPUFanControlState=1` +
        ` -a [fan:${fanIndex}]/GPUTargetFanSpeed=${speed}`
      );
    },

    power: function (gpuIndex, value) {
      return `nvidia-smi -i ${gpuIndex} -pl ${value}`;
    },

    lockGraphicsClock: function (gpuIndex, value) {
      return `nvidia-smi -i ${gpuIndex} -lgc ${value}`;
    },

    resetLockGraphicsClock: function (gpuIndex) {
      return `nvidia-smi -i ${gpuIndex} -rgc`;
    },

    lockMemoryClock: function (gpuIndex, value) {
      return `nvidia-smi -i ${gpuIndex} -lmc ${value}`;
    },

    resetLockMemoryClock: function (gpuIndex) {
      return `nvidia-smi -i ${gpuIndex} -rmc`;
    },

    core: function (gpuIndex, value) {
      return `nvidia-settings -c ${display} -a [gpu:${gpuIndex}]/GPUGraphicsClockOffsetAllPerformanceLevels=${value}`;
    },

    memory: function (gpuIndex, value) {
      return `nvidia-settings -c ${display} -a [gpu:${gpuIndex}]/GPUMemoryTransferRateOffsetAllPerformanceLevels=${value}`;
    }
  };
}

module.exports = NvidiaOverclock;
