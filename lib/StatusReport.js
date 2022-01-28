const { Gpu, filterGpus } = require("./Gpu");
const { displayGpuStatusTable } = require("./DisplayTable");
const Report = require("./Report");

function displayGpuStatus(selectedGpus, watch, display) {
  const report = getGpuStatusReport(selectedGpus, display);

  if (watch) {
    Report.print(report, { clear: true });
    setInterval(() => {
      const report = getGpuStatusReport(selectedGpus, display);
      Report.print(report, { clear: true });
    }, 25_000);
  } else {
    Report.print(report);
  }
}

function getGpuStatusReport(selectedGpus = "all", display) {
  const gpuController = new Gpu(display);
  const gpus = gpuController.list();
  gpuController.details(gpus);
  const filteredGpus = filterGpus(gpus, selectedGpus);
  return displayGpuStatusTable(filteredGpus);
}

module.exports = { displayGpuStatus };
