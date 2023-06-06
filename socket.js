const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Handle socket connection event

app.get('/', (req, res) => {
  console.log("It Works!!")
  res.json({
    message: 'Welcome to WB QR Retribution\n'
  })
})

app.post("/send-message/va", (req, res) => {
  const { uuid: roomId, name } = req.body;

  io.to(`va.${roomId}.socket`).emit("va_status", {
    status: true,
    data: {
      message: name,
    },
  });

  res.status(200).send({
    message: "Successfully send data",
  });
});

io.on("connection", (socket) => {
  const { uuid: roomId, role } = socket.handshake.query;

  console.log(`User ${role} connected ${roomId}`);

  socket.on("join", ({ name }, _callBack) => {
    socket.join(`room.${roomId}`);
    socket.broadcast
      .to(`room.${roomId}`)
      .emit("message", { user: name, text: `${name} has joined! ${roomId}` });
  });

  socket.on("payment_va", ({ name }, _callBack) => {
    socket.join(`va.${roomId}.socket`);
    socket.broadcast
      .to(`va.${roomId}.socket`)
      .emit("va_status", { status: false, data: [] });
  });

  socket.on("va_status", (data) => {
    console.log(`VA status received: ${JSON.stringify(data)}`);

    // Broadcast message to all clients except sender
    socket.broadcast.to(`va.${roomId}.socket`).emit("va_status", data);
  });

  // Handle message event
  socket.on("message", (data) => {
    console.log(`Message received: ${JSON.stringify(data)}`);

    // Broadcast message to all clients except sender
    socket.broadcast.to(`room.${roomId}`).emit("message", data);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 6001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});
