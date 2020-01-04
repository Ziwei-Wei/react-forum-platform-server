const mongoose = require("mongoose");
const { MODEL_NAME } = require("../../constants");

const ObjectId = mongoose.Schema.Types.ObjectId;

const topicSchema = mongoose.Schema({
    forum: { type: ObjectId, ref: MODEL_NAME.forum, required: true },
    user: { type: ObjectId, ref: MODEL_NAME.user, required: true },
    category: { type: ObjectId, ref: MODEL_NAME.category, required: true },
    tags: [{ type: ObjectId, ref: MODEL_NAME.tag }],
    name: {
        type: String,
        maxlength: 128,
        required: true
    },
    viewNum: { type: Number, default: 0, required: true },
    replyNum: { type: Number, default: 1, required: true },
    createdAt: { type: Date, default: Date.now, immutable: true, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
});

topicSchema.index({ name: 1 });
topicSchema.index({ viewNum: -1 });
topicSchema.index({ replyNum: -1 });
topicSchema.index({ updatedAt: -1 });

module.exports = mongoose.model(MODEL_NAME.topic, topicSchema, MODEL_NAME.topic);
