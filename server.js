const path = require('path'); // Import path
const http = require('http'); // Import http
const express = require('express'); // Import express
const socketio = require('socket.io'); // Import socket.io
const formatMessage = require('./utils/messages.js'); // Import formatMessage function
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users.js'); // Import user functions

const app = express(); // Create express app
const server = http.createServer(app); // Create http server
const io = socketio(server); // Create socket.io server

// Set the Static Folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = '🤖 Chat BOT';

// Event listener for when a client connects
io.on('connection', socket => {
    // Listen for joinRoom event
    socket.on('joinRoom', ({username, room}) => {
        // Join user to chat
        const user = userJoin(socket.id, username, room);
        // Join user to room
        socket.join(user.room);
        // Broadcast only to the user that connected (local)
        socket.emit('message', formatMessage(botName, 'Welcome to the Live Chat!'));
        // Broadcast to all other users (connected to that room) except the client connecting when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `➕ ${user.username} has joined the chat!`));
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        // Get current user
        const user = getCurrentUser(socket.id);
        // Get `usernane` from query string using qs
        io.to(user.room).emit('message', formatMessage(user.username, msg)); // Emit message to all clients
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id); // Get user that left
        if (user) {
            // Broadcast to all other users (connected to that room) except the user itself when a user disconnects
            io.to(user.room).emit('message', formatMessage(botName, `❌ ${user.username} has left the chat!`));
        } 
    });
});

server.listen(3000, () => console.log('Server running on port 3000')); // Start server