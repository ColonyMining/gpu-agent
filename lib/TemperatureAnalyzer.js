const moment = require("moment");
const { Gpu } = require("./Gpu");
const Config = require("./Config");
const { Observable } = require("./Observer");

function TemperatureAnalyzer(defaultTemperature, display) {
  const observable = new Observable();

  return {
    subscribe: function (listener) {
      observable.subscribe(listener);
    },

    analyze: async function (gpus) {
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
            }
          });

          if (changedFans.length > 0) {
            gpuChangelog.push({
              timestamp: timestamp.format("YYYY-MM-DD HH:mm:ss"),
              index: gpu.index,
              name: gpu.name,
              temperature: gpu.temperature,
              defaultTemperature: gpu.defaultTemperature,
              power: gpu.power,
              fans: changedFans
            });
          }
        }
      });

      await gpuFan.apply(display);

      observable.update(TemperatureAnalyzer.Events.UPDATE, gpuChangelog);
    }
  };
}

TemperatureAnalyzer.Events = {
  UPDATE: "UPDATE"
};

module.exports = TemperatureAnalyzer;
