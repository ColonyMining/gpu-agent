const Overclock = require("../Overclock");
const Report = require("./Report");
const { displayOverclock } = require("./DisplayTable");
const Config = require("../Config");

const OverclockClient = {
  displayCurrentOverclock: async function (selectedGpus, display) {
    const overclock = new Overclock(display);
    const currentOverclockSettings = await overclock.current(selectedGpus);

    Report.print(displayOverclock(currentOverclockSettings));
  },

  set: async function (selectedGpus, options, verbose, display) {
    const overclock = new Overclock(display);
    await overclock.set(selectedGpus, options, verbose);
  },

  save: async function (selectedGpus, profile, hashrate, display) {
    await new Config(display).save(selectedGpus, profile, hashrate);
  },

  load: async function (selectedGpus, profile, verbose, display) {
    const overclock = new Overclock(display);
    await overclock.load(selectedGpus, profile, verbose);
  },

  reset: async function (selectedGpus, verbose, display) {
    const overclock = new Overclock(display);
    await overclock.reset(selectedGpus, verbose);
  }
};

module.exports = OverclockClient;
