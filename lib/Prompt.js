const readline = require("readline");

const Prompt = {
  input: function (question, callback) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${question} `, function (answer) {
      callback(answer);
      rl.close();
    });
  }
};

module.exports = Prompt;
