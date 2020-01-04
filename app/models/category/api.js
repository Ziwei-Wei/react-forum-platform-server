const express = require("express");
const { body, query, validationResult } = require("express-validator");
const passport = require("passport");
const category = require("./schema");

let router = express.Router();

// get all categories
router.get(
    "/api/category",
    [query("type").matches(/^forum|topic$/)],
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
            const data = await category
                .find({ type: req.query.type }, "-_id name")
                .lean();
            res.status(200).send(data);
        } catch (error) {
            console.error(error);
            res.status(error.status ? error.status : 500).send(error.message);
        }
    }
);

// create a new category
router.post(
    "/api/category",
    passport.authenticate("jwt", { session: false }),
    [
        body("type").matches(/^forum|topic$/),
        body("name")
            .matches(/^[a-z-]+$/)
            .isLength({ min: 1, max: 32 })
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            next();
        }
    },
    async (req, res) => {
        try {
            await category.create({
                type: type,
                name: name
            });
            res.sendStatus(200);
        } catch (error) {
            console.error(error);
            res.status(500).send("server error: " + error.message);
        }
    }
);

module.exports = router;
