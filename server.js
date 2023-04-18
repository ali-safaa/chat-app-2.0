let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let formatMessage = require('./formatMessage');
let express = require('express');
let { joinUser, getCurrentUser, userLeave, getRoomUsers } = require('./users');
let port = process.env.LOCAL || 3000;
require('dotenv').config();

app.use(express.static('client'));

let chatBot = 'bot';

// this run when client is connect
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    let user = joinUser(socket.id, username, room);
    socket.join(user.room);

    // this is single client
    socket.emit('someMessage', formatMessage(chatBot, 'welcome to chat'));

    // this broadcast message to all users in room exsept the sender
    socket.broadcast
      .to(user.room)
      .emit(
        'someMessage',
        formatMessage(chatBot, `${user.username} has join a chat`)
      );

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // show the value input and current user
  socket.on('chatMessage', (value) => {
    let user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, value));
  });

  // this disconnect the server
  socket.on('disconnect', () => {
    let user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'someMessage',
        formatMessage(chatBot, `${user.username} has left the chat`)
      );
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(port, () => console.log('listning'));
