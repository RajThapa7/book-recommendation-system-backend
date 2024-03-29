import jwt from "jwt-simple";
import AppError from "../utils/appError.js";

const adminAuthMiddleware = (req, res, next) => {
  if (!req.headers["authorization"]) {
    throw new AppError("unauthenticated", 401);
  }
  const accessToken = req.headers["authorization"].split(" ")[1];

  const decoded = jwt.decode(accessToken, process.env.JWT_SECRET);
  if (decoded.expire <= Date.now()) {
    throw new AppError("Token Expired", 401);
  }
  if (!decoded.isAdmin) {
    throw new AppError("Forbidden: Access Denied!", 403);
  }
  next();
};

export { adminAuthMiddleware };
