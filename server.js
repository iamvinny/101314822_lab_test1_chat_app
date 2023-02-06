const path = require('path'); // Import path
const http = require('http'); // Import http
const express = require('express'); // Import express
const socketio = require('socket.io'); // Import socket.io
const formatMessage = require('./utils/messages.js'); // Import formatMessage function

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
        // Broadcast only to the user that connected (local)
        socket.emit('message', formatMessage(botName, 'Welcome to the Live Chat!'));
        // Broadcast to all other users except the client connecting when a user connects
        socket.broadcast.emit('message', formatMessage(botName, 'A user has joined the chat! [Socket ID: ' + socket.id + ']'));
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        // Get `usernane` from query string using qs
        io.emit('message', formatMessage('USER', msg)); // Emit message to all clients
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', formatMessage(botName, 'A user has left the chat! [Socket ID: ' + socket.id + ']'));
    });
});

server.listen(3000, () => console.log('Server running on port 3000')); // Start server