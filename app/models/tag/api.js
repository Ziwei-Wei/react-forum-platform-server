const express = require("express");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

const Tag = require("./schema");

let router = express.Router();

// get all tags
router.get("/api/tag", async (req, res) => {
    try {
        const data = await Tag.find({}, "-_id name").lean();
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(error.status ? error.status : 500).send(error.message);
    }
});

// create a new tag
router.post(
    "/api/tag",
    passport.authenticate("jwt", { session: false }),
    [
        body("name")
            .isAlpha()
            .isLowercase()
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
    async (req, res) => {
        try {
            await Tag.findOneAndUpdate(
                { name: req.body.name },
                { name: req.body.name },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            res.sendStatus(200);
        } catch (error) {
            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    }
);

module.exports = router;
