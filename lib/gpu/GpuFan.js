class GpuFan {
  constructor(driver, {index, name}) {
    this.driver = driver;
    this.index = index;
    this.name = name;
  }
}

module.exports = GpuFan;