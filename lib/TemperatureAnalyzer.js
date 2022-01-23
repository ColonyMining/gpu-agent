const moment = require("moment");
const { Gpu } = require("./GpuFacade");
const { log } = require("./Logger");

function TemperatureAnalyzer() {
  return {
    analyze: function (gpus, temperature) {
      const MAX_DELTA = temperature * 0.025;
      const timestamp = moment().utc().format();

      const gpuFan = new Gpu.fans();

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
              gpuFan.setFanSpeed(gpu.index, fan.index, speed);
              changelog(timestamp, gpu, fan, speed);
            }
          });
        }
      });

      gpuFan.apply();
    }
  };
}

function changelog(timestamp, gpu, fan, speed) {
  log(
    [timestamp, gpu.name, gpu.index, gpu.power.usage, gpu.temperature, gpu.deltaTemperature, fan.index, speed].join(";")
  );
}

module.exports = TemperatureAnalyzer;
