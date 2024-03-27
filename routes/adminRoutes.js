import { Router } from "express";
import {
  addBook,
  deleteBook,
  editBook,
  getAllUsers,
} from "../controller/adminController.js";

const router = Router();

router
  .get("/users", getAllUsers)
  .post("/book/add", addBook)
  .delete("/book/delete/:bookId", deleteBook)
  .patch("/book/edit", editBook);

export default router;
