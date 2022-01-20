const { Table, Config, parseStructure, prepareData } = require("2table");

function displayTable(data, tableStructure) {
  const config = new Config();
  const structure = parseStructure(tableStructure);
  const tableData = prepareData(data);
  const table = new Table(tableData, structure, config);
  return table.print();
}

module.exports = { displayTable };
