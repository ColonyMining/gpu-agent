const { Gpu, filterGpus } = require("./Gpu");
const { displayGpuStatusTable } = require("./DisplayTable");
const Report = require("./Report");

async function displayGpuStatus(selectedGpus, watch, display) {
  const report = await getGpuStatusReport(selectedGpus, display);

  if (watch) {
    Report.print(report, { clear: true });
    setInterval(async () => {
      const report = await getGpuStatusReport(selectedGpus, display);
      Report.print(report, { clear: true });
    }, 25_000);
  } else {
    Report.print(report);
  }
}

async function getGpuStatusReport(selectedGpus = "all", display) {
  const gpuController = new Gpu(display);
  const gpus = await gpuController.list();
  await gpuController.details(gpus);
  const filteredGpus = filterGpus(gpus, selectedGpus);
  return displayGpuStatusTable(filteredGpus);
}

module.exports = { displayGpuStatus };
