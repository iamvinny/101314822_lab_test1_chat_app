const mongoose = require('mongoose');

//TODO - Create Messages Schema here having fields
//      - username
//      - message
//      - room
//      - timestamps

// create a mongoose Schema having the fields as mentioned above
const MessagesSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("messages", MessagesSchema);