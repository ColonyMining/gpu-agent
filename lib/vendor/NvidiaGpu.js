const colors = require("colors");
const NvidiaFan = require("./NvidiaFan");
const NvidiaOverclock = require("./NvidiaOverclock");
const CommandLineExecutor = require("../CommandLineExecutor");
const NvidiaErrorHandler = require("./NvidiaErrorHandler");

const GPU_FANS_REGEX = /\[((gpu|fan):(\d+))]\s?(\(([^)]+)\))?/g;
const GPU_FAN_SPEED_REGEX = /\[fan:(\d+)]\):\s(\d+)\./g;
const GPU_OVERCLOCK_REGEX = /Attribute '([^']+)'.+\[gpu:(\d+)]\):\s(-?\d+)/g;

function NvidiaGpu(display = ":0") {
  return {
    list: async function () {
      const executor = new CommandLineExecutor();
      executor.errorHandler(NvidiaErrorHandler);
      const response = await executor.execute(`nvidia-settings -c ${display} -q gpus --verbose`);

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

      gpus.forEach(gpu => gpu.fans.sort((fanA, fanB) => fanA.index - fanB.index));
      gpus.sort((gpuA, gpuB) => gpuA.index - gpuB.index);

      return gpus;
    },

    details: async function (gpus, ignore = [], display) {
      const data = [];

      if (ignore.indexOf("power") === -1) {
        data.push(readPowerTemperatureClock(gpus));
      }
      if (ignore.indexOf("fan") === -1) {
        data.push(readFanSpeed(gpus, display));
      }
      if (ignore.indexOf("overclock") === -1) {
        data.push(readOverclock(gpus, display));
      }

      await Promise.all(data);
    },

    fans: function () {
      return new NvidiaFan(display);
    },

    overclock: function () {
      return new NvidiaOverclock(display);
    }
  };
}

async function readPowerTemperatureClock(gpus) {
  const executor = new CommandLineExecutor();
  executor.errorHandler(NvidiaErrorHandler);
  const response = await executor.execute(
    "nvidia-smi --query-gpu=index,pci.bus,utilization.gpu,utilization.memory,temperature.gpu," +
      "power.draw,power.limit,power.default_limit,power.min_limit,power.max_limit,clocks.gr,clocks.sm,driver_version " +
      "--format=csv,noheader,nounits"
  );

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
      clock: { lgc: parseInt(data[10].trim()), lmc: parseInt(data[11].trim()) },
      driver: data[12].trim()
    }));

  gpuData.forEach(item => {
    const previousTemperature = gpus[item.index] ? gpus[item.index].temperature || item.temperature : item.temperature;
    gpus[item.index].pci = item.pci;
    gpus[item.index].power = item.power;
    gpus[item.index].utilization = item.utilization;
    gpus[item.index].overclock.lgc = item.clock.lgc;
    gpus[item.index].overclock.lmc = item.clock.lmc;
    gpus[item.index].temperature = item.temperature;
    gpus[item.index].deltaTemperature = item.temperature - previousTemperature;
    gpus[item.index].driver = item.driver;
  });
}

async function readFanSpeed(gpus, display = ":0") {
  const executor = new CommandLineExecutor();
  executor.errorHandler(NvidiaErrorHandler);
  const response = await executor.execute(`nvidia-settings -c ${display} -q /GPUCurrentFanSpeed`);

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

async function readOverclock(gpus, display = ":0") {
  const executor = new CommandLineExecutor();
  executor.errorHandler(NvidiaErrorHandler);
  const response = await executor.execute(
    `nvidia-settings -c ${display} -q /GPUGraphicsClockOffset -q /GPUMemoryTransferRateOffset`
  );

  const matches = [...response.matchAll(GPU_OVERCLOCK_REGEX)];

  matches.forEach(match => {
    if (match[1] === "GPUGraphicsClockOffset") {
      gpus[parseInt(match[2])].overclock.core = parseInt(match[3]);
    } else if (match[1] === "GPUMemoryTransferRateOffset") {
      gpus[parseInt(match[2])].overclock.memory = parseInt(match[3]);
    }
  });
}

module.exports = NvidiaGpu;
