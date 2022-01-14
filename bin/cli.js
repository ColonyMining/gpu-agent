const { Engine } = require("aux4");
const Agent = require("./agent");
const { Config } = require("../lib/Config");

const config = {
  profiles: [
    {
      name: "main",
      commands: [
        {
          value: "monitor",
          execute: ["profile:monitor"],
          help: {
            description: "GPU monitor"
          }
        },
        {
          value: "overclock",
          execute: ["profile:overclock"],
          help: {
            description: "GPU overclock"
          }
        }
      ]
    },
    {
      name: "monitor",
      commands: [
        {
          value: "start",
          execute: params => Agent.start(params),
          help: {
            description: "start GPU agent",
            variables: [
              {
                name: "interval",
                text: "GPU check interval in seconds",
                default: "60"
              },
              {
                name: "temperature",
                text: "GPU target temperature",
                default: "65"
              }
            ]
          }
        }
      ]
    },
    {
      name: "overclock",
      commands: [
        {
          value: "set",
          help: {
            description: "set overclock to GPU",
            variables: [
              {
                name: "gpu",
                text: "GPU index/PCI slot (starting from 0)"
              },
              {
                name: "power",
                text: "GPU power limit (optional)",
                default: ""
              },
              {
                name: "core",
                text: "GPU graphics clock offset (optional)",
                default: ""
              },
              {
                name: "memory",
                text: "GPU memory transfer rate offset (optional)",
                default: ""
              },
              {
                name: "lock",
                text: "GPU lock graphics clock (optional)",
                default: ""
              },
              {
                name: "fan",
                text: "GPU fan speed [30-100] (optional)",
                default: ""
              }
            ]
          }
        },
        {
          value: "save",
          execute: params => Config.save(params.gpus, params.profile, params.ref, params.hashrate),
          help: {
            description: "save overclock profile configuration",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids to be saved (comma separated)",
                default: "all"
              },
              {
                name: "profile",
                text: "profile name"
              },
              {
                name: "ref",
                text: "reference (optional)",
                default: ""
              },
              {
                name: "hr",
                text: "average hashrate (optional)",
                default: ""
              }
            ]
          }
        },
        {
          value: "load",
          help: {
            description: "load overclock profile configuration",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids to be saved (comma separated)",
                default: "all"
              },
              {
                name: "profile",
                text: "profile name"
              },
              {
                name: "ref",
                text: "reference (optional)",
                default: ""
              }
            ]
          }
        }
      ]
    }
  ]
};

const engine = Engine({ aux4: config });

const args = process.argv.splice(2);
engine.run(args);
