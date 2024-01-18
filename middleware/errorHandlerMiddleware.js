import errorHandler from "../utils/errorHandler.js";

//handling error in production
const sendProdError = (err, res) => {
  // If the error is operational, send error details to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // If the error is unknown, don't leak error details
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

//error to send in development mode
const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//logging the error
const errorLoggerMiddleware = (err, req, res, next) => {
  console.log(err);
  next(err); //passes to the next middleware
};

//middleware for handling the error
const errorHandlerMiddleware = (err, req, res, next) => {
  const error = errorHandler(err);

  if (process.env.NODE_ENV === "development") {
    sendDevError(error, res);
  } else {
    sendProdError(error, res);
  }
};

//for handling route not found error
const invalidPathHandler = (req, res, next) => {
  res
    .status(404)
    .json({ err: `Method ${req.method} is not available on path ${req.path}` });
};

export { errorHandlerMiddleware, errorLoggerMiddleware, invalidPathHandler };
