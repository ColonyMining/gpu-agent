const Overclock = require("../Overclock");
const Report = require("./Report");
const { displayOverclock } = require("./DisplayTable");

const OverclockClient = {
  displayCurrentOverclock: async function (selectedGpus, display) {
    const overclock = new Overclock(display);
    const currentOverclockSettings = await overclock.current(selectedGpus);

    Report.print(displayOverclock(currentOverclockSettings));
  },

  set: async function (selectedGpus, options, verbose, display) {
    const overclock = new Overclock(display);
    overclock.subscribe((eventType, value) => {
      if (eventType === Overclock.Events.GPU_SETTINGS_NOT_FOUND) {
        console.error(`GPU ${value.gpu} configuration not found`.red);
      }
    });
    await overclock.set(selectedGpus, options, verbose);
  },

  save: async function (selectedGpus, profile, hashrate, display) {
    const overclock = new Overclock(display);
    overclock.subscribe((eventType, value) => {
      if (eventType === Overclock.Events.SET_GPU_PROFILE) {
        console.log(`GPU ${value.gpu} set to profile ${value.profile}`.yellow);
      } else if (eventType === Overclock.Events.GPU_PROFILE_NOT_FOUND) {
        console.error(`No config available for ${value.profile} -- ${value.gpu} ${value.name}`);
      }
    });
    await overclock.save(selectedGpus, profile, hashrate);
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
