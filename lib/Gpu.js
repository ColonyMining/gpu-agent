const childProcess = require("child_process");

const GPU_FANS_REGEX = /\[((gpu|fan):(\d+))]\s?(\(([^)]+)\))?/g;

function listGpus(display = ":0") {
  const output = childProcess.execSync(`nvidia-settings -c ${display} -q gpus --verbose`);

  const matches = [...output.matchAll(GPU_FANS_REGEX)];

  const gpus = [];
  let currentGpu;

  matches.forEach(match => {
    const type = match[2];
    if (type === "gpu") {
      currentGpu = {
        index: parseInt(match[3]),
        name: match[5],
        fans: []
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

function updateTemperature(gpus) {
  const output = childProcess.execSync(`nvidia-smi --query-gpu=index,temperature.gpu --format=csv,noheader,nounits`);

  const temperature = output
    .split("\n")
    .map(line => line.split(","))
    .map(data => ({ index: parseInt(data[0].trim()), temperature: parseInt(data[1].trim()) }));

  temperature.forEach(item => {
    gpus[item.index].temperature = item.temperature;
  });
}

module.exports = {
  listGpus,
  updateTemperature
};
