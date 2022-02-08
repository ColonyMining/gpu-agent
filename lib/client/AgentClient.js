const Agent = require("../Agent");
const Report = require("./Report");
const { displayGpuChangelog } = require("./DisplayTable");
const { Observer } = require("../Observer");

function AgentClient(interval, temperature, silent = false, display) {
  const agent = new Agent(interval, temperature, display);
  if (!silent) {
    agent.subscribe(new Observer(eventListener));
  }

  return {
    start: async function () {
      await agent.start();
    }
  };
}

function eventListener(eventType, value) {
  if (eventType === Agent.Events.START) {
    onStart();
  } else if (eventType === Agent.Events.UPDATE) {
    onUpdate(value);
  }
}

const REPORT_TITLE = "Monitoring GPUs...\n".bold.cyan;

function onStart() {
  Report.print(undefined, { clear: true, title: REPORT_TITLE });
}

function onUpdate(gpuChangelog) {
  const table = gpuChangelog.length > 0 ? displayGpuChangelog(gpuChangelog) : undefined;
  Report.print(table, { clear: true, title: REPORT_TITLE });
}

module.exports = AgentClient;
