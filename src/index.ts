import express from "express";
import mongoose from "mongoose";
import { userRouter } from "./routes/user/user";
import dotenv from "dotenv";
import { checkToken, handleError } from "./utils/middleware";

dotenv.config();
const app = express();
app.use(express.json());

app.use(checkToken);

app.use("/user", userRouter);
app.use(handleError);

mongoose.connect(
    process.env.MONGO_URL!,
    { dbName: process.env.MONGO_DB },
    (err) => {
        if (err) return console.log(err);
        app.listen(3000, () => {
            console.log("app started");
        });
    }
);
