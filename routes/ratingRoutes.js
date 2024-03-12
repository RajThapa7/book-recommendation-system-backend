import { Router } from "express";
import {
  addUserRatingOnBook,
  deleteUserRatingOnBook,
  getAllRatingsOnBook,
} from "../controller/ratingController.js";

const router = Router();

router
  .get("/:userId/:bookId", getAllRatingsOnBook)
  // .get("/:userId/:bookId", getUserRatingOnBook)
  .post("/add", addUserRatingOnBook)
  .delete("/remove", deleteUserRatingOnBook);

export default router;
