import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ status: "ok", database: "connected", message: "Backend conectado ao Neon" });
  } catch (err) {
    return res.status(500).json({ status: "error", database: "disconnected", message: err.message });
  }
});

export default router;
