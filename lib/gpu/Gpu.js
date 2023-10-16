const GpuFan = require("./GpuFan");

class Gpu {
  constructor(driver, {index, name, fans, overclock}) {
    this.driver = driver;
    this.index = index;
    this.name = name;
    this.fans = fans.map(fan => new GpuFan(driver, fan));
    this.overclock = overclock;
  }
}

module.exports = Gpu;