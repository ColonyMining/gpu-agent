const { setFanSpeed } = require("./Gpu");
const { log } = require("./Logger");

const SPEED_UP_FACTOR = 1.1;
const SPEED_DOWN_FACTOR = -1.05;

function analyzeTemperature(gpus, temperature) {
  const MAX_DELTA = temperature * 0.05;

  gpus.forEach(gpu => {
    const delta = gpu.temperature - temperature;

    if (Math.abs(delta) > MAX_DELTA) {
      const factor = delta > 0 ? SPEED_UP_FACTOR : SPEED_DOWN_FACTOR;

      gpu.fans.forEach(fan => {
        const speed = Math.ceil(fan.speed * factor);
        setFanSpeed(fan.index, speed);
        log([gpu.name, gpu.power, gpu.temperature, gpu.deltaTemperature, fan.index, speed].join(";"));
      });
    }
  });
}

module.exports = {
  analyzeTemperature
};
