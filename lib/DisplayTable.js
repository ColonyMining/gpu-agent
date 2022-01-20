const { Table, Config, parseStructure } = require("2table");

function displayTable(data, tableStructure) {
  const config = new Config();
  const structure = parseStructure(tableStructure);

  const table = new Table(data, structure, config);
  return table.print();
}

module.exports = { displayTable };
