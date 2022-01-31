const moment = require("moment");
const { Gpu } = require("./Gpu");
const { log } = require("./Logger");
const { displayGpuChangelog } = require("./DisplayTable");
const Report = require("./Report");
const Config = require("./Config");

function TemperatureAnalyzer(defaultTemperature, display) {
  return {
    analyze: function (gpus) {
      const config = new Config(display);
      const gpusConfig = config.load().gpus || {};

      const timestamp = moment().utc();

      const gpuFan = new Gpu(display).fans();

      const gpuChangelog = [];

      gpus.forEach(gpu => {
        const gpuConfig = gpusConfig[`${gpu.index}`];

        const temperature = gpuConfig ? gpuConfig.temperature || defaultTemperature : defaultTemperature;
        const MAX_DELTA = temperature * 0.025;
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

      gpuFan.apply(display);

      const table = gpuChangelog.length > 0 ? displayGpuChangelog(gpuChangelog) : undefined;
      Report.print(table, { clear: true, title: "Monitoring GPUs...\n".bold.cyan });
    }
  };
}

function changelog(timestamp, gpu, fan, speed) {
  log(
    [timestamp, gpu.name, gpu.index, gpu.power.usage, gpu.temperature, gpu.deltaTemperature, fan.index, speed].join(";")
  );
}

module.exports = TemperatureAnalyzer;
