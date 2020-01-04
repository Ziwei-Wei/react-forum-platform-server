const express = require("express");
const compression = require("compression");
const passport = require("passport");
const responseTime = require("response-time");
const logger = require("morgan");

const forumAPI = require("./models/forum/api");
const replyAPI = require("./models/reply/api");
const topicAPI = require("./models/topic/api");
const userAPI = require("./models/user/api");
const categoryAPI = require("./models/category/api");
const tagAPI = require("./models/tag/api");

require("../config/passport");

const app = express();

app.use(compression());
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(responseTime());
app.use(passport.initialize());

app.use(forumAPI);
app.use(replyAPI);
app.use(topicAPI);
app.use(userAPI);
app.use(categoryAPI);
app.use(tagAPI);

module.exports = app;
