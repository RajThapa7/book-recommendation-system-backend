import { Router } from "express";
import {
  adminLogin,
  registerAdmin,
} from "../controller/adminAuthController.js";

const router = Router();

router.post("/login", adminLogin).post("/register", registerAdmin);

export default router;
