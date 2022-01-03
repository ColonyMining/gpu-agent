const { listGpus, updateTemperature } = require("../lib/Gpu");

setInterval(() => {
  const gpus = listGpus();
  updateTemperature(gpus);

  console.dir(gpus, { depth: 5 });
}, 10_000);
