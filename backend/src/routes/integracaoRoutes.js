import { Router } from "express";
import { autenticar } from "../middlewares/authMiddleware.js";
import { pool } from "../db.js";

const router = Router();
router.use(autenticar);

router.get("/status", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM integracoes_sponte ORDER BY id DESC LIMIT 1");
    return res.json({
      origem: "Neon/PostgreSQL",
      integracao_futura: "API Sponte",
      registro: result.rows[0] || null,
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
});

export default router;
