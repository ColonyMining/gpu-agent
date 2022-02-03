const { Engine } = require("aux4");
const Client = require("../lib/client/Client");
const Config = require("../lib/Config");
const Profile = require("../lib/Profile");

const gpuStatusReport = {
  value: "status",
  execute: Client.status,
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
};

const monitorStart = {
  value: "start",
  execute: Client.startAgent,
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
};

const currentOverclock = {
  value: "current",
  execute: Client.currentOverclock,
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
};

const setOverclock = {
  value: "set",
  execute: Client.setOverclock,
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
        name: "temperature",
        text: "GPU target temperature (optional)",
        default: ""
      },
      {
        name: "fan",
        text: "GPU fan speed [30-100] (optional)",
        default: ""
      },
      {
        name: "remove-tag",
        text: "remove GPU tag (optional)",
        default: "false"
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
};

const saveOverclock = {
  value: "save",
  execute: Client.saveOverclock,
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
};

const loadOverclock = {
  value: "load",
  execute: Client.loadOverclock,
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
};

const resetOverclock = {
  value: "reset",
  execute: Client.resetOverclock,
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
};

const listProfile = {
  value: "list",
  execute: Client.listProfile,
  help: {
    description: "list profiles",
    variables: [
      {
        name: "profile",
        text: "filter profile name (optional)",
        default: ""
      },
      {
        name: "gpu",
        text: "filter gpu (optional)",
        default: ""
      },
      {
        name: "tag",
        text: "filter tag (optional)",
        default: ""
      },
      {
        name: "display",
        text: "X display",
        default: ":0"
      }
    ]
  }
};

const removeProfile = {
  value: "remove",
  execute: Client.removeProfile,
  help: {
    description: "remove profiles",
    variables: [
      {
        name: "profile",
        text: "filter profile name (optional)",
        default: ""
      },
      {
        name: "gpu",
        text: "filter gpu (optional)",
        default: ""
      },
      {
        name: "tag",
        text: "filter tag (optional)",
        default: ""
      },
      {
        name: "display",
        text: "X display",
        default: ":0"
      }
    ]
  }
};

const config = {
  profiles: [
    {
      name: "main",
      commands: [
        gpuStatusReport,
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
      commands: [monitorStart]
    },
    {
      name: "overclock",
      commands: [currentOverclock, setOverclock, saveOverclock, loadOverclock, resetOverclock]
    },
    {
      name: "profile",
      commands: [listProfile, removeProfile]
    }
  ]
};

process.title = "gpu-agent";

const engine = Engine({ aux4: config });

const args = process.argv.splice(2);
engine.run(args);
