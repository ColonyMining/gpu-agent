const Agent = require("../Agent");
const Report = require("./Report");
const { displayGpuChangelog } = require("./DisplayTable");
const { Observer } = require("../Observer");

const REPORT_TITLE = "Monitoring GPUs...\n".bold.cyan;

class AgentClient {
  constructor(interval, temperature, silent = false, display) {
    this.agent = new Agent(interval, temperature, display);
    if (!silent) {
      this.agent.subscribe(new Observer(eventListener));
    }
  }

  async start() {
    await this.agent.start();
  }
}

function eventListener(eventType, value) {
  if (eventType === Agent.Events.START) {
    onStart();
  } else if (eventType === Agent.Events.UPDATE) {
    onUpdate(value);
  }
}

function onStart() {
  Report.print(undefined, { clear: true, title: REPORT_TITLE });
}

function onUpdate(gpuChangelog) {
  const table = gpuChangelog.length > 0 ? displayGpuChangelog(gpuChangelog) : undefined;
  Report.print(table, { clear: true, title: REPORT_TITLE });
}

module.exports = AgentClient;
