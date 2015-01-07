var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
};

module.exports = function(response, data, statusCode, contentType) {
  headers["Content-Type"] = contentType || "application/json";
  response.writeHead(statusCode, headers);
  response.end(data);
};
