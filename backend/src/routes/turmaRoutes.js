import { Router } from "express";
import { autenticar } from "../middlewares/authMiddleware.js";
import { listar, detalhe } from "../controllers/turmaController.js";

const router = Router();
router.use(autenticar);
router.get("/", listar);
router.get("/:id", detalhe);
export default router;
