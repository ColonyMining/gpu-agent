const StatusReport = require("./StatusReport");
const AgentClient = require("./AgentClient");
const OverclockClient = require("./OverclockClient");
const ProfileClient = require("./ProfileClient");

class Client {
  static async status(params) {
    executeCommand(
      StatusReport.status(await params.gpus, isTrue(await params.watch), await params.interval, await params.display)
    );
  }

  static async startAgent(params) {
    const interval = (await params.interval) ? parseInt(await params.interval) : undefined;
    const temperature = (await params.temperature) ? parseInt(await params.temperature) : undefined;
    const agent = new AgentClient(interval, temperature, isTrue(await params.silent), await params.display);
    executeCommand(agent.start());
  }

  static async currentOverclock(params) {
    executeCommand(OverclockClient.displayCurrentOverclock(await params.gpus, await params.display));
  }

  static async setOverclock(params) {
    const options = {
      tag: await params.tag,
      removeTag: (await params["remove-tag"]) === "true",
      power: toInt(await params.power),
      temperature: toInt(await params.temperature),
      core: toInt(await params.core),
      memory: toInt(await params.memory),
      lgc: toInt(await params.lgc),
      lmc: toInt(await params.lmc),
      fan: toInt(await params.fan)
    };

    executeCommand(OverclockClient.set(await params.gpus, options, isTrue(await params.verbose), await params.display));
  }

  static async saveOverclock(params) {
    const hashrate = (await params.hr) ? parseInt(await params.hr) : undefined;
    executeCommand(OverclockClient.save(await params.gpus, await params.profile, hashrate, await params.display));
  }

  static async loadOverclock(params) {
    executeCommand(
      OverclockClient.load(await params.gpus, await params.profile, isTrue(await params.verbose), await params.display)
    );
  }

  static async resetOverclock(params) {
    executeCommand(OverclockClient.reset(await params.gpus, isTrue(await params.verbose), await params.display));
  }

  static async listProfile(params) {
    executeCommand(ProfileClient.list(await params.profile, await params.gpu, await params.tag, await params.display));
  }

  static async removeProfile(params) {
    executeCommand(
      ProfileClient.remove(await params.profile, await params.gpu, await params.tag, await params.display)
    );
  }
}

function isTrue(value) {
  return value === "true";
}

function toInt(value) {
  if (value === undefined) {
    return undefined;
  }
  return parseInt(value);
}

function executeCommand(command) {
  command
    .then(() => {})
    .catch(err => {
      console.error(`ERROR: ${err.message}`.red);
      process.exit(1);
    });
}

module.exports = Client;
