module.exports = function(io) {
  //io.configure(function(){
  //  io.enable('browser client etag');
  //  io.set('log level', 1);
  //  io.set('transports', [
  //    'websocket',
  //    'flashsocket',
  //    'htmlfile',
  //    'xhr-polling',
  //    'jsonp-polling'
  //  ]);
  //});

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
}
