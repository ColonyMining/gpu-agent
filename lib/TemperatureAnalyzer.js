const moment = require("moment");
const { Gpu } = require("./Gpu");
const { log } = require("./Logger");
const { displayGpuChangelog, copyright } = require("./DisplayTable");

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

          if (changedFans.length > 0) {
            gpuChangelog.push({
              timestamp: timestamp.format("YYYY-MM-DD HH:mm:ss"),
              index: gpu.index,
              name: gpu.name,
              temperature: gpu.temperature,
              power: gpu.power,
              fans: changedFans
            });
          }
        }
      });

      gpuFan.apply(false);

      console.clear();
      console.log("Monitoring GPUs...\n".bold.cyan);
      if (gpuChangelog.length > 0) {
        console.log(displayGpuChangelog(gpuChangelog));
      }
      console.log(copyright());
    }
  };
}

function changelog(timestamp, gpu, fan, speed) {
  log(
    [timestamp, gpu.name, gpu.index, gpu.power.usage, gpu.temperature, gpu.deltaTemperature, fan.index, speed].join(";")
  );
}

module.exports = TemperatureAnalyzer;
