var http = require('http'),
    fs = require('fs'),
    path = require('path');

var server = http.createServer(function(req, res) {
  if (req.url === '/') {
    var index = path.join(__dirname, 'views/index.html')
    fs.readFile(index, function(err, data) {
      if (err) {
        res.writeHead(500, {'Content-type': 'text/plain'});
        res.end(err + "\n");
      } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      }
    });
  } else {
    var file = path.join(__dirname, '../public/', req.url);
    fs.exists(file, function(exists) {
      if (exists) {
        fs.readFile(file, function(err, data) {
          if (err) {
            res.writeHead(500, {'Content-type:': 'text/plain'});
            res.end(err + "\n");
          } else {
            var ext = path.extname(file);
            if (ext === '.css') {
              res.setHeader('Content-Type', 'text/css');
            } else if (ext === '.js') {
              res.setHeader('Content-Type', 'application/javascript');
            } else {
              res.setHeader('Content-Type', 'text/plain');
            }
            res.writeHead(200);
            res.end(data);
          }
        });
      } else {
        res.writeHead(404, {'Content-type:': 'text/plain'});
        res.end();
      }
    });
  }
});

module.exports = server;
