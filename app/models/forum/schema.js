const mongoose = require("mongoose");

const forumSchema = mongoose.Schema({
    name: String,
    description: String,
    category: String
});

forumSchema.index({ name: 1 });

module.exports = mongoose.model("forum", forumSchema);
