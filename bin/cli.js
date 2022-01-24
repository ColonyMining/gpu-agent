const { Engine } = require("aux4");
const Agent = require("../lib/Agent");
const { Config } = require("../lib/Config");
const { displayGpuStatus } = require("../lib/StatusReport");
const Setting = require("../lib/Setting");

const config = {
  profiles: [
    {
      name: "main",
      commands: [
        {
          value: "status",
          execute: params => displayGpuStatus(params),
          help: {
            description: "display the status of GPUs",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids to be saved (comma separated)",
                default: "all"
              }
            ]
          }
        },
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
          value: "current",
          help: {
            description: "display current overclock settings"
          }
        },
        {
          value: "set",
          execute: params =>
            Setting.setOverclock(
              params.gpus,
              {
                power: params.power,
                core: params.core,
                memory: params.memory,
                lgc: params.lgc,
                lmc: params.lmc,
                fan: params.fan
              },
              params.display
            ),
          help: {
            description: "set overclock to GPU",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids to be saved (comma separated)",
                default: "all"
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
                name: "lgc",
                text: "GPU lock graphics clock (optional)",
                default: ""
              },
              {
                name: "lmc",
                text: "GPU lock memory clock (optional)",
                default: ""
              },
              {
                name: "fan",
                text: "GPU fan speed [30-100] (optional)",
                default: ""
              },
              {
                name: "display",
                text: "X display",
                default: ":0"
              }
            ]
          }
        },
        {
          value: "save",
          execute: params => Config.save(params.gpus, params.profile, params.ref, params.hr),
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
          execute: params => Config.apply(params.gpus, params.profile, params.ref, params.display),
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
              },
              {
                name: "display",
                text: "X display",
                default: ":0"
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
