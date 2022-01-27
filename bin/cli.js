const { Engine } = require("aux4");
const Agent = require("../lib/Agent");
const Config = require("../lib/Config");
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
          execute: params => displayGpuStatus(params.gpus, params.watch, params.display),
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
      name: "overclock",
      commands: [
        {
          value: "current",
          execute: params => new Setting(params.display).getOverclockSettings(params.gpus),
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
            new Setting(params.display).setOverclock(
              params.gpus,
              {
                tag: params.tag,
                power: toInt(params.power),
                core: toInt(params.core),
                memory: toInt(params.memory),
                lgc: toInt(params.lgc),
                lmc: toInt(params.lmc),
                fan: toInt(params.fan)
              },
              params.verbose
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
                name: "tag",
                text: "tag (optional)",
                default: ""
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
          execute: params => new Config(params.display).save(params.gpus, params.profile, params.tag, params.hr),
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
                name: "tag",
                text: "tag (optional)",
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
            new Config(params.display).apply(params.gpus, params.profile, params.tag, params.verbose === "true"),
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
                name: "tag",
                text: "tag (optional)",
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
          execute: params => new Setting(params.display).resetOverclock(params.gpus, params.verbose === "true"),
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
          execute: params => Profile.list(params.display),
          help: {
            description: "list profiles",
            variables: [
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

function toInt(value) {
  if (value === undefined) {
    return undefined;
  }
  return parseInt(value);
}

process.title = "gpu-agent";

const engine = Engine({ aux4: config });

const args = process.argv.splice(2);
engine.run(args);
