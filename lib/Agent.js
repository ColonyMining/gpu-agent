const TemperatureAnalyzer = require("./TemperatureAnalyzer");
const { Gpu } = require("./Gpu");
const { seconds, every } = require("./Timer");
const { Observable, Observer } = require("./Observer");
const { log } = require("./Logger");

const DEFAULT_INTERVAL = 60;
const DEFAULT_TEMPERATURE = 65;

class Agent {
  constructor(interval = DEFAULT_INTERVAL, temperature = DEFAULT_TEMPERATURE, display) {
    if (interval < 30) {
      throw new Error("the interval cannot be less than 30s");
    }

    this.observable = new Observable();
    this.interval = interval;
    this.temperature = temperature;
    this.display = display;
  }

  subscribe(listener) {
    this.observable.subscribe(listener);
  }

  async start() {
    this.observable.update(Agent.Events.START);

    const gpuController = new Gpu(this.display);
    const gpus = await gpuController.list(this.display);

    const temperatureAnalyzer = new TemperatureAnalyzer(this.temperature, this.display);
    temperatureAnalyzer.subscribe(new Observer(changelog));
    temperatureAnalyzer.subscribe(
      new Observer((eventType, gpuChangelog) => observable.update(Agent.Events.UPDATE, gpuChangelog))
    );

    every(seconds(this.interval).toMillis()).call(async () => {
      await gpuController.details(gpus, ["overclock"]);
      await temperatureAnalyzer.analyze(gpus);
    });
  }
}

function changelog(eventType, gpuChangelog) {
  gpuChangelog.forEach(gpuChange => {
    gpuChange.fans.forEach(fan => {
      log(
        [
          gpuChange.timestamp,
          gpuChange.name,
          gpuChange.index,
          gpuChange.power.usage,
          gpuChange.temperature,
          gpuChange.deltaTemperature,
          fan.index,
          fan.speed
        ].join(";")
      );
    });
  });
}

Agent.Events = {
  START: "START",
  UPDATE: "UPDATE"
};

module.exports = Agent;
