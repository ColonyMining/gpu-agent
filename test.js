async function test() {
  return new Promise((resolve, reject) => {
    resolve("cool");
  });
}

function sync() {
  let output;
  Promise.all([test()]);
  return output;
}

console.log("a");
console.log(sync());
console.log("b");
