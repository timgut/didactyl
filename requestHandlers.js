//var exec = require("child_process").exec;

var py = require('python-shell');

var querystring = require("querystring"), 
	fs = require("fs"),
	formidable = require("formidable"),
	sys = require('sys');

function home(response, postData) {
	console.log("Request handler 'home' was called");
	
	var body = "<html>" +
	"<head>" +
	"<meta http-equiv='Context-Type' content='text/html'; 'charset=UTF-8' />"  +
	"</head>" +
	"<body>" + 
	"<form action='/hart' method='POST' enctype='multipart/form-data'>" +
	"<input type='file' name='upload' multiple='multiple'>" +
	"<input type='submit' value='Upload!' />" +
	"</form>" +
	"</body>" +
	"</html>"
	
	response.writeHead(200, {"Content-Type":"text/html"});
	response.write(body);
	response.end();
	
}

function parncutt(response, request) {
	
	var options = {
	  mode: 'text',
	  //pythonPath: 'path/to/python',
	  //pythonOptions: ['-u'],
	  scriptPath: 'dd/dactyler',
	  //args: ['value1', 'value2', 'value3']
	};
	
	console.log("Request handler 'parncutt' was called.");
	var form = new formidable.IncomingForm();
	//console.log("about to parse...");
	form.parse(request, function(error, fields, files) {
		//console.log("parsing done");
		fs.rename(files.upload.path, "/tmp/parncutt.txt", function(error) {
			if (error) {
				fs.unlink("/tmp/parncutt.txt");
				fs.rename(files.upload.path, "/tmp/parncutt.txt");
			}
		});
		py.run('parncutt.py', options, function (err) {
			console.log("opening parncutt.py...");
			if (err) throw err;
			console.log('finished');
		});
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(sys.inspect({fields: fields, files: files}));
		//fs.createReadStream("/tmp/submission.txt").pipe(response);
		//response.end();
	});
	
}

function hart(response, request) {
	
	var options = {
	  mode: 'text',
	  //pythonPath: 'path/to/python',
	  //pythonOptions: ['-u'],
	  scriptPath: 'dd/dactyler',
	  //args: ['value1', 'value2', 'value3']
	};
	
	console.log("Request handler 'hart' was called.");
	var form = new formidable.IncomingForm();
	//console.log("about to parse...");
	form.parse(request, function(error, fields, files) {
		//console.log("parsing done");
		fs.rename(files.upload.path, "/tmp/hart.txt", function(error) {
			if (error) {
				fs.unlink("/tmp/hart.txt");
				fs.rename(files.upload.path, "/tmp/hart.txt");
			}
		});
		py.run('hart.py', options, function (err) {
			console.log("opening hart.py...");
			if (err) throw err;
			console.log('finished');
		});
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(sys.inspect({fields: fields, files: files}));
		//fs.createReadStream("/tmp/submission.txt").pipe(response);
		//response.end();
	});
	
}

function show(response) {
	console.log("Request handler 'show' was called.");
	response.writeHead(200, {'Content-Type':'text/plain'});
	fs.createReadStream("/tmp/parncutt.txt").pipe(response);
}

exports.home = home;
exports.parncutt = parncutt;
exports.hart = hart;
exports.show = show;