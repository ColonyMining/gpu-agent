const CommandLineExecutor = require("../../../CommandLineExecutor");
const NvidiaErrorHandler = require("../../../vendor/NvidiaErrorHandler");
const Gpu = require("../../Gpu");
const { Observable } = require("../../../Observer");

const GPU = "gpu";
const FAN = "fan";
const GPU_FANS_REGEX = /\[((gpu|fan):(\d+))]\s?(\(([^)]+)\))?/g;

class NvidiaDriver {
  constructor({display = ":0"}) {
    this.display = display;
  }

  async gpus() {
    const executor = new CommandLineExecutor();
    executor.errorHandler(new NvidiaErrorHandler());
    const response = await executor.execute(`nvidia-settings -c ${this.display} -q gpus --verbose`);

    const matches = [...response.matchAll(GPU_FANS_REGEX)];

    const gpus = [];
    let currentGpu;

    matches.forEach(match => {
      const type = match[2];
      if (type === GPU) {
        currentGpu = {
          index: parseInt(match[3]),
          name: match[5],
          fans: [],
          overclock: {}
        };
        gpus.push(currentGpu);
      } else if (type === FAN) {
        currentGpu.fans.push({
          index: parseInt(match[3]),
          name: match[5]
        });
      }
    });

    gpus.forEach(gpu => gpu.fans.sort((fanA, fanB) => fanA.index - fanB.index));
    gpus.sort((gpuA, gpuB) => gpuA.index - gpuB.index);

    return gpus.map(gpu => new Gpu(this, gpu));
  }
}

module.exports = NvidiaDriver;