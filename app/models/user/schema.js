const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        email: { type: String, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        avatarUrl: String,
        github: {
            id: String,
            url: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
