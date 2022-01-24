const { Gpu } = require("./Gpu");
const { displayGpuStatusTable } = require("./DisplayTable");

function displayGpuStatus(params) {
  const report = getGpuStatusReport(params);
  console.log(report);

  if (params.refresh) {
    setInterval(() => {
      const report = getGpuStatusReport(params);
      console.clear();
      console.log(report);
    }, 15_000);
  }
}

function getGpuStatusReport(params) {
  const gpus = gpuStatus(params.gpus);
  return displayGpuStatusTable(gpus);
}

function gpuStatus(selectedGpus = "all") {
  const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(parseInt);
  const gpus = Gpu.list();
  Gpu.details(gpus);

  return gpus.filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1);
}

module.exports = { displayGpuStatus };
