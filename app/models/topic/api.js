const mongoose = require("mongoose");
const passport = require("passport");
const Forum = require("../forum/schema");
const Topic = require("./schema");
const Reply = require("../reply/schema");

const topicAPI = app => {
    // get all topics in a forum
    app.get("/api/forum/:forumName/topic", async (req, res) => {
        try {
            // check if forum exist
            const currForum = await Forum.findOne({
                name: req.params.forumName
            }).lean();
            if (!currForum) throw new Error("Forum is invalid");

            // get all topics in forum
            const allTopics = await Topic.find({ forum: currForum._id })
                .populate("user", { path: "class", select: "username" })
                .lean();

            // send back topics
            res.status(200).send(allTopics);
        } catch (error) {
            // handle error
            console.error(error);
            res.status(500).send("server error: " + error.message);
        }
    });

    // create a topic in a forum
    app.post(
        "/api/forum/:forumName/topic",
        passport.authenticate("jwt", { session: false }),
        async (req, res) => {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                // check if forum exist
                const currForum = await Forum.findOne({
                    name: req.params.forumName
                }).lean();
                if (!currForum) throw new Error("Invalid forum");

                // check if topic already exist
                const currTopic = await Topic.findOne({
                    forum: currForum._id,
                    title: req.body.title
                }).lean();
                if (currTopic) throw new Error("Invalid topic");

                // create the topic in forum
                const newTopic = await Topic.create({
                    forum: currForum._id,
                    user: req.user._id,
                    title: req.body.title,
                    category: req.body.category,
                    tags: req.body.tags
                });

                // create the first reply as the author
                await Reply.create({
                    forum: currForum._id,
                    topic: newTopic._id,
                    userId: req.user._id,
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
                res.status(500).send("server error: " + error.message);
            }
        }
    );

    // delete a topic in a forum
    app.post(
        "/api/forum/:forumName/topic/:topicTitle",
        passport.authenticate("jwt", { session: false }),
        async (req, res) => {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                // check if forum exist
                const currForum = await Forum.findOne({
                    name: req.params.forumName
                }).lean();
                if (!currForum) throw new Error("Invalid forum");

                // check if topic exist
                const currTopic = await Topic.findOne({
                    forum: currForum._id,
                    title: req.params.topicTitle
                }).lean();
                if (!currTopic) throw new Error("Invalid topic");

                // if user is forum admin or topic author, delete
                if (currForum.admins.includes(req.user._id)) {
                    await Topic.deleteOne({
                        forum: currForum._id,
                        title: req.params.topicTitle
                    }).lean();
                } else {
                    await Topic.deleteOne({
                        forum: currForum._id,
                        title: req.params.topicTitle,
                        user: req.user._id
                    }).lean();
                }

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
                res.status(500).send("server error: " + error.message);
            }
        }
    );
};

module.exports = topicAPI;
