//var exec = require("child_process").exec;

var py = require('python-shell');

var querystring = require("querystring"), 
	fs = require("fs"),
	formidable = require("formidable"),
	sys = require('sys');

function home(response, postData) {
	console.log("Request handler 'home' was called");
	
	var body = "<html>\n" +
	"<head>\n" +
	"<meta http-equiv='Context-Type' content='text/html'; 'charset=UTF-8' />\n"  +
	"</head>\n" +
	"<body>\n" + 
	"<p>Please upload your .abc file and select the fingering method from the dropdown.</p>\n" + 
	"<form action='/fingering' method='POST' enctype='multipart/form-data'>\n" +
	"\t<select name='f'><option value=''>Choose a fingering below</option>\n" +
	"\t\t<option value='hart'>Hart</option>\n" +
	"\t\t<option value='parncutt'>Parncutt</option>\n" +
	"\t</select><br/>\n" +
	"\t<p><input type='file' name='upload' multiple='multiple'></p>\n" +
	"\t<p><input type='submit' value='Upload!' /></p>\n" +
	"</form>\n" +
	"</body>\n" +
	"</html>"
	
	response.writeHead(200, {"Content-Type":"text/html"});
	response.write(body);
	response.end();
	
}

function fingering(response, request) {
	
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files) {
		if (fields['f'] == 'hart') {
			fs.rename(files.upload.path, "/tmp/hart.abc", function(error) {
				if (error) {
					fs.unlink("/tmp/hart.abc");
					fs.rename(files.upload.path, "/tmp/hart.abc");
				}			
			});		
			// delegate to proper method
			hart(response, request);
			
		}
		else if (fields['f'] == 'parncutt') {
			fs.rename(files.upload.path, "/tmp/parncutt.abc", function(error) {
				if (error) {
					fs.unlink("/tmp/parncutt.abc");
					fs.rename(files.upload.path, "/tmp/parncutt.abc");
				}
			});	
			// delegate to proper method
			parncutt(response, request);	
		}	
	});
}


function parncutt(response, request) {
	
	var options = {
	  mode: 'text',
	  scriptPath: 'dd/dactyler',
	  args: ['parncutt.abc']
	};
	
	py.run('parncutt.py', options, function (err, results) {
		console.log("opening parncutt.py...");
		if (err) throw err;
		var r = String(results);
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(r);
		response.end();
	});	
}

function hart(response, request) {
	
	var options = {
	  mode: 'text',
	  scriptPath: 'dd/dactyler',
	  args: ['hart.abc']
	};
	
	py.run('hart.py', options, function (err, results) {
		console.log("opening hart.py...");
		if (err) throw err;
		console.log("Dave, what is this? " + results[0]);
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<p>The optimal cost is <strong>" + results[1] + "</strong>.</p>\n");
		response.write("<p>The optimal fingering is:<br/>\n:");
		response.write(String(results[2]));
		response.end();
	});		
}


exports.home = home;
exports.parncutt = parncutt;
exports.hart = hart;
exports.fingering = fingering;