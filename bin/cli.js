const { Engine } = require("aux4");
const Agent = require("./agent");
const Config = require("aux4/lib/Config");

const config = {
  profiles: [
    {
      name: "main",
      commands: [
        {
          value: "config",
          execute: ["profile:config"],
          help: {
            description: "configure GPU agent"
          }
        },
        {
          value: "start",
          execute: params => Agent.start(params.gpus),
          help: {
            description: "start GPU agent"
          }
        }
      ]
    },
    {
      name: "config",
      commands: [
        {
          value: "save",
          execute: () => Config.save(),
          help: {
            description: "save current configuration",
            variables: [
              {
                name: "gpus",
                text: "list of GPUs ids to be saved",
                default: "all"
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
