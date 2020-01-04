const mongoose = require("mongoose");
const { MODEL_NAME } = require("../../constants");

const tagSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 32,
        lowercase: true,
        unique: true,
        index: true
    }
});

module.exports = mongoose.model(MODEL_NAME.tag, tagSchema, MODEL_NAME.tag);
