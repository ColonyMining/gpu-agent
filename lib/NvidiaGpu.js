const childProcess = require("child_process");
const colors = require("colors");

const GPU_FANS_REGEX = /\[((gpu|fan):(\d+))]\s?(\(([^)]+)\))?/g;
const GPU_FAN_SPEED_REGEX = /\[fan:(\d+)]\):\s(\d+)\./g;
const GPU_OVERCLOCK_REGEX = /Attribute '([^']+)'.+\[gpu:(\d+)]\):\s(-?\d+)/g;

function listGpus(display = ":0") {
  const output = childProcess.execSync(`nvidia-settings -c ${display} -q gpus --verbose`, {
    stdio: ["pipe", "pipe", "ignore"]
  });
  const response = output.toString().trim();

  const matches = [...response.matchAll(GPU_FANS_REGEX)];

  const gpus = [];
  let currentGpu;

  matches.forEach(match => {
    const type = match[2];
    if (type === "gpu") {
      currentGpu = {
        index: parseInt(match[3]),
        name: match[5],
        fans: [],
        overclock: {}
      };
      gpus.push(currentGpu);
    } else if (type === "fan") {
      currentGpu.fans.push({
        index: parseInt(match[3]),
        name: match[5]
      });
    }
  });

  return gpus;
}

function readPowerTemperatureClock(gpus) {
  const output = childProcess.execSync(
    "nvidia-smi --query-gpu=index,pci.bus,utilization.gpu,utilization.memory,temperature.gpu," +
      "power.draw,power.limit,power.default_limit,power.min_limit,power.max_limit,clocks.gr,clocks.sm,driver_version " +
      "--format=csv,noheader,nounits",
    { stdio: ["pipe", "pipe", "ignore"] }
  );
  const response = output.toString().trim();

  const gpuData = response
    .split("\n")
    .map(line => line.split(","))
    .map(data => ({
      index: parseInt(data[0].trim()),
      pci: parseInt(data[1].trim()),
      utilization: { gpu: parseInt(data[2].trim()), memory: parseInt(data[3].trim()) },
      temperature: parseInt(data[4].trim()),
      power: {
        usage: parseInt(data[5].trim()),
        limit: parseInt(data[6].trim()),
        default: parseInt(data[7].trim()),
        min: parseInt(data[8].trim()),
        max: parseInt(data[9].trim())
      },
      clock: { graphics: parseInt(data[10].trim()), sm: parseInt(data[11].trim()) },
      driver: data[12].trim()
    }));

  gpuData.forEach(item => {
    const previousTemperature = gpus[item.index].temperature || item.temperature;
    gpus[item.index].pci = item.pci;
    gpus[item.index].power = item.power;
    gpus[item.index].utilization = item.utilization;
    gpus[item.index].overclock.graphics = item.clock.graphics;
    gpus[item.index].overclock.sm = item.clock.sm;
    gpus[item.index].temperature = item.temperature;
    gpus[item.index].deltaTemperature = item.temperature - previousTemperature;
    gpus[item.index].driver = item.driver;
  });
}

function readFanSpeed(gpus, display = ":0") {
  const output = childProcess.execSync(`nvidia-settings -c ${display} -q /GPUCurrentFanSpeed`, {
    stdio: ["pipe", "pipe", "ignore"]
  });
  const response = output.toString().trim();

  const matches = [...response.matchAll(GPU_FAN_SPEED_REGEX)];
  const gpuFanSpeed = {};

  matches.forEach(match => {
    gpuFanSpeed[`fan${match[1]}`] = parseInt(match[2]);
  });

  gpus
    .flatMap(gpu => gpu.fans)
    .forEach(fan => {
      fan.speed = gpuFanSpeed[`fan${fan.index}`];
    });
}

function readOverclock(gpus, display = ":0") {
  const output = childProcess.execSync(
    `nvidia-settings -c ${display} -q /GPUGraphicsClockOffset -q /GPUMemoryTransferRateOffset`,
    { stdio: ["pipe", "pipe", "ignore"] }
  );
  const response = output.toString().trim();

  const matches = [...response.matchAll(GPU_OVERCLOCK_REGEX)];

  matches.forEach(match => {
    if (match[1] === "GPUGraphicsClockOffset") {
      gpus[parseInt(match[2])].overclock.core = parseInt(match[3]);
    } else if (match[1] === "GPUMemoryTransferRateOffset") {
      gpus[parseInt(match[2])].overclock.memory = parseInt(match[3]);
    }
  });
}

function GpuFan() {
  const assignments = [];

  return {
    setFanSpeed: function (gpuIndex, fanIndex, speed) {
      assignments.push({ gpuIndex, fanIndex, speed });
    },

    apply: function (display = ":0") {
      if (assignments.length === 0) {
        return;
      }

      const args = assignments
        .map(
          assignment =>
            ` -a [gpu:${assignment.gpuIndex}]/GPUFanControlState=1` +
            ` -a [fan:${assignment.fanIndex}]/GPUTargetFanSpeed=${assignment.speed}`
        )
        .join("");
      try {
        const result = childProcess.execSync(`nvidia-settings -c ${display} ${args}`, {
          stdio: ["pipe", "pipe", "ignore"]
        });
        const output = result.toString("utf-8");
        if (output.indexOf("ERROR") > -1) {
          console.error("Error applying fan speed".red, output);
        }
      } catch (e) {
        console.error("Error applying fan speed".red, e);
      }
    }
  };
}

const GpuOverclock = function (display = ":0") {
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

    apply: function () {
      commands.forEach(command => {
        try {
          const result = childProcess.execSync(command.execute, { stdio: ["pipe", "pipe", "ignore"] });
          const output = result.toString("utf-8");
          if (output.indexOf("ERROR") > -1) {
            console.error(command.errorMessage.red, output);
          } else {
            console.log(command.message);
          }
        } catch (e) {
          console.error(command.errorMessage.red, e);
        }
      });

      commands.splice(0, commands.length);
    }
  };
};

function gpuDetails(gpus, ignore = []) {
  if (ignore.indexOf("power") === -1) {
    readPowerTemperatureClock(gpus);
  }
  if (ignore.indexOf("fan") === -1) {
    readFanSpeed(gpus);
  }
  if (ignore.indexOf("overclock") === -1) {
    readOverclock(gpus);
  }
}

const NvidiaGpu = {
  list: listGpus,
  details: gpuDetails,
  fans: GpuFan,
  overclock: GpuOverclock
};

module.exports = NvidiaGpu;
