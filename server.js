const config = require("config");
const connectDB = require("./config/db");
const app = require("./app/app");

const PORT = process.env.PORT || parseInt(config.get("Port"));

// connect database
connectDB(config.get("dbURI"));

// start listening
app.listen(PORT, () =>
    console.log(`>>> Server started listening at port: ${PORT}`)
);
