const { Gpu } = require("./GpuFacade");
const { displayGpuStatusTable } = require("./DisplayTable");

function displayGpuStatus(params) {
  if (!params.refresh) {
    const lines = getGpuStatusReport(params);
    lines.forEach(line => process.stdout.write(line + "\n"));
  } else {
    let lastLines = [];
    setInterval(() => {
      const lines = getGpuStatusReport(params);
      lastLines.forEach((item, index) => process.stdout.clearLine(0));
      lines.forEach(line => process.stdout.write(line + "\n"));
      lastLines = lines;
    }, 60_000);
  }
}

function getGpuStatusReport(params) {
  const gpus = gpuStatus(params.gpus);
  const table = displayGpuStatusTable(gpus);
  return table.split("\n");
}

function gpuStatus(selectedGpus = "all") {
  const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(parseInt);
  const gpus = Gpu.list();
  Gpu.details(gpus);

  return gpus.filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1);
}

module.exports = { displayGpuStatus };
