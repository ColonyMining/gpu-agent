const { Gpu } = require("./GpuFacade");
const { displayGpuStatusTable } = require("./DisplayTable");

function displayGpuStatus(params) {
  displayGpuStatusTable(gpuStatus(params.gpus));
}

function gpuStatus(selectedGpus = "all") {
  const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(parseInt);
  const gpus = Gpu.list();
  Gpu.details(gpus);

  return gpus.filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1);
}

module.exports = { displayGpuStatus };
