// Required Modules
var sol = require("solc"),
    path = require('path'),
    fs   = require('fs');

// Function that finds files in directory
function findFilesInDir(startPath,filter){

  // Results storage
  var results = [];

  // If the folder doesn't exist, exit
  if (!fs.existsSync(startPath)){
    console.log("no dir ", startPath);
    return;
  }

  // All the files in the directory
  var files = fs.readdirSync(startPath);

  // Go through all the files
  for(var i=0;i<files.length;i++){

    // The current item name in the loop
    var filename = path.join(startPath,files[i]);

    // Get stats on the item
    var stat = fs.lstatSync(filename);

    // If the current item is a directory
    if (stat.isDirectory()){

      // Recurse down through this directory and add the files
      results = results.concat(findFilesInDir(filename, filter));
    } else {

      // If the current item is a file
      if (filename.indexOf(filter) >= 0) {
        console.log('-- found: ',filename);
        results.push(filename);
      }
    }
  }

  return results;
}

// Main exportable logic
module.exports = function(source) {

  // Basic setup
  var files     = findFilesInDir(this.context, '.sol'),
      sourceMap = {},
      self      = this,
      exportJS  = false;

  // Webpack caching for hot module reloading
  this.cacheable();

  // If there is a query attached in the webpack config
  if (typeof this.query !== "undefined") {

    // Setup for queryString
    var queryString = {};

    // Populate the regex rules that apply
    this.query.replace(
      new RegExp("([^?=&]+)(=([^&]*))?", "g"),
      function($0, $1, $2, $3) { queryString[$1] = $3; }
    );

    // Set exporting if based on query string
    if(queryString.export && queryString.export === 'false') { exportJS = false; }
    if(queryString.export && queryString.export === 'true' ) { exportJS = true;  }
  }

  // For each file in the source directory
  files.forEach(function(filePath, index){

    // Strip out the filename
    var fileName = filePath.split("/").pop();

    // Add to a container for source maps
    sourceMap[fileName] = fs.readFileSync(filePath, 'utf8');

    // Webpack - add dependecy
    self.addDependency(filePath);
  });

  // Compiled contracts in one object
  var compiled = sol.compile({sources: sourceMap}, 1);

  // If there is a query present then we are exporting
  if (exportJS) {

    // Set the file string and sources as specificied by solidity compiler
    var fileString = "module.exports = {'contracts': " + JSON.stringify(compiled.contracts) + ", ";
    fileString    += "'sources': " + JSON.stringify(compiled.sources) + ", ";

    // Sifts through the compiled contracts and makes web3.eth.contracts out of them
    // Ether-Pudding normally does this for you but we can do it here too
    Object.keys(compiled.contracts)
          .forEach(function(contractName){
            fileString += "'" +
            contractName + "': " +
            '(typeof web3 !== "undefined" ? web3.eth.contract(' +
            compiled.contracts[contractName].interface +") : {}),";
          });

    // Cleans up spaces for conciseness
    fileString = fileString.replace(/,\s*$/, "") + "}; ";

    return fileString;
  } else {

    return compiled;
  }
}
