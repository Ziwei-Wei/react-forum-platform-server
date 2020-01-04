const mongoose = require("mongoose");
const { MODEL_NAME } = require("../../constants");

const ObjectId = mongoose.Schema.Types.ObjectId;

const forumSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 32,
        lowercase: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        maxlength: 128,
        required: true
    },
    category: {
        type: ObjectId,
        ref: MODEL_NAME.category,
        required: true
    },
    admin: {
        type: ObjectId,
        ref: MODEL_NAME.user,
        required: true
    }
});

module.exports = mongoose.model(MODEL_NAME.forum, forumSchema, MODEL_NAME.forum);
