'use strict';
let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let sockets;


app.get('/', ((req, res) => {
  if(req.headers.accept != 'application/json') { return res.sendStatus(400) };

  // Data
  let data = JSON.parse(req.query.data);
  if (data === undefined) { return res.sendStatus(400) }

  // Room
  let user_room = data.room;
  if (user_room === undefined) { return res.sendStatus(400) }

  // Event
  let event = data.event;
  if (event === undefined) { return res.sendStatus(400) }

  // Custom Data
  let custom = data.custom;
  if (custom === undefined) { return res.sendStatus(400) }

  // Broadcast
  if (sockets !== undefined) {
    let room_sockets = sockets.nsps['/'].adapter.rooms[user_room];
    sockets.to(user_room).emit(event, { data: custom });
  }

  io.on('connection', ((socket) => {
    socket.on('subscribe', ((room) => {
      let room_name = room.room;
      let room_sockets = io.nsps['/'].adapter.rooms[room_name];
      socket.join(room.room);
      if (sockets === undefined) { sockets = io; }
      user_room = '';
      event     = '';
      custom    = '';
    }))

    socket.on('unsubscribe', ((room) => {
      socket.leave(room.room);
      if (sockets === undefined) { sockets = io; }
      user_room = '';
      event     = '';
      custom    = '';
    }))
    res.sendStatus(200);
  }));
}));

io.on('connection', ((socket) => {
  socket.on('subscribe', ((room) => {
    socket.join(room.room);
    if (sockets === undefined) { sockets = io; }
  }));
  socket.on('unsubscribe', ((room) => {
    socket.leave(room.room);
    if (sockets === undefined) { sockets = io; }
  }));
}));

http.listen(3000, (() => console.log('listening on http://127.0.0.1:3000')));
