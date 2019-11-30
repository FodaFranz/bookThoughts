
import express from "express";
import config from "./build/config.json";

import seriesRouter from "./routes/seriesRoutes";
import bookRouter from "./routes/bookRoutes";

import mongoose  from "mongoose";

const app = express();

const port:Number = config.web.port || 5000;
const dbUrl:string = config.database.url;

app.use(express.urlencoded());
app.use(express.json());

mongoose.connect(dbUrl, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    keepAlive: true
});

app.use("/series", seriesRouter);
app.use("/books", bookRouter);

app.listen(port, () => {
    console.log(`Server listening on Port ${port}`);
})