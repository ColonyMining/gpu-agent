const moment = require("moment");
const { setFanSpeed } = require("./Gpu");
const { log } = require("./Logger");

function analyzeTemperature(gpus, temperature) {
  const MAX_DELTA = temperature * 0.025;
  const timestamp = moment().utc().format();

  gpus.forEach(gpu => {
    const delta = gpu.temperature - temperature;

    if (Math.abs(delta) > MAX_DELTA) {
      gpu.fans.forEach(fan => {
        let speed = Math.ceil((gpu.temperature * fan.speed) / temperature);
        if (speed > 100) {
          speed = 100;
        } else if (speed < 30) {
          speed = 30;
        }

        if (speed !== fan.speed) {
          setFanSpeed(gpu.index, fan.index, speed);
          log(
            [timestamp, gpu.name, gpu.index, gpu.power, gpu.temperature, gpu.deltaTemperature, fan.index, speed].join(
              ";"
            )
          );
        }
      });
    }
  });
}

module.exports = {
  analyzeTemperature
};
