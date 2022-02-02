const colors = require("colors");
const Config = require("./Config");
const { displayProfiles } = require("./DisplayTable");
const Report = require("./Report");
const Prompt = require("./Prompt");
const { Gpu } = require("./Gpu");

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

      Prompt.input(`${"Do you want to remove these profiles?".yellow}\n(${"yes".green}/${"no".red})`, async answer => {
        if (!answer) return;

        if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
          const config = new Config(display);
          const configObject = config.load();

          if (profileFilter === undefined && gpuFilter === undefined && tagFilter === undefined) {
            removeAllProfiles(configObject);
          } else if (profileFilter !== undefined && gpuFilter === undefined && tagFilter === undefined) {
            removeProfile(configObject, profileFilter);
          } else {
            await removeProfileByFilter(configObject, profileFilter, gpuFilter, tagFilter, display);
          }

          config.store(configObject);
        }
      });
    }
  };
}

async function removeProfileByFilter(config, profileFilter, gpuFilter, tagFilter, display) {
  const gpuSetting = new Gpu(display);
  const gpus = await gpuSetting.list();

  Object.keys(config.profiles)
    .filter(profileName => profileFilter === undefined || profileName === profileFilter)
    .map(profileName => config.profiles[profileName])
    .forEach(profile => {
      Object.keys(profile)
        .map(gpuKey => profile[gpuKey])
        .filter(gpu => gpuFilter === undefined || gpu.name.indexOf(gpuFilter) > -1)
        .filter(gpu => tagFilter === undefined || gpu.tag === tagFilter)
        .forEach(gpu => {
          const reference = tagFilter ? `:${tagFilter}` : "";
          const gpuKey = `${gpu.name}${reference}`;
          delete profile[gpuKey];
        });
    });

  Object.keys(config.profiles)
    .filter(profileName => Object.keys(config.profiles[profileName]).length === 0)
    .forEach(profileName => {
      delete config.profiles[profileName];
    });

  Object.keys(config.gpus)
    .map(gpuIndex => ({ config: config.gpus[gpuIndex], name: gpus.find(gpu => `${gpu.index}` === gpuIndex).name }))
    .filter(gpu => profileFilter === undefined || gpu.config.profile === profileFilter)
    .filter(gpu => gpuFilter === undefined || gpu.name.indexOf(gpuFilter) > -1)
    .filter(gpu => tagFilter === undefined || gpu.config.tag === tagFilter)
    .forEach(gpu => {
      gpu.config.profile = undefined;
    });
}

function removeProfile(config, profileFilter) {
  delete config.profiles[profileFilter];

  Object.keys(config.gpus)
    .map(gpuIndex => config.gpus[gpuIndex])
    .filter(gpu => gpu.profile === profileFilter)
    .forEach(gpu => {
      gpu.profile = undefined;
    });
}

function removeAllProfiles(config) {
  config.profiles = {};

  Object.keys(config.gpus)
    .map(gpuIndex => config.gpus[gpuIndex])
    .forEach(gpu => {
      gpu.profile = undefined;
    });
}

module.exports = Profile;
