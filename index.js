var solc = require('solc');

module.exports = function(source) {

	// console.log(source);

	this.cacheable();

	var compiledSOLfile = solc.compile(source, 1);

	// console.log(compiledSOLfile);

	return compiledSOLfile;
}