class Rig {
  constructor(vendor) {
    this.vendor = vendor;
  }

  async gpus() {
    if (this._gpus) {
      return this._gpus;
    }

    this._gpus = await this.vendor.gpus();
    return this._gpus;
  }
}