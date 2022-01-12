const moment = require("moment");
const { GpuFan } = require("./Gpu");
const { log } = require("./Logger");

function TemperatureAnalyzer() {
  const watching = [];

  function getWatching(gpu) {
    return watching.find(watchingGpu => watchingGpu.index === gpu.index);
  }

  return {
    analyze: function (gpus, temperature) {
      const MAX_DELTA = temperature * 0.025;
      const timestamp = moment().utc().format();

      const gpuFan = new GpuFan();

      gpus.forEach(gpu => {
        const delta = gpu.temperature - temperature;

        if (Math.abs(delta) > MAX_DELTA) {
          const watchingGpu = getWatching(gpu);
          if (watchingGpu) {
            watching.splice(watching.indexOf(watchingGpu), 1);
          }

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
        } else if (isFanHigherThan50(gpu)) {
          const watchingGpu = getWatching(gpu);

          if (!watchingGpu) {
            watching.push({ gpu: gpu.index, temperature: gpu.temperature });
          } else if (gpu.temperature > watchingGpu.temperature) {
            return;
          }

          gpu.fans.forEach(fan => {
            const speed = fan.speed - 1;
            gpuFan.setFanSpeed(gpu.index, fan.index, speed);
            changelog(timestamp, gpu, fan, speed);
          });
        }
      });

      gpuFan.apply();
    }
  };
}

function isFanHigherThan50(gpu) {
  return gpu.fans.filter(fan => fan.speed > 50).length > 0;
}

function changelog(timestamp, gpu, fan, speed) {
  log(
    [timestamp, gpu.name, gpu.index, gpu.power.usage, gpu.temperature, gpu.deltaTemperature, fan.index, speed].join(";")
  );
}

module.exports = TemperatureAnalyzer;
