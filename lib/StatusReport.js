const { Gpu, filterGpus } = require("./Gpu");
const { displayGpuStatusTable, copyright } = require("./DisplayTable");
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
  const gpus = Gpu.list(display);
  Gpu.details(gpus, [], display);
  const filteredGpus = filterGpus(gpus, selectedGpus);
  return displayGpuStatusTable(filteredGpus);
}

module.exports = { displayGpuStatus };
