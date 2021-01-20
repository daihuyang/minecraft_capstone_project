var static = require('node-static');

// create node-static server to serve the './public' directory
var file = new static.Server('.');

require('http').createServer(function (request, response) {
	request.addListener('end', function () {
		// serve files
		file.serve(request, response);
	}).resume();
}).listen(3000);
