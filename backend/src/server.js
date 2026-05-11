// Servidor Express principal
// Responsável por: API REST + servir o frontend React em produção
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import { testConnection } from "./db.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import alunoRoutes from "./routes/alunoRoutes.js";
import turmaRoutes from "./routes/turmaRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import databaseRoutes from "./routes/databaseRoutes.js";
import integracaoRoutes from "./routes/integracaoRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Origens permitidas no CORS (desenvolvimento local)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Segurança HTTP básica com Helmet
app.use(helmet({ contentSecurityPolicy: false }));

// CORS: em produção usa mesma origem, em dev libera localhost:5173
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? true : allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// --- Rotas da API ---
// As rotas /api devem ser registradas ANTES do frontend estático
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alunos", alunoRoutes);
app.use("/api/turmas", turmaRoutes);
app.use("/api/relatorios", relatorioRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/integracao-sponte", integracaoRoutes);

// --- Frontend React em produção ---
// O Render executa apenas o backend. O frontend compilado fica em frontend/dist
// O Express serve esses arquivos estáticos para qualquer rota que não seja /api
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../../frontend/dist");

  app.use(express.static(frontendDistPath));

  // Redireciona qualquer rota não encontrada para o index.html (SPA)
  // Evita 404 ao recarregar /dashboard ou /alunos-risco no navegador
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use(errorMiddleware);

// Inicia o servidor e testa conexão com o banco Neon
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || "development"}`);
  try {
    await testConnection();
  } catch (err) {
    console.error("⚠️  Servidor iniciado mas banco não conectado:", err.message);
  }
});
