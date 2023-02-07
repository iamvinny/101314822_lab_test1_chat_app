const path = require('path'); // Import path
const http = require('http'); // Import http
const express = require('express'); // Import express
const mongoose = require('mongoose'); // Import mongoose
const socketio = require('socket.io'); // Import socket.io
const formatMessage = require('./utils/messages.js'); // Import formatMessage function
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users.js'); // Import user functions

const app = express(); // Create express app
const server = http.createServer(app); // Create http server
const io = socketio(server); // Create socket.io server

// Set the Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Requirements
const messageModel = require('./models/MessagesModel.js');
const DB_URL = "mongodb+srv://root:IelABEKx2vngLmP7@cluster0.aklsnoa.mongodb.net/Assignment_01?retryWrites=true&w=majority"
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the database 'Cluster0' on Atlas Server");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// Hard Coded Data
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
        socket.emit('message', formatMessage(botName, `Welcome to the ${user.room} Channel!`));
        // Broadcast to all other users (connected to that room) except the client connecting when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `➕ ${user.username} has joined the chat!`));
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        // Get current user
        const user = getCurrentUser(socket.id);
        // Get `usernane` from query string using qs
        io.to(user.room).emit('message', formatMessage(user.username, msg)); // Emit message to all clients
        // Save to MongoDB
        const data = new messageModel({
            username: user.username,
            room: user.room,
            message: msg
        });
        
        data.save();
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id); // Get user that left
        if (user) {
            // Broadcast to all other users (connected to that room) except the user itself when a user disconnects
            io.to(user.room).emit('message', formatMessage(botName, `❌ ${user.username} has left the chat!`));
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        } 
    });
});

server.listen(3000, () => console.log('Server running on port 3000')); // Start server