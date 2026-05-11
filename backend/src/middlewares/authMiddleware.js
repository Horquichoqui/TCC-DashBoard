// Middleware de autenticação JWT
// Todas as rotas protegidas passam por aqui antes de chegar ao controller
import jwt from "jsonwebtoken";

export function autenticar(req, res, next) {
  // Lê o cabeçalho Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Valida o token usando a chave secreta definida em JWT_SECRET
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Adiciona os dados do usuário na requisição para uso nos controllers
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}
