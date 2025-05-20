// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// In-memory store for players
let players = {};

io.on("connection", (socket) => {
  console.log("✨ New Socket.IO connection:", socket.id);

  socket.on("newPlayer", (data) => {
    console.log("➕ newPlayer:", socket.id, data);
    players[socket.id] = {
      nickname: data.nickname,
      color: data.color,
      position: { x: 0, y: 10, z: 0 },
    };
    io.emit("playersUpdate", players);
  });

  socket.on("move", (data) => {
    if (players[socket.id]) {
      players[socket.id].position = data.position;
      players[socket.id].moving = data.moving;
      io.emit("playersUpdate", players);
    }
  });

  socket.on("signal", ({ to, from, data }) => {
    console.log("↔️  signal relay from", from, "to", to, data);
    io.to(to).emit("signal", { from, data });
  });

  socket.on("disconnect", () => {
    console.log("❌ disconnect:", socket.id);
    delete players[socket.id];
    io.emit("playersUpdate", players);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
