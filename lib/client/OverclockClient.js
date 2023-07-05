const Overclock = require("../Overclock");
const Report = require("./Report");
const { displayOverclock } = require("./DisplayTable");
const { Observer } = require("../Observer");

class OverclockClient {
  static async displayCurrentOverclock(selectedGpus, display) {
    const overclock = new Overclock(display);
    const currentOverclockSettings = await overclock.current(selectedGpus);

    Report.print(displayOverclock(currentOverclockSettings));
  }

  static async set(selectedGpus, options, verbose, display) {
    const overclock = new Overclock(display);
    overclock.subscribe(
      new Observer((eventType, value) => {
        if (eventType === Overclock.Events.GPU_SETTINGS_NOT_FOUND) {
          console.error(`GPU ${value.gpu} configuration not found`.red);
        }
      })
    );
    await overclock.set(selectedGpus, options, verbose);
  }

  static async save(selectedGpus, profile, hashrate, display) {
    const overclock = new Overclock(display);
    overclock.subscribe(
      new Observer((eventType, value) => {
        if (eventType === Overclock.Events.SET_GPU_PROFILE) {
          console.log(`GPU ${value.gpu} set to profile ${value.profile}`.yellow);
        } else if (eventType === Overclock.Events.GPU_PROFILE_NOT_FOUND) {
          console.error(`No config available for ${value.profile} -- ${value.gpu} ${value.name}`);
        }
      })
    );
    await overclock.save(selectedGpus, profile, hashrate);
  }

  static async load(selectedGpus, profile, verbose, display) {
    const overclock = new Overclock(display);
    await overclock.load(selectedGpus, profile, verbose);
  }

  static async reset(selectedGpus, verbose, display) {
    const overclock = new Overclock(display);
    await overclock.reset(selectedGpus, verbose);
  }
}

module.exports = OverclockClient;
