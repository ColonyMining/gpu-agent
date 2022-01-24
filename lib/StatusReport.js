const { Gpu } = require("./Gpu");
const { displayGpuStatusTable } = require("./DisplayTable");

function displayGpuStatus(params) {
  const lines = getGpuStatusReport(params);
  lines.forEach(line => process.stdout.write(line + "\n"));

  if (params.refresh) {
    let lastLines = lines;
    setInterval(() => {
      const lines = getGpuStatusReport(params);
      clearConsoleOutput(lastLines);
      lines.forEach(line => process.stdout.write(line + "\n"));
      lastLines = lines;
    }, 15_000);
  }
}

function clearConsoleOutput(lastLines) {
  process.stdout.moveCursor(0, -lastLines.length);
  lastLines.forEach(() => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  });
  process.stdout.cursorTo(0);
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
