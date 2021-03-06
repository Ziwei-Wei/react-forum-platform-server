const mongoose = require("mongoose");
const { MODEL_NAME } = require("../../constants");

const userSchema = mongoose.Schema(
    {
        email: { type: String, lowercase: true, unique: true },
        username: { type: String, maxlength: 16, lowercase: true, unique: true },
        password: { type: String, required: true },
        avatarUrl: {
            type: String,
            default: "https://i.stack.imgur.com/YaL3s.jpg"
        },
        github: {
            id: String,
            url: String
        }
    },
    { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model(MODEL_NAME.user, userSchema, MODEL_NAME.user);
