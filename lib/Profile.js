const Config = require("./Config");
const { displayProfiles } = require("./DisplayTable");
const Report = require("./Report");

function Profile(display = ":0") {
  return {
    list: function (profileFilter, gpuFilter) {
      const config = new Config(display).load();

      const profiles = Object.keys(config.profiles)
        .filter(profile => profileFilter === undefined || profile.indexOf(profileFilter) > -1)
        .map(profile => ({
          name: profile,
          gpus: Object.keys(config.profiles[profile])
            .filter(gpu => gpuFilter === undefined || config.profiles[profile][gpu].name.indexOf(gpuFilter) > -1)
            .map(gpu => ({
              name: config.profiles[profile][gpu].name,
              tag: config.profiles[profile][gpu].tag,
              temperature: config.profiles[profile][gpu].temperature,
              power: config.profiles[profile][gpu].power,
              fan: config.profiles[profile][gpu].fan,
              core: config.profiles[profile][gpu].core,
              memory: config.profiles[profile][gpu].memory,
              lgc: config.profiles[profile][gpu].lgc,
              lmc: config.profiles[profile][gpu].lmc,
              hashrate: config.profiles[profile][gpu].hashrate
            }))
        }));

      Report.print(displayProfiles(profiles));
    }
  };
}

module.exports = Profile;
