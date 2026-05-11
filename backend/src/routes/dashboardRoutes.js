import { Router } from "express";
import { autenticar } from "../middlewares/authMiddleware.js";
import {
  resumo, riscoPorTurma, evolucaoDesempenho, frequenciaPorTurma, distribuicaoSituacao
} from "../controllers/dashboardController.js";

const router = Router();
router.use(autenticar);
router.get("/resumo", resumo);
router.get("/risco-por-turma", riscoPorTurma);
router.get("/evolucao-desempenho", evolucaoDesempenho);
router.get("/frequencia-por-turma", frequenciaPorTurma);
router.get("/distribuicao-situacao", distribuicaoSituacao);
export default router;
