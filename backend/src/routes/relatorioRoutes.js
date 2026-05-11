import { Router } from "express";
import { autenticar } from "../middlewares/authMiddleware.js";
import { exportarAlunosRisco } from "../controllers/relatorioController.js";

const router = Router();
router.use(autenticar);
router.get("/alunos-risco/exportar", exportarAlunosRisco);
export default router;
