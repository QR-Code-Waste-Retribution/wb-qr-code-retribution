const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const redis = require("redis");

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

const client = redis.createClient();

// Handle socket connection event
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", ({ name, room }, callBack) => {
    // Add user to Redis
    const { user, error } = addUser({ id: socket.id, name, room });
    if (error) return callBack(error);

    socket.join(user.room);
    socket.emit("message", {
      user: name,
      text: `Welcome to ${user.room}`,
    });

    // Retrieve all users in the room from Redis
    client.keys(`user:*:room:${user.room}`, (err, keys) => {
      if (err) {
        console.log(err);
        return;
      }

      // Retrieve user details for each key
      client.mget(keys, (err, users) => {
        if (err) {
          console.log(err);
          return;
        }

        // Emit the list of users to all clients in the room
        io.to(user.room).emit("users", JSON.parse(`[${users}]`));
      });
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "Admin", text: `${user.name} has joined!` });
  });

  // Handle message event
  socket.on("message", (data) => {
    console.log(`Message received: ${data}`);

    // Broadcast message to all clients except sender
    socket.broadcast.emit("message", data);
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
