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
    "login",
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
                    return done(null, false, { message: "User is invalid" });
                }

                const isSame = await bcrypt.compare(password, user.password);
                if (isSame === true) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Passwords is invalid" });
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
                    _id: payload.id
                }).lean();

                if (user) {
                    done(null, user);
                } else {
                    done(null, false);
                }
            } catch (error) {
                console.error(error);
                done(error);
            }
        }
    )
);
/*
passport.use(
    "login_from_github",
    new GithubStrategy(
        {
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: "http://127.0.0.1:3000/auth/github/callback"
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
*/
