import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/alunos-risco", label: "Alunos em Risco", icon: "⚠️" },
  { to: "/turmas", label: "Turmas", icon: "🏫" },
  { to: "/integracao-sponte", label: "Integração Sponte", icon: "🔗" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  }

  return (
    <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-lg font-bold leading-tight">Dashboard Pedagógico</h1>
        <p className="text-blue-300 text-sm mt-1">Coopen</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <button
          onClick={sair}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
        >
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  );
}
