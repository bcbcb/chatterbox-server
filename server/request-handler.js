var checksum = require('json-checksum');
var fs = require('fs');
var _ = require('underscore');
var parseQueryString = require('url').parse;
/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  //console.log("Serving request type " + request.method + " for url " + request.url);
  // console.log(checksum(JSON.stringify('OMAR')));
  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;
  var data = {results: []};
  // The outgoing status.
  var statusCode;
  var acRequestMethod = request.headers['access-control-request-method'];

  var url = parseQueryString(request.url, true);

  if (request.method === 'GET' || acRequestMethod === 'GET') {
    if (db.hasOwnProperty(url.pathname)) {
      statusCode = 200;
      data.results = db[url.pathname].ordered.slice();

      if (url.query.order === '-createdAt') {
        data.results.reverse();
      }

    } else {
      statusCode = 404;
    }
  } else if (request.method === 'POST' || acRequestMethod === 'POST') {
    if (db.hasOwnProperty(url.pathname)) {
      request.on('data', function(data){

        var receivedMessage = JSON.parse(data) ;
        receivedMessage.createdAt = new Date().toISOString();
        receivedMessage.objectId = checksum(receivedMessage);

        db[url.pathname].ordered.push(receivedMessage);
        db[url.pathname][receivedMessage.objectId] = receivedMessage;

        fs.writeFile('db.json', JSON.stringify(db), function(err) {
          if (err) {
            throw err;
          } else {
            console.log('Saved POST to db...');
          }
        });
      });
      statusCode = 201;
    } else {
      statusCode = 403;
    }
  }

  // console.log('Request Method', request.method,'StatusCode', statusCode);
  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = "application/json";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end(JSON.stringify(data));
};

var db = {
  "/classes/messages": {'ordered': []}
};

fs.readFile('db.json', function(err, data){
  if(err) {
    console.log('Error Message', err);
    console.log('Creating new db file...');
  } else {
    db = JSON.parse(data);
  }
});

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
