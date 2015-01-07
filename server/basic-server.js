/* Import node's http module: */
var http = require("http");
var parseUrl = require("url").parse;
var fs = require("fs");
var mime = require("mime");

var handleRequest = require("./request-handler").requestHandler;
var sendReponse = require("./response-handler");

var port = 3000;
var ip = "127.0.0.1";

var routes = {
  "/classes/messages": function(request, response) {
    handleRequest(request, response);
  }
};

var serveFile = function(response, path) {
  fs.exists(path, function(exists) {

    if (exists) {
      fs.readFile(path, function (err, data) {
        if (err) throw err;
        sendReponse(response, data, 200, mime.lookup(path));
      });

    } else {
      console.log("File doesn't exist.");
      sendReponse(response, "<h1>Not found!</h1>", 404, "text/html");
    }

  });
};

var server = http.createServer(function(request, response) {

  var route = parseUrl(request.url).pathname;

  if (routes.hasOwnProperty(route)) {
    routes[route](request, response);
  } else {

    if (route === "/") {
      route = "/index.html";
    }

    route = "client" + route;
    serveFile(response, route);
  }

});
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);
