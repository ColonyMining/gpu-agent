const { Table, Config, parseStructure, prepareData } = require("2table");

function displayTable(data, tableStructure) {
  const structure = parseStructure(tableStructure);
  const config = new Config(structure);
  const tableData = prepareData(data);
  const table = new Table(tableData, structure, config);
  return table.print();
}

module.exports = { displayTable };
