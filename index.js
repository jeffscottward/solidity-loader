var sol = require("solc"),
    path = require('path'),
    fs   = require('fs');

function findFilesInDir(startPath,filter){
    var results = [];

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            results = results.concat(findFilesInDir(filename,filter)); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            console.log('-- found: ',filename);
            results.push(filename);
        }
    }
    return results;
}

module.exports = function(source) {
  var files = findFilesInDir(this.context, '.sol'),
      sourceMap = {},
      self = this,
      exportJS = false;

  this.cacheable();

  if(typeof this.query !== 'undefined') {
    var queryString = {};
    this.query.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) { queryString[$1] = $3; }
    );

    if(queryString.export && queryString.export === 'false')
      exportJS = false;

    if(queryString.export && queryString.export === 'true')
      exportJS = true;
  }

  files.forEach(function(filePath, index){
    var fileName = filePath.split("/").pop();

    sourceMap[fileName] = fs.readFileSync(filePath, 'utf8');
    self.addDependency(filePath);
  });

  var compiled = sol.compile({sources: sourceMap}, 1);

  if(exportJS) {
    var fileString = "module.exports = {'contracts': " + JSON.stringify(compiled.contracts) + ", ";
    fileString += "'sources': " + JSON.stringify(compiled.sources) + ", ";

    Object.keys(compiled.contracts).forEach(function(contractName){
      fileString += "'" + contractName + "': (typeof web3 !== 'undefined' ? web3.eth.contract(" + compiled.contracts[contractName].interface + ") : {}),";
    });

    fileString = fileString.replace(/,\s*$/, "") + "}; ";

    return fileString;
  }else{
    return compiled;
  }
}
