const passport = require("passport");
const jwt = require("jsonwebtoken");
const jwtSecret = require("config").get("jwtSecret");
const jwtAccessTime = require("config").get("jwtAccessTime");

const User = require("../user/schema");
const Topic = require("../topic/schema");
const Reply = require("../reply/schema");

const userAPI = app => {
    // get user profile
    app.get(
        "/api/user",
        passport.authenticate("jwt", { session: false }),
        async (req, res) => {
            try {
                // construct user info
                const userInfo = {
                    email: req.user.email,
                    username: req.user.username,
                    avatarUrl: req.user.avatarUrl
                };

                // get all topics from user
                const userTopics = await Topic.find({
                    user: req.user._id
                }).lean();

                // get all replies from user
                const userReplies = await Reply.find({
                    user: req.user._id
                }).lean();

                // send info back
                res.status(200).send({
                    info: userInfo,
                    topics: userTopics,
                    replies: userReplies
                });
            } catch (error) {
                console.error(error);
                res.status(500).send("server error: " + error.message);
            }
        }
    );

    // register a new user
    app.post(
        "/api/user",
        passport.authenticate("register", { session: false }),
        (req, res) => {
            jwt.sign({ id: req.user.username }, jwtSecret, jwtAccessTime, function(
                error,
                accessToken
            ) {
                if (!error) {
                    res.status(200).send({ accessToken });
                } else {
                    console.error(error);
                }
            });
        }
    );

    // local login
    app.post(
        "/api/session/local",
        passport.authenticate("login", { session: false }),
        (req, res) => {
            jwt.sign({ id: req.user.username }, jwtSecret, jwtAccessTime, function(
                error,
                accessToken
            ) {
                if (!error) {
                    res.status(200).send({ accessToken });
                } else {
                    console.error(error);
                }
            });
        }
    );

    // github login
    app.post(
        "/api/session/github",
        passport.authenticate("login_from_github", { session: false }),
        (req, res) => {
            jwt.sign({ id: req.user.username }, jwtSecret, jwtAccessTime, function(
                error,
                accessToken
            ) {
                if (!error) {
                    res.status(200).send({ accessToken });
                } else {
                    console.error(error);
                }
            });
        }
    );
};

module.exports = userAPI;
