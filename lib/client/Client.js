const StatusReport = require("./StatusReport");
const AgentClient = require("./AgentClient");
const OverclockClient = require("./OverclockClient");
const ProfileClient = require("./ProfileClient");

const Client = {
  status: function (params) {
    executeCommand(StatusReport.status(params.gpus, isTrue(params.watch), params.display));
  },

  startAgent: function (params) {
    const interval = params.interval ? parseInt(params.interval) : undefined;
    const temperature = params.temperature ? parseInt(params.temperature) : undefined;
    const agent = new AgentClient(interval, temperature, params.display);
    executeCommand(agent.start());
  },

  currentOverclock: function (params) {
    executeCommand(OverclockClient.displayCurrentOverclock(params.gpus, params.display));
  },

  setOverclock: function (params) {
    const options = {
      tag: params.tag,
      removeTag: params["remove-tag"] === "true",
      power: toInt(params.power),
      temperature: toInt(params.temperature),
      core: toInt(params.core),
      memory: toInt(params.memory),
      lgc: toInt(params.lgc),
      lmc: toInt(params.lmc),
      fan: toInt(params.fan)
    };

    executeCommand(OverclockClient.set(params.gpus, options, isTrue(params.verbose), params.display));
  },

  saveOverclock: function (params) {
    executeCommand(OverclockClient.save(params.gpu, params.profile, params.hr, params.display));
  },

  loadOverclock: function (params) {
    executeCommand(OverclockClient.load(params.gpus, params.profile, isTrue(params.verbose), params.display));
  },

  resetOverclock: function (params) {
    executeCommand(OverclockClient.reset(params.gpus, isTrue(params.verbose), params.display));
  },

  listProfile: function (params) {
    executeCommand(ProfileClient.list(params.profile, params.gpu, params.tag, params.display));
  },

  removeProfile: function (params) {
    executeCommand(ProfileClient.remove(params.profile, params.gpu, params.tag, params.display));
  }
};

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
