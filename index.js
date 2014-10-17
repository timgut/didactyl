var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.home;
handle["/fingering"] = requestHandlers.fingering;
handle["/parncutt"] = requestHandlers.parncutt;
handle["/hart"] = requestHandlers.hart;

server.start(router.route, handle);