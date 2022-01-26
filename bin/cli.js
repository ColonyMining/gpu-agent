const { Engine } = require("aux4");
const Agent = require("../lib/Agent");
const { Config } = require("../lib/Config");
const { displayGpuStatus } = require("../lib/StatusReport");
const Setting = require("../lib/Setting");
const Profile = require("../lib/Profile");

const config = {
  profiles: [
    {
      name: "main",
      commands: [
        {
          value: "status",
          execute: params => displayGpuStatus(params.gpus, params.watch),
          help: {
            description: "display the status of GPUs",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids (comma separated)",
                default: "all"
              },
              {
                name: "watch",
                text: "watch mode",
                default: "false"
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
        },
        {
          value: "profile",
          execute: ["profile:profile"],
          help: {
            description: "GPU profiles"
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
          execute: params => Setting.getOverclockSettings(params.gpus, params.display),
          help: {
            description: "display current overclock settings",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids (comma separated)",
                default: "all"
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
              params.verbose,
              params.display
            ),
          help: {
            description: "set overclock to GPU",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids (comma separated)",
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
                name: "verbose",
                text: "display additional details",
                default: "false"
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
          execute: params => Config.save(params.gpus, params.profile, params.ref, params.hr, params.display),
          help: {
            description: "save overclock profile configuration",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids (comma separated)",
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
          value: "load",
          execute: params =>
            Config.apply(params.gpus, params.profile, params.ref, params.verbose === "true", params.display),
          help: {
            description: "load overclock profile configuration",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids (comma separated)",
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
                name: "verbose",
                text: "display additional details",
                default: "false"
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
          value: "reset",
          execute: params => Setting.resetOverclock(params.gpus, params.verbose === "true", params.display),
          help: {
            description: "reset GPU overclock",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids (comma separated)",
                default: "all"
              },
              {
                name: "verbose",
                text: "display additional details",
                default: "false"
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
    },
    {
      name: "profile",
      commands: [
        {
          value: "list",
          execute: () => Profile.list(),
          help: {
            description: "list profiles"
          }
        }
      ]
    }
  ]
};

process.title = "gpu-agent";

const engine = Engine({ aux4: config });

const args = process.argv.splice(2);
engine.run(args);
