import { Router } from "express";
import {
  getAllBookList,
  getBookById,
  getBookRecommendation,
  getBookRecommendationForSavedList,
  getRelatedBooks,
  getRelatedBooksFromSavedListCosineSimilarity,
  searchBookList,
} from "../controller/bookController.js";

const router = Router();

router
  .get("/", getAllBookList)
  .get("/search", searchBookList)
  .get("/recommendations/:userId", getBookRecommendation)
  .post("/related", getRelatedBooks)
  .get("/:bookId", getBookById)
  .post("/recommendations/list", getBookRecommendationForSavedList)
  .post(
    "/related/cosineSimilarity",
    getRelatedBooksFromSavedListCosineSimilarity
  );

export default router;
