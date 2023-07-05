class NvidiaOverclock {
  constructor(display = ":0") {
    this.display = display;
  }

  fan(gpuIndex, fanIndex, speed) {
    return (
      `nvidia-settings -c ${this.display}` +
      ` -a [gpu:${gpuIndex}]/GPUFanControlState=1` +
      ` -a [fan:${fanIndex}]/GPUTargetFanSpeed=${speed}`
    );
  }

  power(gpuIndex, value) {
    return `nvidia-smi -i ${gpuIndex} -pl ${value}`;
  }

  lockGraphicsClock(gpuIndex, value) {
    return `nvidia-smi -i ${gpuIndex} -lgc ${value}`;
  }

  resetLockGraphicsClock(gpuIndex) {
    return `nvidia-smi -i ${gpuIndex} -rgc`;
  }

  lockMemoryClock(gpuIndex, value) {
    return `nvidia-smi -i ${gpuIndex} -lmc ${value}`;
  }

  resetLockMemoryClock(gpuIndex) {
    return `nvidia-smi -i ${gpuIndex} -rmc`;
  }

  core(gpuIndex, value) {
    return `nvidia-settings -c ${this.display} -a [gpu:${gpuIndex}]/GPUGraphicsClockOffsetAllPerformanceLevels=${value}`;
  }

  memory(gpuIndex, value) {
    return `nvidia-settings -c ${this.display} -a [gpu:${gpuIndex}]/GPUMemoryTransferRateOffsetAllPerformanceLevels=${value}`;
  }
}

module.exports = NvidiaOverclock;
