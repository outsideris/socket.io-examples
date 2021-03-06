module.exports = function(server) {
  var io = require('socket.io')(server, {
    transports: ['polling', 'websocket'],
    allowUpgrades: true
  });

  // Simple Example
  io.on('connection', function(socket) {
    socket.on('message', function(msg) {
      socket.broadcast.send(msg);
    });
    socket.on('disconnect', function() {
      socket.broadcast.send('disconnected');
    });
  });

  // Namespace Example
  var namespace = io
    .of('/namespace')
    .on('connection', function(socket) {
      socket.on('message', function(data) {
        socket.broadcast.send(data);
      });
      socket.on('disconnect', function() {
        socket.broadcast.send('disconnected');
      });
    });

  // Custom Example
  var custom = io
    .of('/custom')
    .on('connection', function(socket) {
      socket.on('fromclient', function(data) {
        socket.broadcast.emit('fromserver', data);
      });
      socket.on('disconnect', function() {
        socket.broadcast.emit('fromserver', 'disconnected');
      });
    });

  // Volatile Example
  var volatile = io
    .of('/volatile')
    .on('connection', function(socket) {
      var vola = setInterval(function () {
        socket.volatile.emit('current time', 'current time : ' + new Date());
      }, 2000);

      socket.on('disconnect', function () {
        clearInterval(vola);
        socket.volatile.emit('current time', 'disconnected');
      });
    });

  // room Example
  var Room = io
    .of('/room')
    .on('connection', function(socket) {
      var joinedRoom = null;
      socket.on('join room', function(data) {
        if (!!joinedRoom) {
          socket.leave(joinedRoom);
          socket.emit('joined', 'you\'ve left from ' + joinedRoom);
          socket.broadcast.to(joinedRoom).send('someone left this room.');
          joinedRoom = null;
        }
        socket.join(data);
        joinedRoom = data;
        socket.emit('joined', 'you\'ve joined to ' + data);
        socket.broadcast.to(joinedRoom).send('someone joined room.');
      });
      socket.on('fromclient', function(data) {
        if (joinedRoom) {
          socket.broadcast.to(joinedRoom).send(data);
        } else {
          socket.send('you\'re not joined a room. select a room and then push join.');
        }
      });
    });
}
