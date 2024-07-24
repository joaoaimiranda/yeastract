import createError from "http-errors";
import express, { json, urlencoded } from "express";
import { static as expressStatic } from "express";
import { join } from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";

import associationsRouter from "./routes/associations.js";
import seqRouter from "./routes/seq.js";
import utilsRouter from "./routes/utils.js";
import infoRouter from "./routes/information.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use(cors());
app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressStatic(join(__dirname, "public")));

app.use("/associations", associationsRouter);
app.use("/seq", seqRouter);
app.use("/utils", utilsRouter);
app.use("/info", infoRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send("error");
});

export default app;
