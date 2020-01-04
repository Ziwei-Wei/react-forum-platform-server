const mongoose = require("mongoose");
const { MODEL_NAME } = require("../../constants");

const ObjectId = mongoose.Schema.Types.ObjectId;

const replySchema = mongoose.Schema({
    isTitle: Boolean,
    forum: { type: ObjectId, ref: MODEL_NAME.forum, required: true },
    topic: { type: ObjectId, ref: MODEL_NAME.topic, required: true },
    user: { type: ObjectId, ref: MODEL_NAME.user, required: true },
    content: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now, immutable: true, required: true }
});

replySchema.index({ createdAt: -1 });

module.exports = mongoose.model(MODEL_NAME.reply, replySchema, MODEL_NAME.reply);
