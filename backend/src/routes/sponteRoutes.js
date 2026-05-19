import express from "express";
import * as sponteController from "../controllers/sponteController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Rotas de integração com o Sponte
 * Todas requerem autenticação JWT
 */

// Obter status da integração
router.get("/status", authMiddleware, sponteController.getStatus);

// Salvar configuração (CodigoCliente e Token)
router.post("/configuracao", authMiddleware, sponteController.salvarConfiguracao);

// Testar conexão
router.post("/testar-conexao", authMiddleware, sponteController.testarConexao);

// Sincronizar turmas
router.post("/sincronizar/turmas", authMiddleware, sponteController.sincronizarTurmas);

// Sincronizar alunos
router.post("/sincronizar/alunos", authMiddleware, sponteController.sincronizarAlunos);

// Sincronizar boletins (notas e frequências)
router.post("/sincronizar/boletins", authMiddleware, sponteController.sincronizarBoletins);

// Sincronização completa
router.post("/sincronizar/completa", authMiddleware, sponteController.sincronizarCompleta);

// Listar logs de sincronização
router.get("/logs", authMiddleware, sponteController.listarLogs);

export default router;
