import { Router } from "express";
import {
  getAllBookList,
  getBookById,
  getBookRecommendation,
  getRelatedBooks,
  searchBookList,
} from "../controller/bookController.js";

const router = Router();

router
  .get("/", getAllBookList)
  .get("/search", searchBookList)
  .get("/recommendations/:userId", getBookRecommendation)
  .post("/related", getRelatedBooks)
  .get("/:bookId", getBookById);

export default router;
