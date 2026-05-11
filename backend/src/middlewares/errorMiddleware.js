// Middleware de tratamento de erros global
export function errorMiddleware(err, req, res, next) {
  console.error("Erro:", err.message);
  res.status(500).json({ erro: "Erro interno do servidor", detalhe: err.message });
}
