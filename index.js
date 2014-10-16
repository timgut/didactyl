var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.home;
handle["/parncutt"] = requestHandlers.parncutt;
handle["/hart"] = requestHandlers.hart;
handle["/show"] = requestHandlers.show;

server.start(router.route, handle);