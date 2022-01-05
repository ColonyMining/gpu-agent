const { listGpus, readPowerTemperature, readFanSpeed, readOverclock } = require("../lib/Gpu");
const { gpuToConfig } = require("../lib/Config");

const gpus = listGpus();

readPowerTemperature(gpus);
readFanSpeed(gpus);
readOverclock(gpus);

console.log("###################################");
console.log("#########      GPUS      ##########");
console.log("###################################");

console.dir(gpus, { depth: 5 });

console.log("###################################");
console.log("#########      CONFIG      ########");
console.log("###################################");

console.dir(gpus.map(gpuToConfig), { depth: 5 });
