var solc = require('solc');

module.exports = function(source) {  
	
	this.cacheable(); 

	return solc.compile(source); 
}