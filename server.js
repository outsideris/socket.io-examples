
/**
 * Module dependencies.
 */

var express = require('express')
  , sys = require('sys');

var app = module.exports = express.createServer()
  , io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.listen(3000);

io.configure(function(){
  io.enable('browser client etag');
  io.set('log level', 1);
  io.set('transports', [
     'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
  ]);
});

// Simple Example
var simple = io
  .sockets
  .on('connection', function(socket) {
  	socket.on('message', function(data) {
  		socket.broadcast.send(data);
  	});
  	socket.on('disconnect', function() {
  	  // handle disconnect
  	});
  });

// Namespace Example
var namespace = io
  .of('/namespace')
  .on('connection', function(socket) {
    socket.on('message', function(data) {
      socket.broadcast.send(data);
    }); 
  });

// Custom Example
var custom = io
  .of('/custom')
  .on('connection', function(socket) {
    socket.on('fromclient', function(data) {
      socket.broadcast.emit('fromserver', data);
    }); 
  });

// Volatile Example
var volatile = io
  .of('/volatile')
  .on('connection', function(socket) {
    socket.on('fromclient', function(data) {
      socket.broadcast.emit('fromserver', data);
    }); 
    
    var vola = setInterval(function () {
      socket.volatile.emit('current time', 'current time : ' + new Date());
    }, 1000);
  
    socket.on('disconnect', function () {
      clearInterval(vola);
    });
  });

// room Example
var Room = io
  .of('/room')
  .on('connection', function(socket) {
    var joinedRoom = null;
    socket.on('join room', function(data) {
      socket.join(data);
      joinedRoom = data;
      socket.emit('joined', 'you\'ve joined ' + data);
      socket.broadcast.to(joinedRoom).send('someone joined room');
    }); 
    socket.on('fromclient', function(data) {
      if (joinedRoom) {
        socket.broadcast.to(joinedRoom).send(data);
      } else {
        socket.send('you\'re not joined a room. select a room and then push join.');
      }
    });
  });

// JSON Parse Example
var json = io
  .of('/json')
  .on('connection', function(socket) {
  	socket.on('message', function(data) {
  		socket.json.broadcast.send({text:data});
  	});
  	socket.on('disconnect', function() {
  	  // handle disconnect
  	});
  });


console.log("Express server listening on port %d", app.address().port);
