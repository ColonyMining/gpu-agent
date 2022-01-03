import { listGpus, updateTemperature } from "../lib/Gpu";

setInterval(() => {
  const gpus = listGpus();
  updateTemperature(gpus);

  console.dir(gpus, { depth: 5 });
}, 10_000);
