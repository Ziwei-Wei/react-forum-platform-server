const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const topicSchema = mongoose.Schema({
    forum: { type: ObjectIdd, ref: "forum" },
    user: { type: ObjectId, ref: "user" },
    title: String,
    category: String,
    tags: Array,
    viewNum: Number,
    replyNum: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

topicSchema.index({ title: -1 });
topicSchema.index({ viewNum: -1 });
topicSchema.index({ replyNum: -1 });
topicSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("topic", topicSchema);
