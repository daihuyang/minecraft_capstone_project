var static = require('node-static');
var file = new static.Server('.');

require('http').createServer(function (request, response) {
	request.addListener('end', function () {
		// serve files
		file.serve(request, response);
	}).resume();
}).listen(3000);
