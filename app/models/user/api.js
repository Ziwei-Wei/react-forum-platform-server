const express = require("express");
const { body, param, validationResult } = require("express-validator");
const passport = require("passport");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = require("config").get("jwtSecret");
const jwtAccessTime = require("config").get("jwtAccessTime");

const { MODEL_NAME } = require("../../constants");

const Reply = require("../reply/schema");
const User = require("./schema");

let router = express.Router();

// get user profile
router.get(
    "/api/user/:username",
    passport.authenticate("jwt", { session: false }),
    [
        param("username")
            .isAlphanumeric()
            .isLength({ min: 1, max: 16 })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            next();
        }
    },
    async (req, res) => {
        try {
            // get user info
            const userInfo = await User.findOne(
                {
                    username: req.params.username
                },
                "_id email username avatarUrl"
            ).lean();
            if (!userInfo) throw { status: 404, message: "User does not exist" };

            // get all replies from user
            const allReplies = await Reply.find(
                { user: userInfo._id },
                "isTitle forum topic createdAt"
            )
                .populate(MODEL_NAME.forum, "name")
                .populate(MODEL_NAME.topic, "name")
                .lean();

            let userTopics = [];
            let userReplies = [];

            allReplies.map(reply => {
                if (reply.isTitle) {
                    userTopics.push(reply);
                } else {
                    userReplies.push(reply);
                }
            });

            // send info back
            res.status(200).send({
                email: userInfo.email,
                username: userInfo.username,
                avatarUrl: userInfo.avatarUrl,
                topics: userTopics,
                replies: userReplies
            });
        } catch (error) {
            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    }
);


// register a new user
router.post(
    "/api/user",
    [
        body("email")
            .optional()
            .isEmail()
            .normalizeEmail(),
        body("username")
            .optional()
            .isAlphanumeric()
            .isLength({ min: 1, max: 16 }),
        body("password")
            .matches(/^[\w\d!@#$%^&*]+$/)
            .isLength({ min: 6, max: 16 })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send(errors.array());
        } else {
            next();
        }
    },
    async (req, res, next) => {
        try {
            let exist;
            if (req.body.username) {
                exist = await User.findOne({ username: req.body.username }).lean();
            } else if (req.body.email) {
                exist = await User.findOne({ email: req.body.email }).lean();
            } else {
                throw {
                    status: 422,
                    message: "At least provide an username or email"
                };
            }
            if (exist) throw { status: 409, message: "User already exists" };
            next();
        } catch (error) {
            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    },
    async (req, res) => {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const user = await User.create({
                email: req.body.email,
                username: req.body.username,
                password: hashedPassword
            });

            jwt.sign({ id: user._id }, jwtSecret, jwtAccessTime, function (
                error,
                accessToken
            ) {
                if (!error) {
                    res.status(200).send({ accessToken });
                } else {
                    throw error;
                }
            });
        } catch (error) {
            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    }
);

// local login
router.post(
    "/api/session/local",
    passport.authenticate("login", { session: false }),
    (req, res) => {
        jwt.sign({ id: req.user._id }, jwtSecret, jwtAccessTime, function (
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

// extend login
router.put(
    "/api/session/local",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        jwt.sign({ id: req.user._id }, jwtSecret, jwtAccessTime, function (
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
router.post(
    "/api/session/github",
    passport.authenticate("login_from_github", { session: false }),
    (req, res) => {
        jwt.sign({ id: req.user._id }, jwtSecret, jwtAccessTime, function (
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

module.exports = router;
