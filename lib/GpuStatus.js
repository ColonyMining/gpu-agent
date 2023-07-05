const { Gpu, filterGpus } = require("./Gpu");

class GpuStatus {
  static async getStatus(selectedGpus, display) {
    const gpuController = new Gpu(display);
    const gpus = await gpuController.list();
    await gpuController.details(gpus);
    return filterGpus(gpus, selectedGpus);
  }
}

module.exports = GpuStatus;
