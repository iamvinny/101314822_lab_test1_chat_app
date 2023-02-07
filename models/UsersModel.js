const mongoose = require('mongoose');

//TODO - Create Messages Schema here having fields
//      - username
//      - message
//      - room
//      - timestamps

// create a mongoose Schema having the fields as mentioned above
const UsersSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("users", UsersSchema);