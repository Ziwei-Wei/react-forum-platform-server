const mongoose = require("mongoose");
const { MODEL_NAME } = require("../../constants");

const categorySchema = mongoose.Schema({
    type: {
        type: String,
        enum: ["forum", "topic"],
        required: true
    },
    name: {
        type: String,
        maxlength: 32,
        lowercase: true,
        required: true
    }
});

categorySchema.index({ type: 1, name: 1 }, { unique: true });

module.exports = mongoose.model(
    MODEL_NAME.category,
    categorySchema,
    MODEL_NAME.category
);
