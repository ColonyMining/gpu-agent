const colors = require("colors");
const Config = require("./Config");
const { displayProfiles } = require("./DisplayTable");
const Report = require("./Report");
const Prompt = require("./Prompt");

function Profile(display = ":0") {
  return {
    list: function (profileFilter, gpuFilter, tagFilter) {
      const config = new Config(display).load();

      const profiles = Object.keys(config.profiles)
        .filter(profile => profileFilter === undefined || profile === profileFilter)
        .map(profile => ({
          name: profile,
          gpus: Object.keys(config.profiles[profile])
            .filter(gpu => gpuFilter === undefined || config.profiles[profile][gpu].name.indexOf(gpuFilter) > -1)
            .filter(gpu => tagFilter === undefined || config.profiles[profile][gpu].tag === tagFilter)
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
        }))
        .filter(profile => profile.gpus.length > 0);

      Report.print(displayProfiles(profiles));
    },

    remove: function (profileFilter, gpuFilter, tagFilter) {
      this.list(profileFilter, gpuFilter, tagFilter);

      Prompt.input(`Do you want to remove these profiles? (${"yes".green}/${"no".red})`, answer => {
        if (answer && answer.toLowerCase() === "yes") {
          console.log("removing");
        }
      });
    }
  };
}

module.exports = Profile;
