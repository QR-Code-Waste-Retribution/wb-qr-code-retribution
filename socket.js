const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();


const app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

const { addUser } = require("./user");

// Handle socket connection event

io.on("connection", (socket) => {
  console.log("User connected");
  const roomId = socket.handshake.query.uuid;

  socket.on("join", ({ name }, callBack) => {
    socket.join(`room.${roomId}`);

    // Send a message to all clients in the new room
    socket.to(`room.${roomId}`).emit('message', { user: name, text: `${name} has joined! ${roomId}` });

    socket.broadcast
      .to(`room.${roomId}`)
      .emit("message", { user: name, text: `${name} has joined! ${roomId}` });

  });

  // Handle message event
  socket.on("message", (data) => {
    console.log(`Message received: ${JSON.stringify(data)}`);

    // Broadcast message to all clients except sender
    socket.broadcast
    .to(`room.${roomId}`).emit("message", data);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 8081;

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
