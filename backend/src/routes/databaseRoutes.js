// Rotas de inspeção do banco - usar apenas em desenvolvimento
// AVISO: Remover ou proteger antes de colocar em produção pública
import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
});

router.get("/tables/:table/columns", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [req.params.table]);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
});

router.get("/tables/:table/sample", async (req, res) => {
  try {
    const table = req.params.table.replace(/[^a-z_]/gi, "");
    const result = await pool.query(`SELECT * FROM ${table} LIMIT 10`);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
});

export default router;
