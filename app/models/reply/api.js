const passport = require("passport");
const Reply = require("./schema");
const Forum = require("../forum/schema");
const Topic = require("../topic/schema");

const replyAPI = app => {
    // get all replies for a topic
    app.get("/api/forum/:forumName/topic/:topicTitle/reply", async (req, res) => {
        try {
            // find forum by forum name
            const currForum = await Forum.findOne({
                name: req.params.forumName
            }).lean();
            if (!currForum) throw new Error("Invalid forum");

            // find the topic by topic name and forum name, the increment viewNum
            const currTopic = await Topic.findOneAndUpdate(
                {
                    forum: currForum._id,
                    title: req.params.topicTitle
                },
                { $inc: { viewNum: 1 } }
            ).lean();
            if (!currTopic) throw new Error("Invalid topic");

            // find all replies for that topic in that forum
            const allReplies = await Reply.find({
                forum: currForum._id,
                topic: currTopic._id
            })
                .populate("user")
                .lean();

            // send all back to client
            res.status(200).send(allReplies);
        } catch (error) {
            console.error(error);
            res.status(500).send("server error: " + error.message);
        }
    });

    // create an reply on a topic
    app.post(
        "/api/forum/:forumName/topic/:topicTitle/reply",
        passport.authenticate("jwt", { session: false }),
        async (req, res) => {
            try {
                // check if forum exist
                const currForum = await Forum.findOne({
                    name: req.params.forumName
                }).lean();
                if (!currForum) throw new Error("Invalid forum");

                // check if topic exist
                const currTopic = await Topic.findOneAndUpdate(
                    {
                        forum: currForum._id,
                        title: req.params.topicTitle
                    },
                    { $inc: { replyNum: 1 }, $set: { updatedAt: Date.now() } }
                ).lean();
                if (!currTopic) throw new Error("Invalid topic");

                // create the reply
                await Reply.create({
                    forum: currForum._id,
                    topic: currTopic._id,
                    user: req.user._id,
                    content: req.body.content
                });

                res.sendStatus(200);
            } catch (error) {
                console.error(error);
                res.status(500).send("server error: " + error.message);
            }
        }
    );

    // delete an reply on a topic
    app.delete(
        "/api/forum/:forumName/topic/:topicTitle/reply",
        passport.authenticate("jwt", { session: false }),
        async (req, res) => {
            try {
                // check if forum exist
                const currForum = await Forum.findOne({
                    name: req.params.forumName
                }).lean();
                if (!currForum) throw new Error("Invalid forum");

                // check if topic exist
                const currTopic = await Topic.findOneAndUpdate({
                    forum: currForum._id,
                    title: req.params.topicTitle
                }).lean();
                if (!currTopic) throw new Error("Invalid topic");

                // create the reply
                await Reply.create({
                    forum: currForum._id,
                    topic: currTopic._id,
                    user: req.user._id,
                    content: req.body.content
                });

                res.sendStatus(200);
            } catch (error) {
                console.error(error);
                res.status(500).send("server error: " + error.message);
            }
        }
    );
};

module.exports = replyAPI;
