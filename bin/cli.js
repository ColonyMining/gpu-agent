const { Engine } = require("aux4");
const Client = require("../lib/client/Client");

const VARIABLES = {
  GPUS: {
    name: "gpus",
    text: "list of GPUs ids (comma separated)",
    default: "all"
  },
  TAG: {
    name: "tag",
    text: "tag (optional)",
    default: ""
  },
  REMOVE_TAG: {
    name: "remove-tag",
    text: "remove GPU tag (optional)",
    default: "false"
  },
  POWER: {
    name: "power",
    text: "GPU power limit (optional)",
    default: ""
  },
  CORE: {
    name: "core",
    text: "GPU graphics clock offset (optional)",
    default: ""
  },
  MEMORY: {
    name: "memory",
    text: "GPU memory transfer rate offset (optional)",
    default: ""
  },
  LGC: {
    name: "lgc",
    text: "GPU lock graphics clock (optional)",
    default: ""
  },
  LMC: {
    name: "lmc",
    text: "GPU lock memory clock (optional)",
    default: ""
  },
  FAN: {
    name: "fan",
    text: "GPU fan speed [30-100] (optional)",
    default: ""
  },
  FILTER_BY_PROFILE: {
    name: "profile",
    text: "filter profile name (optional)",
    default: ""
  },
  FILTER_BY_GPU: {
    name: "gpu",
    text: "filter gpu (optional)",
    default: ""
  },
  FILTER_BY_TAG: {
    name: "tag",
    text: "filter tag (optional)",
    default: ""
  },
  HASHRATE: {
    name: "hr",
    text: "average hashrate (optional)",
    default: ""
  },
  VERBOSE: {
    name: "verbose",
    text: "display additional details",
    default: "false"
  },
  SILENT: {
    name: "silent",
    text: "does not output change report",
    default: "false"
  },
  DISPLAY: {
    name: "display",
    text: "X display",
    default: ":0"
  },
  INTERVAL: {
    name: "interval",
    text: "GPU check interval in seconds",
    default: "60"
  },
  TEMPERATURE: {
    name: "temperature",
    text: "GPU target temperature"
  },
  WATCH: {
    name: "watch",
    text: "watch mode",
    default: "false"
  }
};

const GPU_STATUS_REPORT = {
  value: "status",
  execute: Client.status,
  help: {
    description: "display the status of GPUs",
    variables: [VARIABLES.GPUS, VARIABLES.WATCH, VARIABLES.INTERVAL, VARIABLES.DISPLAY]
  }
};

const MONITOR_START = {
  value: "start",
  execute: Client.startAgent,
  help: {
    description: "start GPU agent",
    variables: [VARIABLES.INTERVAL, VARIABLES.TEMPERATURE, VARIABLES.SILENT, VARIABLES.DISPLAY]
  }
};

const CURRENT_OVERCLOCK = {
  value: "current",
  execute: Client.currentOverclock,
  help: {
    description: "display current overclock settings",
    variables: [VARIABLES.GPUS, VARIABLES.DISPLAY]
  }
};

const SET_OVERCLOCK = {
  value: "set",
  execute: Client.setOverclock,
  help: {
    description: "set overclock to GPU",
    variables: [
      VARIABLES.GPUS,
      VARIABLES.TAG,
      VARIABLES.POWER,
      VARIABLES.CORE,
      VARIABLES.MEMORY,
      VARIABLES.LGC,
      VARIABLES.LMC,
      VARIABLES.TEMPERATURE,
      VARIABLES.FAN,
      VARIABLES.REMOVE_TAG,
      VARIABLES.VERBOSE,
      VARIABLES.DISPLAY
    ]
  }
};

const SAVE_OVERCLOCK = {
  value: "save",
  execute: Client.saveOverclock,
  help: {
    description: "save overclock profile configuration",
    variables: [VARIABLES.GPUS, VARIABLES.FILTER_BY_PROFILE, VARIABLES.HASHRATE, VARIABLES.DISPLAY]
  }
};

const LOAD_OVERCLOCK = {
  value: "load",
  execute: Client.loadOverclock,
  help: {
    description: "load overclock profile configuration",
    variables: [VARIABLES.GPUS, VARIABLES.FILTER_BY_PROFILE, VARIABLES.VERBOSE, VARIABLES.DISPLAY]
  }
};

const RESET_OVERCLOCK = {
  value: "reset",
  execute: Client.resetOverclock,
  help: {
    description: "reset GPU overclock",
    variables: [VARIABLES.GPUS, VARIABLES.VERBOSE, VARIABLES.DISPLAY]
  }
};

const LIST_PROFILE = {
  value: "list",
  execute: Client.listProfile,
  help: {
    description: "list profiles",
    variables: [VARIABLES.FILTER_BY_PROFILE, VARIABLES.FILTER_BY_GPU, VARIABLES.FILTER_BY_TAG, VARIABLES.DISPLAY]
  }
};

const REMOVE_PROFILE = {
  value: "remove",
  execute: Client.removeProfile,
  help: {
    description: "remove profiles",
    variables: [VARIABLES.FILTER_BY_PROFILE, VARIABLES.FILTER_BY_GPU, VARIABLES.FILTER_BY_TAG, VARIABLES.DISPLAY]
  }
};

const config = {
  profiles: [
    {
      name: "main",
      commands: [
        GPU_STATUS_REPORT,
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
      commands: [MONITOR_START]
    },
    {
      name: "overclock",
      commands: [CURRENT_OVERCLOCK, SET_OVERCLOCK, SAVE_OVERCLOCK, LOAD_OVERCLOCK, RESET_OVERCLOCK]
    },
    {
      name: "profile",
      commands: [LIST_PROFILE, REMOVE_PROFILE]
    }
  ]
};

process.title = "gpu-agent";

const engine = Engine({ aux4: config });

const args = process.argv.splice(2);
engine.run(args);
