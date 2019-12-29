const express = require("express");
const compression = require("compression");
const passport = require("passport");
const logger = require("morgan");

const forumAPI = require("./models/forum/api");
const replyAPI = require("./models/reply/api");
const topicAPI = require("./models/topic/api");
const userAPI = require("./models/user/api");

require("../config/passport");

const app = express();

app.use(compression());
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(passport.initialize());

forumAPI(app);
replyAPI(app);
topicAPI(app);
userAPI(app);

module.exports = app;
