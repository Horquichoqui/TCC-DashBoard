// Conexão com o banco PostgreSQL hospedado no Neon
// Usa a variável DATABASE_URL definida no .env local ou nas Environment Variables do Render
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

// Verifica se a variável de ambiente foi configurada
if (!process.env.DATABASE_URL) {
  throw new Error(
    "Variável DATABASE_URL não configurada. Configure o arquivo .env local ou as Environment Variables no Render."
  );
}

// Pool de conexões com o banco Neon
// ssl: rejectUnauthorized false é necessário para conexão com Neon
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Testa a conexão com o banco ao iniciar o servidor
export async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    console.log("✅ Banco Neon conectado com sucesso:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar no banco Neon:", error.message);
    throw error;
  }
}
