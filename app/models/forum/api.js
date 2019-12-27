import forum from "./schema";

/**
 * forum apis
 */
const forumAPI = app => {
    // get all forums
    app.get("/api/forum", async (req, res) => {
        try {
            let sortingMethod = { name: 1 };
            switch (req.body.sortingMethod) {
                case value:
                    break;
                default:
                    break;
            }
            const all = await forum
                .find({})
                .sort(sortingMethod)
                .lean()
                .exec();
            res.status(200).send(all);
        } catch (error) {
            console.error(error);
            res.status(500).send("server error: " + error.message);
        }
    });

    // create a new forum by a logged in user
    app.post("/api/forum", async (req, res) => {
        try {
            const newForum = forum.create();
            res.status(200).send(all);
        } catch (error) {
            console.error(error);
            res.status(500).send("server error: " + error.message);
        }
    });

    // delete a forum by a logged in user which is the admin of the forum
    app.post("/api/forum", async (req, res) => {
        try {
            forum.deleteOne({ _id: req.body.forumId }).exec();
            res.sendStatus(200);
        } catch (error) {
            console.error(error);
            res.status(500).send("server error: " + error.message);
        }
    });
};

module.exports = forumAPI;
