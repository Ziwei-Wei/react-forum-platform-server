const passport = require("passport");
const signIn = require("./controller").signIn;
const getFullProfile = require("./controller").getFullProfile;

const userAPI = app => {
    // get user profile
    app.get("/api/user/:username", (req, res) => {
        getFullProfile(req.params.username).then(
            result => {
                res.send(result);
            },
            error => {
                res.send({ error });
            }
        );
    });

    // create user profile
    app.post("/api/user", (req, res) => {
        getFullProfile(req.params.username).then(
            result => {
                res.send(result);
            },
            error => {
                res.send({ error });
            }
        );
    });

    // change user profile
    app.patch("/api/user", (req, res) => {
        getFullProfile(req.params.username).then(
            result => {
                res.send(result);
            },
            error => {
                res.send({ error });
            }
        );
    });

    // delete user
    app.delete("/api/user/:username", (req, res) => {
        getFullProfile(req.params.username).then(
            result => {
                res.send(result);
            },
            error => {
                res.send({ error });
            }
        );
    });
};

module.exports = userAPI;
