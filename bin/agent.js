const { listGpus, updateTemperature, updateFanSpeed } = require("../lib/Gpu");

const gpus = listGpus();

setInterval(() => {
  updateTemperature(gpus);
  updateFanSpeed(gpus);

  console.dir(gpus, { depth: 5 });
}, 10_000);
