const passport = require("passport");
const Forum = require("./schema");

const SORTING_METHOD = {
    BY_NAME_ASC: "BY_NAME_ASC",
    BY_NAME_DES: "BY_NAME_DES",
    BY_DATE_ASC: "BY_DATE_ASC",
    BY_DATE_DES: "BY_DATE_DES",
    BY_VIEWS_ASC: "BY_VIEWS_ASC",
    BY_VIEWS_DES: "BY_VIEWS_DES",
    BY_REPLIES_ASC: "BY_REPLIES_ASC",
    BY_REPLIES_DES: "BY_REPLIES_DES"
};

const forumAPI = app => {
    // get all forums
    app.get("/api/forum", async (req, res) => {
        try {
            let sortingMethod;
            switch (req.body.sortingMethod) {
                case SORTING_METHOD.BY_DATE_ASC:
                    sortingMethod = { updatedAt: 1 };
                    break;
                case SORTING_METHOD.BY_DATE_DES:
                    sortingMethod = { updatedAt: -1 };
                    break;
                case SORTING_METHOD.BY_NAME_ASC:
                    sortingMethod = { name: 1 };
                    break;
                case SORTING_METHOD.BY_NAME_DES:
                    sortingMethod = { name: -1 };
                    break;
                case SORTING_METHOD.BY_REPLIES_ASC:
                    sortingMethod = { replyNum: 1 };
                    break;
                case SORTING_METHOD.BY_REPLIES_DES:
                    sortingMethod = { replyNum: -1 };
                    break;
                case SORTING_METHOD.BY_VIEWS_ASC:
                    sortingMethod = { viewNum: 1 };
                    break;
                case SORTING_METHOD.BY_VIEWS_DES:
                    sortingMethod = { viewNum: -1 };
                    break;
                default:
                    sortingMethod = { name: 1 };
                    break;
            }
            const all = await Forum.find({})
                .sort(sortingMethod)
                .lean();
            res.status(200).send(all);
        } catch (error) {
            console.error(error);
            res.status(500).send("server error: " + error.message);
        }
    });

    // create a new forum by a logged in user
    app.post("/api/forum", passport.authenticate("jwt", { session: false }), async (req, res) => {
        try {
            // check if the forum exist
            const exist = await Forum.findOne({
                name: req.body.name
            }).lean();
            if (exist) throw new Error("Invalid forum");

            await Forum.create({
                name: req.body.name,
                description: req.body.description,
                tags: req.body.tags,
                admins: [user._id]
            });
            res.sendStatus(200);
        } catch (error) {
            console.error(error);
            res.status(500).send("server error: " + error.message);
        }
    });

    ////// admin

    // assign forum admin by a logged in admin
    app.patch(
        "/api/forum/:forumName/admin",
        passport.authenticate("jwt", { session: false }),
        async (req, res) => {
            try {
                // check if the forum exist
                const currForum = await Forum.findOne({
                    name: req.body.name,
                    admins: req.user._id
                });
                if (!currForum) throw new Error("Invalid forum");
                if (req.body._id === req.user._id.toString()) throw new Error("Invalid user");

                currForum.admins = [...currForum.admins, req.body._id];
                await currForum.save();

                res.sendStatus(200);
            } catch (error) {
                console.error(error);
                res.status(500).send("server error: " + error.message);
            }
        }
    );

    // resign forum admin by a logged in admin
    app.delete(
        "/api/forum/:forumName/admin",
        passport.authenticate("jwt", { session: false }),
        async (req, res) => {
            try {
                // check if the forum exist
                const currForum = await Forum.findOne({
                    name: req.body.name
                });
                if (!currForum) throw new Error("Invalid forum");
                if (currForum.admins.length === 1) throw new Error("Last admin");

                currForum.admins.filter(admin => {
                    admin !== req.user._id;
                });

                await currForum.save();
                res.sendStatus(200);
            } catch (error) {
                console.error(error);
                res.status(500).send("server error: " + error.message);
            }
        }
    );
};

module.exports = forumAPI;
