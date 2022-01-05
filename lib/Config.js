function gpuToConfig(gpu) {
  const config = { ...gpu };

  delete config.temperature;
  delete config.deltaTemperature;

  return config;
}
