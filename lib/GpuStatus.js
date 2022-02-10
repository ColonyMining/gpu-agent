const { Gpu, filterGpus } = require("./Gpu");

const GpuStatus = {
  getStatus: async function (selectedGpus, display) {
    const gpuController = new Gpu(display);
    const gpus = await gpuController.list();
    await gpuController.details(gpus);
    return filterGpus(gpus, selectedGpus);
  }
};

module.exports = GpuStatus;
