const CommandLineExecutor = require("../../../CommandLineExecutor");
const NvidiaErrorHandler = require("../../../vendor/NvidiaErrorHandler");

class NvidiaGpu {
  constructor({display = ":0"}) {
    this.display = display;
  }

  async details(gpus, ignore = []) {
    const data = [];

    if (!ignore.includes("power")) {
      data.push(readPowerTemperatureClock(gpus));
    }
    if (!ignore.includes("fan")) {
      data.push(readFanSpeed(gpus, this.display));
    }
    if (!ignore.includes("overclock")) {
      data.push(readOverclock(gpus, this.display));
    }

    await Promise.all(data);
  }
}

async function readPowerTemperatureClock(gpus) {
  const executor = new CommandLineExecutor();
  executor.errorHandler(new NvidiaErrorHandler());
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
  executor.errorHandler(new NvidiaErrorHandler());
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
  executor.errorHandler(new NvidiaErrorHandler());
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