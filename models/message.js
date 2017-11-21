const mongoose = require('mongoose');
let messageSchema = mongoose.Schema({
    voters: [String],
    messageId: String,
    voteNum: Number,
    sender: String,
    message: mongoose.Schema.Types.Mixed,
    state: String
});
let message = mongoose.model('Message', messageSchema);
module.exports = message;