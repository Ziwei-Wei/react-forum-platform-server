const mongoose = require("mongoose");

const connectDB = async (dbURI, dbName) => {
    try {
        const dbOption = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            dbName: dbName,
            poolSize: 10
        };
        await mongoose.connect(dbURI, dbOption);
        const db = mongoose.connection;
        return db;
    } catch (error) {
        console.error(error);
        process.exit();
    }
};


module.exports = connectDB;
