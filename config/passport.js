const _ = require("lodash");
const jwtSecret = require("config").get("jwtSecret");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GithubStrategy = require("passport-github").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const jwtExtractMethod = require("passport-jwt").ExtractJwt;

const User = require("../app/models/user/schema");

passport.use(
    "local_register",
    new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password",
            session: false
        },
        async (username, password, done) => {
            try {
                const user = await User.findOne({ username: username }).lean();
                if (user) {
                    console.log("username has already been taken");
                    return done(null, false, {
                        message: "username has already been taken"
                    });
                } else {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = await User.create({
                        username: username,
                        password: hashedPassword
                    });
                    return done(null, newUser);
                }
            } catch (error) {
                console.error(error);
                done(error);
            }
        }
    )
);

passport.use(
    "local_login",
    new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password",
            session: false
        },
        async (username, password, done) => {
            try {
                const user = await User.findOne({ username: username }).lean();
                if (!user) {
                    console.log("user is invalid");
                    return done(null, false, { message: "user is invalid" });
                } else {
                    const isSame = await bcrypt.compare(
                        password,
                        user.password
                    );

                    if (isSame === true) {
                        console.log("user found & authenticated");
                        return done(null, user);
                    } else {
                        console.log("passwords do not match");
                        return done(null, false, {
                            message: "passwords is invalid"
                        });
                    }
                }
            } catch (error) {
                console.error(error);
                done(error);
            }
        }
    )
);

passport.use(
    "jwt",
    new JWTStrategy(
        {
            jwtFromRequest: jwtExtractMethod.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret
        },
        async (payload, done) => {
            try {
                const user = await User.findOne({
                    username: payload.id
                }).lean();

                if (user) {
                    console.log("user found in db in passport");
                    done(null, user);
                } else {
                    console.log("user not found in db");
                    done(null, false);
                }
            } catch (error) {
                console.error(error);
                done(error);
            }
        }
    )
);

passport.use(
    "github_login",
    new GithubStrategy(
        {
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: GITHUB_CALLBACK_URL
        },
        async (accessToken, refreshToken, gitProfile, done) => {
            try {
                if (!gitProfile) {
                    console.log("github login failed");
                }

                const user = await User.findOne({
                    "github.id": gitProfile.id
                }).lean();

                const email = _.find(gitProfile.emails, { verified: true })
                    .value;

                if (user) {
                    const githubInfo = {
                        id: gitProfile.id,
                        url: gitProfile.profileUrl
                    };
                    await User.updateOne(
                        { _id: user._id },
                        { $set: { github: githubInfo, email: email } }
                    );
                } else {
                    const newUser = new User({
                        username: gitProfile.username,
                        avatarUrl: gitProfile._json.avatar_url,
                        email: email,
                        github: {
                            id: gitProfile.id,
                            url: gitProfile.profileUrl
                        }
                    });

                    await newUser.save();
                }
            } catch (error) {
                console.error(error);
                done(error);
            }
        }
    )
);
