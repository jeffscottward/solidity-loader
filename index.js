var solc = require('solc');

module.exports = function(source) {

	this.cacheable();

	var compiledSOLfile = solc.compile(source);

	return compiledSOLfile;
}