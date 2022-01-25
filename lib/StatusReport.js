const { Gpu } = require("./Gpu");
const { displayGpuStatusTable, copyright } = require("./DisplayTable");

function displayGpuStatus(gpus, watch) {
  const report = getGpuStatusReport(gpus);

  if (watch) {
    console.clear();
    console.log(report);
    console.log(copyright());
    setInterval(() => {
      const report = getGpuStatusReport(gpus);
      console.clear();
      console.log(report);
      console.log(copyright());
    }, 15_000);
  } else {
    console.log(report);
    console.log(copyright());
  }
}

function getGpuStatusReport(gpus) {
  const status = gpuStatus(gpus);
  return displayGpuStatusTable(status);
}

function gpuStatus(selectedGpus = "all") {
  const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(parseInt);
  const gpus = Gpu.list();
  Gpu.details(gpus);

  return gpus.filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1);
}

module.exports = { displayGpuStatus };
