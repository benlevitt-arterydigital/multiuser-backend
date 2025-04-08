// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // or specify an array of allowed origins
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// In-memory store for players
let players = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("newPlayer", (data) => {
    players[socket.id] = {
      nickname: data.nickname,
      color: data.color,
      position: { x: 0, y: 10, z: 0 },
    };
    io.emit("playersUpdate", players);
  });

  socket.on("move", (position) => {
    if (players[socket.id]) {
      players[socket.id].position = position;
      io.emit("playersUpdate", players);
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playersUpdate", players);
  });
});
