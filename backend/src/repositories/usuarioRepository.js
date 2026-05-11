// Repository de usuários: consultas SQL relacionadas à tabela usuarios
import { pool } from "../db.js";

export async function buscarPorEmail(email) {
  const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
  return result.rows[0] || null;
}

export async function buscarPorId(id) {
  const result = await pool.query("SELECT id, nome, email, perfil FROM usuarios WHERE id = $1", [id]);
  return result.rows[0] || null;
}
