var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.home;
handle["/route_post"] = requestHandlers.route_post;
handle["/parncutt"] = requestHandlers.parncutt;
handle["/hart"] = requestHandlers.hart;

server.start(router.route, handle);