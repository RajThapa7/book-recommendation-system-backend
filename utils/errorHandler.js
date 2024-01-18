import AppError from "./appError.js";

const handleDBDuplicateFields = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate Field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const errorHandler = (error) => {
  if (error.message === "TokenExpired") {
    const message = "Token Expired!!!";
    return new AppError(message, 401);
  }
  if (error.name === "AuthenticationError") {
    const message = "Unauthorized!!!";
    return new AppError(message, 401);
  }
  if (error.message === "Incorrect email") {
    const message = "The email is not registered";
    return new AppError(message, 400);
  }
  if (error.message === "Incorrect password") {
    const message = "Incorrect password";
    return new AppError(message, 400);
  }

  if (error.name === "CastError") {
    const message =
      "Record doesn't exists for the given id or the id is invalid";
    return new AppError(message, 400);
    errorObj.isOperational = false;
  }

  if (error.name === "ValidationError") {
    return new AppError(error.message, 400);
  }

  if (error.code === 11000) {
    return handleDBDuplicateFields(error);
  }

  return new AppError(error.message, 400);

  if (error.message.includes("user validation failed")) {
    Object.values(error.errors).forEach((item) => {
      errorObj[item.path] = item.properties.message;
    });
  }
};

export default errorHandler;
