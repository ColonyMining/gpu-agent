const Config = require("./Config");

class Profile {
  async list(profileFilter, gpuFilter, tagFilter) {
    const config = new Config();

    return config
      .profiles()
      .filter(profile => profileFilter === undefined || profile.name === profileFilter)
      .map(profile => ({
        name: profile.name,
        gpus: config
          .profile(profile.name)
          .gpus()
          .filter(gpu => gpuFilter === undefined || gpu.name.indexOf(gpuFilter) > -1)
          .filter(gpu => tagFilter === undefined || gpu.tag === tagFilter)
      }))
      .filter(profile => profile.gpus.length > 0);
  }

  async remove(profileFilter, gpuFilter, tagFilter) {
    const config = new Config();

    if (profileFilter === undefined && gpuFilter === undefined && tagFilter === undefined) {
      config.removeAllProfiles();
    } else if (profileFilter !== undefined && gpuFilter === undefined && tagFilter === undefined) {
      const profile = config.profile(profileFilter);
      if (profile) {
        profile.remove();
      }
    } else {
      await removeProfileByFilter(config, profileFilter, gpuFilter, tagFilter);
    }

    config.save();
  }
}

function removeProfileByFilter(config, profileFilter, gpuFilter, tagFilter) {
  config
    .profiles()
    .filter(profile => profileFilter === undefined || profile.name === profileFilter)
    .forEach(profile => {
      const profileObject = config.profile(profile.name);
      profileObject
        .gpus()
        .filter(gpu => gpuFilter === undefined || gpu.name.indexOf(gpuFilter) > -1)
        .filter(gpu => tagFilter === undefined || gpu.tag === tagFilter)
        .forEach(gpu => profileObject.removeGpu(gpu.name, gpu.tag));
    });
}

module.exports = Profile;
