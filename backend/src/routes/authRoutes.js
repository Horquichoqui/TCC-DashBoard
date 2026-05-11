import { Router } from "express";
import { login, me } from "../controllers/authController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();
router.post("/login", login);
router.get("/me", autenticar, me);
export default router;
