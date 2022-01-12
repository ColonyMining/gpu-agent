const childProcess = require("child_process");

const GPU_FANS_REGEX = /\[((gpu|fan):(\d+))]\s?(\(([^)]+)\))?/g;
const GPU_FAN_SPEED_REGEX = /\[fan:(\d+)]\):\s(\d+)\./g;
const GPU_OVERCLOCK_REGEX = /Attribute '([^']+)'.+\[gpu:(\d+)]\):\s(-?\d+)/g;

function listGpus(display = ":0") {
  const output = childProcess.execSync(`nvidia-settings -c ${display} -q gpus --verbose`);
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
    `nvidia-smi --query-gpu=index,pci.bus,temperature.gpu,power.draw,power.limit,clocks.gr,clocks.sm --format=csv,noheader,nounits`
  );
  const response = output.toString().trim();

  const temperature = response
    .split("\n")
    .map(line => line.split(","))
    .map(data => ({
      index: parseInt(data[0].trim()),
      pci: parseInt(data[1].trim()),
      temperature: parseInt(data[2].trim()),
      power: { usage: parseInt(data[3].trim()), limit: parseInt(data[4].trim()) },
      clock: { graphics: parseInt(data[5].trim()), sm: parseInt(data[6].trim()) }
    }));

  temperature.forEach(item => {
    const previousTemperature = gpus[item.index].temperature || item.temperature;
    gpus[item.index].pci = item.pci;
    gpus[item.index].power = item.power;
    gpus[item.index].overclock.graphics = item.clock.graphics;
    gpus[item.index].overclock.sm = item.clock.sm;
    gpus[item.index].temperature = item.temperature;
    gpus[item.index].deltaTemperature = item.temperature - previousTemperature;
  });
}

function readFanSpeed(gpus, display = ":0") {
  const output = childProcess.execSync(`nvidia-settings -c ${display} -q /GPUCurrentFanSpeed`);
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
    `nvidia-settings -c ${display} -q /GPUGraphicsClockOffset -q /GPUMemoryTransferRateOffset`
  );
  const response = output.toString().trim();

  const matches = [...response.matchAll(GPU_OVERCLOCK_REGEX)];

  matches.forEach(match => {
    if (match[1] === "GPUGraphicsClockOffset") {
      gpus[parseInt(match[2])].overclock.clock = parseInt(match[3]);
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
      const args = assignments.map(
        assignment =>
          ` -a [gpu:${assignment.gpuIndex}]/GPUFanControlState=1` +
          ` -a [fan:${assignment.fanIndex}]/GPUTargetFanSpeed=${assignment.speed}`
      );
      childProcess.execSync(`nvidia-settings -c ${display} ${args}`);
    }
  };
}

module.exports = {
  listGpus,
  readPowerTemperatureClock,
  readFanSpeed,
  readOverclock,
  GpuFan
};
