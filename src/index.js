const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { generateMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);

// Now our server supports web sockets
const io = socketio(server);

const PORT = process.env.PORT || 8000;

const publicDirectoryPath = path.join("__dirname", "../public");

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket)=>{

  socket.on("newMsg", (msg, callback)=>{
    const user = getUser(socket.id);
    io.to(user.room).emit('message', generateMessage(user.username, msg));
    callback();
  })

  socket.on("sendLocation", (loc, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateMessage(user.username, `https://google.com/maps?q=${loc.lat},${loc.long}`)
    );
    callback();
  });

  socket.on('join', ({ username, room }, callback)=>{
    
    const { error, user } = addUser({
      id: socket.id,
      username,
      room
    })

    if(error){
      return callback(error);
    }

    socket.join(room);

    // socket.emit, io.emit, socket.broadcast.emit
    // io.to().emit, socket.broadcast.to().emit

    socket.emit("message", generateMessage(user.username, "Welcome!!"));
    // broadcasts the message to every user except the current user
    socket.broadcast.to(room).emit("message", generateMessage(user.username, `${username} has joined`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

  })

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if(user){
      io.to(user.room).emit("message", generateMessage(user.username, `${user.username} has left`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });

})

server.listen(PORT, () => {
  console.log(`Listening to port ${PORT}!`);
});