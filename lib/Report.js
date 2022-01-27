const Report = {
  print: function (report, options = {}) {
    if (options.clear) {
      console.clear();
    }
    if (options.title) {
      console.log(options.title);
    }
    if (report) {
      console.log(report);
    }
    console.log(copyright());
  }
};

function copyright() {
  const year = new Date().getFullYear();
  return `\n\nhttps://colonymining.com © ${year} Colony Mining Inc.\n`;
}

module.exports = Report;
