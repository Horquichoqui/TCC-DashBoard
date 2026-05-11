import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { buscarPorEmail, buscarPorId } from "../repositories/usuarioRepository.js";

export async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  try {
    const usuario = await buscarPorEmail(email);
    if (!usuario) return res.status(401).json({ erro: "Credenciais inválidas" });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) return res.status(401).json({ erro: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno", detalhe: err.message });
  }
}

export async function me(req, res) {
  try {
    const usuario = await buscarPorId(req.usuario.id);
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
    return res.json(usuario);
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno", detalhe: err.message });
  }
}
