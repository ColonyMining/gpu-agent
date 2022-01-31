const childProcess = require("child_process");
const fs = require("fs");
const { v4: uuid } = require("uuid");

const tmpFile = `/tmp/${uuid()}.out`;
const stream = fs.createWriteStream(tmpFile);

stream.on("open", () => {
  childProcess.execSync("nvidia-settings -c :0 -q gpus", { stdio: [stream, stream, stream] });
});

response = fs.readFileSync(tmpFile).toString("utf-8");

console.log(response);
