import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AlunosRisco from "./pages/AlunosRisco.jsx";
import Turmas from "./pages/Turmas.jsx";
import DetalheAluno from "./pages/DetalheAluno.jsx";
import IntegracaoSponte from "./pages/IntegracaoSponte.jsx";
import Perfil from "./pages/Perfil.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";

function RotaProtegida({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard"          element={<RotaProtegida><Dashboard /></RotaProtegida>} />
        <Route path="/alunos-risco"       element={<RotaProtegida><AlunosRisco /></RotaProtegida>} />
        <Route path="/turmas"             element={<RotaProtegida><Turmas /></RotaProtegida>} />
        <Route path="/alunos/:id"         element={<RotaProtegida><DetalheAluno /></RotaProtegida>} />
        <Route path="/integracao-sponte"  element={<RotaProtegida><IntegracaoSponte /></RotaProtegida>} />
        <Route path="/perfil"             element={<RotaProtegida><Perfil /></RotaProtegida>} />
        <Route path="/configuracoes"      element={<RotaProtegida><Configuracoes /></RotaProtegida>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
