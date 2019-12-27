const express = require("express");
const compression = require("compression");
const passport = require("passport");
const logger = require("morgan");

const app = express();

require("../config/passport");

app.use(compression());
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(passport.initialize());

module.exports = app;
