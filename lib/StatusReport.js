const { Gpu } = require("./Gpu");
const { displayGpuStatusTable } = require("./DisplayTable");

function displayGpuStatus(params) {
  const report = getGpuStatusReport(params);
  process.stdout.write(report);

  if (params.refresh) {
    setInterval(() => {
      const report = getGpuStatusReport(params);
      clearConsoleOutput();
      process.stdout.write(report);
    }, 15_000);
  }
}

function clearConsoleOutput() {
  const lines = new Buffer(process.stdout).toString("utf-8").split("\n");

  process.stdout.moveCursor(0, -lines.length);
  lines.forEach(() => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  });
  process.stdout.cursorTo(0);
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
