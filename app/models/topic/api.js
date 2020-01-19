const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const passport = require("passport");

const Forum = require("../forum/schema");
const Topic = require("./schema");
const Reply = require("../reply/schema");
const Category = require("../category/schema");
const Tag = require("../tag/schema");

const { SORTING_METHOD, MODEL_NAME } = require("../../constants");

let router = express.Router();

// helper func
const getSortingMethod = querySortingMethod => {
    switch (querySortingMethod) {
        case SORTING_METHOD.BY_DATE_ASC:
            return { updatedAt: 1 };
        case SORTING_METHOD.BY_DATE_DES:
            return { updatedAt: -1 };
        case SORTING_METHOD.BY_NAME_ASC:
            return { name: 1 };
        case SORTING_METHOD.BY_NAME_DES:
            return { name: -1 };
        case SORTING_METHOD.BY_REPLIES_ASC:
            return { replyNum: 1 };
        case SORTING_METHOD.BY_REPLIES_DES:
            return { replyNum: -1 };
        case SORTING_METHOD.BY_VIEWS_ASC:
            return { viewNum: 1 };
        case SORTING_METHOD.BY_VIEWS_DES:
            return { viewNum: -1 };
        default:
            return { updatedAt: 1 };
    }
};

// get all topics in a forum
router.get("/api/forum/:forumId/topic", async (req, res) => {
    try {
        // check if forum exist
        const currForum = await Forum.findOne(
            {
                _id: req.params.forumId
            },
            "_id"
        ).lean();
        if (!currForum) throw { status: 404, message: "Forum does not exist" };

        // get all topics in forum
        const data = await Topic.find(
            { forum: currForum._id },
            "_id user name viewNum replyNum updatedAt category tags"
        )
            .sort(getSortingMethod(req.query.sorting_method))
            .populate(MODEL_NAME.user, "_id username avatarUrl")
            .populate(MODEL_NAME.category, "_id name")
            .populate(MODEL_NAME.tag + "s", "_id name")
            .lean();

        // send back topics
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(error.status ? error.status : 500).send(error.message);
    }
});


// get a topic in a forum
router.get("/api/forum/:forumId/topic/:topicId", async (req, res) => {
    try {
        // check if forum exist
        const currForum = await Forum.findOne(
            {
                _id: req.params.forumId
            },
            "_id"
        ).lean();
        if (!currForum) throw { status: 404, message: "Forum does not exist" };

        // get a topic in forum
        const data = await Topic.findOne(
            { forum: currForum._id },
            "_id user name viewNum replyNum updatedAt category tags"
        )
            .populate(MODEL_NAME.user, "_id username avatarUrl")
            .populate(MODEL_NAME.category, "_id name")
            .populate(MODEL_NAME.tag + "s", "_id name")
            .lean();

        // send back topics
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(error.status ? error.status : 500).send(error.message);
    }
});

// create a topic in a forum
router.post(
    "/api/forum/:forumId/topic",
    passport.authenticate("jwt", { session: false }),
    [
        body("topicName")
            .matches(/^[\w\s.,'"!?()]+$/i)
            .isLength({ min: 1, max: 128 }),
        body("category")
            .matches(/^[a-z-]+$/)
            .isLength({ min: 1, max: 32 }),
        body("tags.*")
            .optional()
            .isAlpha()
            .isLowercase()
            .isLength({ min: 1, max: 32 }),
        body("content").notEmpty()
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
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // check if forum exist
            const forumExists = await Forum.exists({
                _id: req.params.forumId
            });
            if (!forumExists) throw { status: 404, message: "Forum does not exist" };

            // check if topic already exist
            const topicExists = await Topic.exists({
                forum: req.params.forumId,
                name: req.body.topicName
            });
            if (topicExists) throw { status: 409, message: "Topic name already exist" };

            //auto handle category and tags
            const currCategory = await Category.findOneAndUpdate(
                {
                    name: req.body.category,
                    type: "topic"
                },
                {
                    name: req.body.category,
                    type: "topic"
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            await Promise.all(
                req.body.tags.map(async (tag, index) => {
                    const currTag = await Tag.findOneAndUpdate(
                        { name: tag },
                        { name: tag },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    req.body.tags[index] = currTag._id;
                })
            );

            // create the topic in forum
            const newTopic = await Topic.create({
                forum: req.params.forumId,
                user: req.user._id,
                category: currCategory._id,
                tags: req.body.tags,
                name: req.body.topicName
            });

            // create the first reply as the author
            await Reply.create({
                isTitle: true,
                forum: req.params.forumId,
                topic: newTopic._id,
                user: req.user._id,
                content: req.body.content
            });

            // commit transaction
            await session.commitTransaction();
            session.endSession();

            // send status
            res.sendStatus(200);
        } catch (error) {
            // abort transaction
            await session.abortTransaction();
            session.endSession();

            // handle error
            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    }
);

// delete a topic in a forum
router.delete(
    "/api/forum/:forumId/topic/:topicId",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            // check if forum exist
            const currForum = await Forum.findById(
                req.params.forumId,
                "_id admin"
            ).lean();
            if (!currForum) throw { status: 404, message: "Forum does not exist" };

            // check if topic exist
            const currTopic = await Topic.findOne(
                {
                    _id: req.params.topicId,
                    forum: req.params.forumId
                },
                "_id"
            ).lean();
            if (!currTopic) throw { status: 404, message: "Topic does not exist" };

            // if user is forum admin or topic author, delete
            let canDelete = false;
            if (currForum.admin === req.user._id) {
                const deleted = await Topic.deleteOne({
                    _id: req.params.topicId,
                    forum: req.params.forumId
                });
                canDelete = deleted.ok;
            } else {
                const deleted = await Topic.deleteOne({
                    _id: req.params.topicId,
                    forum: req.params.forumId,
                    user: req.user._id
                });
                canDelete = deleted.ok;
            }

            if (canDelete) {
                await Reply.deleteOne({
                    isTitle: true,
                    forum: req.params.forumId,
                    topic: req.params.topicId
                });
            }

            res.sendStatus(200);
        } catch (error) {
            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    }
);

module.exports = router;
