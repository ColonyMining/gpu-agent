const { displayGpuStatusTable } = require("./DisplayTable");
const Report = require("./Report");
const { every } = require("../Timer");
const Gpus = require("../Gpus");

const StatusReport = {
  status: async function (gpus, watch, interval = 25_000, display) {
    const displayReport = async () => {
      const gpuStatus = await Gpus.getStatus(gpus, display);
      const report = displayGpuStatusTable(gpuStatus);
      Report.print(report, { clear: true });
    };

    await displayReport();

    if (watch) {
      every(25_000).call(displayReport);
    }
  }
};

module.exports = StatusReport;
