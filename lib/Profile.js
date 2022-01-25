const { Config } = require("./Config");
const { copyright, displayProfiles } = require("./DisplayTable");

function list() {
  const config = Config.load();

  const profiles = Object.keys(config.profiles).map(profile => ({
    name: profile,
    gpus: Object.keys(config.profiles[profile]).map(gpu => ({
      name: config.profiles[profile][gpu].name,
      power: config.profiles[profile][gpu].power,
      fan: config.profiles[profile][gpu].fan,
      core: config.profiles[profile][gpu].core,
      memory: config.profiles[profile][gpu].memory,
      lgc: config.profiles[profile][gpu].lgc,
      lmc: config.profiles[profile][gpu].lmc,
      hashrate: config.profiles[profile][gpu].hashrate
    }))
  }));

  console.log(displayProfiles(profiles));
  console.log(copyright());
}

const Profile = {
  list
};

module.exports = Profile;
