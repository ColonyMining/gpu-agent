const readline = require("readline");

const Prompt = {
  input: function (question, callback) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${question} `, answer => callback(answer).then(() => rl.close()));
  }
};

module.exports = Prompt;
