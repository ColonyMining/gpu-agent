const childProcess = require("child_process");
const fs = require("fs");
const { createWriteStream } = require("fs-stream-sync");
const { v4: uuid } = require("uuid");

const tmpFile = `/tmp/${uuid()}.out`;
const stream = createWriteStream(tmpFile);

stream.on("open", () => {
  childProcess.execSync("nvidia-settings -c :0 -q gpus", { stdio: [stream, stream, stream] });
});

response = fs.readFileSync(tmpFile).toString("utf-8");

console.log(response);
