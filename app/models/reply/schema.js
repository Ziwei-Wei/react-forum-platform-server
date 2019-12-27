const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const replySchema = mongoose.Schema({
    forum: { type: ObjectId, ref: "forum" },
    topic: { type: ObjectId, ref: "topic" },
    user: { type: ObjectId, ref: "user" },
    content: Object,
    createdAt: { type: Date, default: Date.now }
});

replySchema.index({ createdAt: -1 });

module.exports = mongoose.model("reply", replySchema);
