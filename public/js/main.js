const chatForm = document.getElementById('chat-form'); // Get chat form
const chatMessages = document.querySelector('.chat-messages'); // Taget chat messages div element (class)
const socket = io(); // Create socket.io client (we have access to io because we imported it in the HTML file)

// Get Username and Run from URL using Qs Library
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true // Ignore the ? in the URL
});

// Join Chatroom
socket.emit('joinRoom', {username, room});

// Listen for message event, then pass it to the callback function
socket.on('message', message => {
    console.log(message); // Log message to console
    outputMessage(message); // Output message to DOM

    // Automatically Scroll Down (to the bottom of the chat)
    document.querySelector('.chat-messages').scrollTop = document.querySelector('.chat-messages').scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form from submitting
    const msg = e.target.elements.msg.value; // Get message from form
    socket.emit('chatMessage', msg); // Emit message to server
    e.target.elements.msg.value = ''; // Clear input
    e.target.elements.msg.focus(); // Focus on input
});

// Output Messaage to DOM
function outputMessage(message) {
    const div = document.createElement('div'); // Create div element
    var currentdate = new Date(); // Get current date
    div.classList.add('message'); // Add class to div
    div.innerHTML = `
        <p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p>
    `; // Add HTML to div
    document.querySelector('.chat-messages').appendChild(div); // Append div to chat-messages
}