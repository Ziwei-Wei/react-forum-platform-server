const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");

const { MODEL_NAME } = require("../../constants");

const Reply = require("./schema");
const Forum = require("../forum/schema");
const Topic = require("../topic/schema");

let router = express.Router();

// get all replies for a topic
router.get("/api/forum/:forumId/topic/:topicId/reply", async (req, res) => {
    try {
        // find the topic by topic id and forum id, then increment the viewNum
        const currTopic = await Topic.findOneAndUpdate(
            {
                _id: req.params.topicId,
                forum: req.params.forumId
            },
            { $inc: { viewNum: 1 } }
        ).lean();
        if (!currTopic) throw { status: 404, message: "Topic or forum does not exist" };

        // find all replies for that topic in that forum
        const data = await Reply.find(
            {
                forum: req.params.forumId,
                topic: req.params.topicId
            },
            "user content createdAt"
        )
            .populate({ path: MODEL_NAME.user, select: "-_id username avatarUrl" })
            .lean();

        // send all back to client
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(error.status ? error.status : 500).send(error.message);
    }
});

// create an reply on a topic
router.post(
    "/api/forum/:forumId/topic/:topicId/reply",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // check if forum exist
            const forumExists = await Forum.exists({
                _id: req.params.forumId
            });
            if (!forumExists) throw { status: 404, message: "Forum does not exist" };

            // check if topic exist
            const currTopic = await Topic.findOneAndUpdate(
                {
                    _id: req.params.topicId
                },
                { $inc: { replyNum: 1 }, $set: { updatedAt: Date.now() } }
            ).lean();
            if (!currTopic) throw { status: 404, message: "Topic does not exist" };

            // create the reply
            await Reply.create({
                forum: req.params.forumId,
                topic: req.params.topicId,
                user: req.user._id,
                content: req.body.content
            });

            await session.commitTransaction();
            session.endSession();

            res.sendStatus(200);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    }
);

// delete an reply on a topic
router.delete(
    "/api/forum/:forumId/topic/:topicId/reply/:replyId",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // check if forum exist
            const forumExists = await Forum.exists({
                _id: req.params.forumId
            });
            if (!forumExists) throw { status: 404, message: "Forum does not exist" };

            // check if topic exist
            const currTopic = await Topic.findByIdAndUpdate(req.params.topicId, {
                $inc: { replyNum: -1 }
            }).lean();
            if (!currTopic) throw { status: 404, message: "Topic does not exist" };

            // check if reply exist
            const currReply = await Reply.findByIdAndDelete(req.params.replyId).lean();
            if (!currReply) throw { status: 404, message: "Reply does not exist" };

            await session.commitTransaction();
            session.endSession();

            res.sendStatus(200);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    }
);

module.exports = router;
