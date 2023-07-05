const Profile = require("../Profile");
const Report = require("./Report");
const { displayProfiles } = require("./DisplayTable");
const Prompt = require("./Prompt");

class ProfileClient {
  static async list(profileFilter, gpuFilter, tagFilter, display) {
    const profile = new Profile(display);
    const profiles = await profile.list(profileFilter, gpuFilter, tagFilter);

    Report.print(displayProfiles(profiles));
  }

  static async remove(profileFilter, gpuFilter, tagFilter, display) {
    await this.list(profileFilter, gpuFilter, tagFilter, display);

    Prompt.input(`${"Do you want to remove these profiles?".yellow}\n(${"yes".green}/${"no".red})`, async answer => {
      if (!answer) return;

      if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
        const profile = new Profile(display);
        await profile.remove(profileFilter, gpuFilter, tagFilter);
      }
    });
  }
}

module.exports = ProfileClient;
