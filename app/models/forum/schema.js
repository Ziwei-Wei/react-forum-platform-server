const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const forumSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        index: true
    },
    description: String,
    category: String,
    admins: [{ type: ObjectId, ref: "user" }]
});

module.exports = mongoose.model("forum", forumSchema);
