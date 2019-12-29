const config = require("config");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const app = require("./app/app");
const dbURI = require("config").get("dbURI");

const PORT = process.env.PORT || parseInt(config.get("Port"));

const start = async () => {
    console.log(`>>> Server started <<<`);
    // connect database
    let db = await connectDB(dbURI, "testDB");

    // start listening
    let server = app.listen(PORT, () =>
        console.log(`>>> Server started listening at port: ${PORT}`)
    );

    // handle exit
    process.on("exit", () => {
        console.log(`>>> Server closed <<<`);
    });
    process.on("SIGINT", () => {
        exit(server, db);
    });
    process.on("SIGUSR1", () => {
        exit(server, db);
    });
    process.on("SIGUSR2", () => {
        exit(server, db);
    });
};

const exit = async (server, db) => {
    await new Promise(resolve => {
        server.close(error => {
            if (error) {
                console.error(error);
            }
            resolve();
        });
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await db.close();
    console.log(`>>> Server stopped listening at port: ${PORT}`);
};

start();
