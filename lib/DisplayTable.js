const { Table, Config, parseStructure, prepareData } = require("2table");

const GPU_STATUS_TABLE_STRUCTURE =
  "index:GPU,pci:PCI,name:Name{color:cyan;width:16},utilization:Usage(gpu),power:Power[usage:Usage{color:red},limit:Limit]," +
  "temperature:Temp,fans:Fans[index:Fan,speed:Speed]," +
  "overclock:Overclock[core:Core,memory:Mem,graphics:LGC,sm:LMC]";

const GPU_CHANGELOG_STRUCTURE =
  "timestamp:Time{width:10},index:GPU,name:Name{color:cyan;width:16},power:Power(usage){color:red}," +
  "temperature:Temp;fans:Fans[index:Fan,speed:Speed]";

function displayGpuChangelog(data) {
  const structure = parseStructure(GPU_CHANGELOG_STRUCTURE);

  structure.find(item => item.field === "temperature").style = properties => temperatureStyle;

  return displayTable(data, structure);
}

function displayGpuStatusTable(data) {
  const structure = parseStructure(GPU_STATUS_TABLE_STRUCTURE);

  structure.find(item => item.field === "utilization").style = properties => text => {
    const utilization = parseInt(text.trim());
    if (utilization === 100) {
      return text.green;
    } else {
      return text.red;
    }
  };

  structure.find(item => item.field === "temperature").style = properties => temperatureStyle;

  return displayTable(data, structure);
}

function temperatureStyle(text) {
  const temperature = parseInt(text.trim());
  if (temperature < 70) {
    return text.green;
  } else if (temperature >= 70 && temperature < 80) {
    return text.yellow;
  } else {
    return text.red;
  }
}

function displayTable(data, structure) {
  const config = new Config(structure);
  const tableData = prepareData(data, structure, config);
  const table = new Table(tableData, structure, config);
  return table.print();
}

module.exports = { displayGpuStatusTable, displayGpuChangelog };
