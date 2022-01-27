const { Gpu, filterGpus } = require("./Gpu");
const { displayGpuStatusTable, copyright } = require("./DisplayTable");
const Report = require("./Report");

function displayGpuStatus(gpus, watch) {
  const report = getGpuStatusReport(gpus);

  if (watch) {
    Report.print(report, { clear: true });
    setInterval(() => {
      const report = getGpuStatusReport(gpus);
      Report.print(report, { clear: true });
    }, 15_000);
  } else {
    Report.print(report);
  }
}

function getGpuStatusReport(selectedGpus = "all") {
  const gpus = Gpu.list();
  Gpu.details(gpus);
  const filteredGpus = filterGpus(gpus, selectedGpus);
  return displayGpuStatusTable(filteredGpus);
}

module.exports = { displayGpuStatus };
