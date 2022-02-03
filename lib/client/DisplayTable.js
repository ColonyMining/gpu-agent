const { Table, Config, parseStructure, prepareData } = require("2table");

const GPU_STATUS_TABLE_STRUCTURE =
  "index:GPU,pci:PCI,name:Name{color:cyan;width:16},utilization:Usage(gpu),power:Power[usage:Usage{color:red},limit:Limit]," +
  "temperature:Temp,fans:Fans[index:Fan,speed:Speed]," +
  "overclock:Overclock[core:Core,memory:Mem,graphics:LGC,sm:LMC]";

const GPU_CHANGELOG_STRUCTURE =
  "timestamp:Time{width:10},index:GPU,name:Name{color:cyan;width:16},power:Power(usage){color:red}," +
  "temperature:Temp;fans:Fans[index:Fan,speed:Speed]";

const PROFILES_STRUCTURE =
  "name:Profile{color:yellow},gpus:GPU[name:Name{width:16;color:cyan},tag:Tag{color:cyan},power:Power,temperature:Temp," +
  "fan:Fan,core:Core,memory:Mem,lgc:LGC,lmc:LMC,hashrate:HR{color:green}]";

const OVERCLOCK_STRUCTURE =
  "index:GPU,name:Name{color:cyan;width:16},tag:Tag{color:magenta},profile:Profile{color:yellow},settings:Settings" +
  "[param:Param{color:green},current:Current,config:Config{color:magenta}]";

function displayOverclock(data) {
  const structure = parseStructure(OVERCLOCK_STRUCTURE);

  structure.find(item => item.field === "settings").group.find(item => item.field === "current").style =
    currentSettingStyle;

  return displayTable(data, structure);
}

function displayProfiles(data) {
  const structure = parseStructure(PROFILES_STRUCTURE);
  return displayTable(data, structure);
}

function displayGpuChangelog(data) {
  const structure = parseStructure(GPU_CHANGELOG_STRUCTURE);

  structure.find(item => item.field === "temperature").style = properties => temperatureStyle;

  return displayTable(data, structure);
}

function displayGpuStatusTable(data) {
  const structure = parseStructure(GPU_STATUS_TABLE_STRUCTURE);

  structure.find(item => item.field === "utilization").style = properties => utilizationStyle;
  structure.find(item => item.field === "temperature").style = properties => temperatureStyle;

  return displayTable(data, structure);
}

function currentSettingStyle(properties, item) {
  return text => {
    if (item["config:Config"] === undefined) {
      return text.dim;
    } else if (item["current:Current"] !== item["config:Config"]) {
      return text.red;
    }
    return text;
  };
}

function utilizationStyle(text) {
  const utilization = parseInt(text.trim());
  if (utilization === 100) {
    return text.green;
  }
  return text.red;
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

module.exports = { displayGpuStatusTable, displayGpuChangelog, displayProfiles, displayOverclock };
