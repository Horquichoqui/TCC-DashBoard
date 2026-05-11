import { Router } from "express";
import { autenticar } from "../middlewares/authMiddleware.js";
import { listar, listarRisco, detalhe } from "../controllers/alunoController.js";

const router = Router();
router.use(autenticar);
router.get("/", listar);
router.get("/risco", listarRisco);
router.get("/:id", detalhe);
export default router;
