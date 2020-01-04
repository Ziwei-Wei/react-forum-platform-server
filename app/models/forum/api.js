const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const passport = require("passport");

const { SORTING_METHOD, MODEL_NAME } = require("../../constants");

const Forum = require("./schema");
const Category = require("../category/schema");

let router = express.Router();

// helper func
const getSortingMethod = querySortingMethod => {
    switch (querySortingMethod) {
        case SORTING_METHOD.by_name_asc:
            return { name: 1 };
        case SORTING_METHOD.by_name_des:
            return { name: -1 };
        default:
            return { name: 1 };
    }
};

// get all forums
router.get("/api/forum", async (req, res) => {
    try {
        const data = await Forum.find({}, "_id name description category")
            .sort(getSortingMethod(req.query.sorting_method))
            .populate({ path: MODEL_NAME.category, select: "-_id name" })
            .lean();

        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(error.status ? error.status : 500).send(error.message);
    }
});

// create a new forum by a logged in user
router.post(
    "/api/forum",
    //// user validation
    passport.authenticate("jwt", { session: false }),
    //// validate parameters
    [
        body("name")
            .matches(/^[a-z-]+$/)
            .isLength({ min: 1, max: 32 }),
        body("description")
            .matches(/^[-/=\w\s.,'"!?@#%$+()]+$/)
            .isLength({ min: 1, max: 128 }),
        body("category")
            .matches(/^[a-z-]+$/)
            .isLength({ min: 1, max: 32 })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            next();
        }
    },
    //// handle request
    // create new forum, if category is new, create category
    async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const exist = await Forum.findOne({
                name: req.body.name
            }).lean();
            if (exist) {
                throw { status: 409, message: "Forum name already exist" };
            }

            let category = await Category.findOne({
                name: req.body.category,
                type: "forum"
            }).lean();
            if (!category) {
                category = await Category.create({
                    name: req.body.category,
                    type: "forum"
                });
            }

            await Forum.create({
                name: req.body.name,
                description: req.body.description,
                category: category._id,
                admin: req.user._id
            });

            res.sendStatus(200);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    }
);

////// admin
// resign forum admin by a logged in admin
router.patch(
    "/api/forum/:forumId/admin",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            if (req.body._id === req.user._id.toString()) {
                throw { status: 403, message: "Can not assign self" };
            }

            const currForum = await Forum.findOneAndUpdate(
                {
                    _id: req.params.forumId,
                    admin: req.user._id
                },
                { $set: { admin: req.body._id } }
            );

            if (!currForum) {
                throw { status: 403, message: "Invalid forum name or admin" };
            }

            res.sendStatus(200);
        } catch (error) {
            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    }
);

module.exports = router;
