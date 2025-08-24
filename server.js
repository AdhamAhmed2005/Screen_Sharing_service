const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`${socket.id} joined room: ${room}`);
    
    const roomClients = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`Clients in room ${room}: ${roomClients}`);
    
    io.to(room).emit('room-joined', { room, clientCount: roomClients });
    
    socket.to(room).emit('support-ready', room);
  });

  socket.on('offer', (data) => {
    console.log('Offer received from:', socket.id, 'for room:', data.room);
    io.to(data.room).emit('offer', { offer: data.offer, from: socket.id });
  });

  socket.on('answer', (data) => {
    console.log('Answer received from:', socket.id, 'for room:', data.room);
    io.to(data.room).emit('answer', { answer: data.answer, from: socket.id });
  });

  socket.on('ice-candidate', (data) => {
    console.log('ICE candidate from:', socket.id, 'for room:', data.room);
    io.to(data.room).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});