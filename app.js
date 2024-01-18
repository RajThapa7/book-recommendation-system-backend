import "dotenv/config";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import authMiddleware from "./middleware/authMiddleware.js";
import corsMiddleware from "./middleware/corsMiddleware.js";
import {
  errorHandlerMiddleware,
  errorLoggerMiddleware,
  invalidPathHandler,
} from "./middleware/errorHandlerMiddleware.js";
import { authRoutes, bookRoutes, listRoutes } from "./routes/index.js";
import("./utils/passport.js");

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "secret",
  })
);

app.use(passport.initialize());
authMiddleware();
app.use(corsMiddleware());

//routes
app.use(authRoutes);
app.use(
  passport.authenticate("jwt", {
    session: false,
  })
);
app.use("/books", bookRoutes);
app.use("/list", listRoutes);

//error handler middleware
app.use(errorLoggerMiddleware);
app.use(errorHandlerMiddleware);
app.use(invalidPathHandler);

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Successfully connected to Database");
    app.listen(4000, () => {
      console.log("server is running on port 4000");
    });
  })
  .catch((err) => console.log(err));
