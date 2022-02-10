const { displayGpuStatusTable } = require("./DisplayTable");
const Report = require("./Report");
const { every } = require("../Timer");
const GpuStatus = require("../GpuStatus");

const StatusReport = {
  status: async function (gpus, watch, interval = 25_000, display) {
    const displayReport = async () => {
      const gpuStatus = await GpuStatus.getStatus(gpus, display);
      const report = displayGpuStatusTable(gpuStatus);
      Report.print(report, { clear: watch });
    };

    await displayReport();

    if (watch) {
      every(25_000).call(displayReport);
    }
  }
};

module.exports = StatusReport;
