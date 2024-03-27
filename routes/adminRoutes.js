import { Router } from "express";
import {
  addBook,
  deleteBook,
  editBook,
} from "../controller/adminController.js";

const router = Router();

router
  .post("/book/add", addBook)
  .delete("/book/delete/:bookId", deleteBook)
  .patch("/book/edit", editBook);

export default router;
