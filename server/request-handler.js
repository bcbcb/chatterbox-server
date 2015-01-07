var checksum = require("json-checksum");
var fs = require("fs");
var _ = require("underscore");
var parseQueryString = require("url").parse;
var sendResponse = require("./response-handler");
var db;

fs.readFile("db.json", function(err, data){
  if(err) {
    console.log("Error Message", err);
    console.log("Creating new db.");
    db = {
      "ordered": []
    };
  } else {
    db = JSON.parse(data);
  }
});

var storeDb = function(db, receivedMessage) {
  receivedMessage.createdAt = new Date().toISOString();
  receivedMessage.objectId = checksum(receivedMessage);

  db.ordered.push(receivedMessage);
  db[receivedMessage.objectId] = receivedMessage;

  fs.writeFile("db.json", JSON.stringify(db), function(err) {
    if (err) {
      throw err;
    } else {
      console.log("Saved POST to db...");
    }
  });
};

var actions = {
  "GET": function(request, response, query) {

    var data = {results: []};
    data.results = db.ordered.slice();
    if (query.order === "-createdAt") {
      data.results.reverse();
    }

    sendResponse(response, JSON.stringify(data), 200);
  },

  "POST": function(request, response, query) {
    request.on("data", function(data){
      var receivedMessage = JSON.parse(data) ;

      storeDb(db, receivedMessage);

      sendResponse(response, receivedMessage.objectId, 201);
    });
  },

  "OPTIONS": function(request, response, query) {
    sendResponse(response, "", 200);
  }
};

exports.requestHandler = function(request, response) {

  // console.log("Serving request type " + request.method + " for url " + request.url);

  var query = parseQueryString(request.url, true).query;

  var action = actions[request.method];
  if (action) {
    action(request, response, query);
  } else {
    sendResponse(response, "", 403);
  }
};


