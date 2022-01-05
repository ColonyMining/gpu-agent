const { listGpus, readPowerTemperature, readFanSpeed, readOverclock } = require("../lib/Gpu");

const gpus = listGpus();

readPowerTemperature(gpus);
readFanSpeed(gpus);
readOverclock(gpus);

console.dir(gpus, { depth: 5 });
