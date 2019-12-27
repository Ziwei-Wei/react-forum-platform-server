const jwt = require("jsonwebtoken");
const User = require("../models/user/user");
const config = require("config");

module.exports = async (req, res, next) => {
    try {
        // get token from header without "Bearer " part
        const authHeader = req.header("Authorization");
        if (!authHeader) throw new Error("MissingAuthHeader");
        const token = authHeader.slice(7);

        // check if there is no token sent
        if (!token || token.length === 0) {
            throw new Error("MissingJWT");
        }

        // check if token is valid
        const decoded = await jwt.verify(token, config.get("jwtSecret"));

        // check if the id token pair is valid
        const user = await User.findOne(
            {
                _id: decoded._id,
                tokenList: token
            },
            "_id"
        ).lean();
        if (!user) throw new Error("InvalidToken");

        // give req user and token
        req.user = user;

        // user is valid, access granted
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send(error.message);
    }
};
