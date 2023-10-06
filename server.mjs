
import dotenv from "dotenv"
import create from "./routes/create.mjs";
import upload from "./routes/uplod.mjs"
import finalResult from "./routes/create.mjs"


import express from "express";
const app = express();
const PORT = process.env.PORT || 8001;

dotenv.config()

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

//API
//two rotes for task 1 and 2
app.use("/create",create);
//for task 1
app.use("/upload",upload);


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});