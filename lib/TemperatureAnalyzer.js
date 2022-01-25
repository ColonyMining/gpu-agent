const moment = require("moment");
const { Gpu } = require("./Gpu");
const { log } = require("./Logger");
const { displayGpuChangelog } = require("./DisplayTable");

function TemperatureAnalyzer() {
  return {
    analyze: function (gpus, temperature) {
      const MAX_DELTA = temperature * 0.025;
      const timestamp = moment().utc();

      const gpuFan = new Gpu.fans();

      const gpuChangelog = [];

      gpus.forEach(gpu => {
        const delta = gpu.temperature - temperature;

        if (Math.abs(delta) > MAX_DELTA) {
          const changedFans = [];

          gpu.fans.forEach(fan => {
            let speed = Math.ceil((gpu.temperature * fan.speed) / temperature);
            if (speed > 100) {
              speed = 100;
            } else if (speed < 30) {
              speed = 30;
            }

            if (speed !== fan.speed) {
              gpuFan.setFanSpeed(gpu.index, fan.index, speed);
              changedFans.push({
                index: fan.index,
                currentSpeed: fan.speed,
                speed: speed
              });
              changelog(timestamp.format(), gpu, fan, speed);
            }
          });

          gpuChangelog.push({
            timestamp: timestamp.format("YYYY-MM-DD HH:mm:ss"),
            index: gpu.index,
            name: gpu.name,
            temperature: gpu.temperature,
            fans: changedFans
          });
        }
      });

      gpuFan.apply();

      displayGpuChangelog(gpuChangelog);
    }
  };
}

function changelog(timestamp, gpu, fan, speed) {
  log(
    [timestamp, gpu.name, gpu.index, gpu.power.usage, gpu.temperature, gpu.deltaTemperature, fan.index, speed].join(";")
  );
}

module.exports = TemperatureAnalyzer;
