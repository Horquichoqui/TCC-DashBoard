// ============================================================
// TELA DE PERFIL — Perfil.jsx
// ============================================================
// Exibe os dados do usuário logado: nome, e-mail, perfil e
// data de criação da conta. Os dados vêm do endpoint /auth/me.
// ============================================================

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import Loading from "../components/Loading.jsx";
import api from "../services/api.js";

export default function Perfil() {
  const [usuario,    setUsuario]    = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Busca os dados do usuário logado ao carregar a tela
  useEffect(() => {
    api.get("/auth/me")
      .then((r) => setUsuario(r.data))
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header titulo="Meu Perfil" />
        <main className="flex-1 p-6 space-y-6">

          {carregando ? <Loading /> : !usuario ? (
            <p className="text-gray-500">Não foi possível carregar os dados do perfil.</p>
          ) : (
            <>
              {/* Avatar e nome do usuário */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-4xl select-none">
                  👤
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{usuario.nome}</h2>
                  <p className="text-gray-500 text-sm mt-1">{usuario.email}</p>
                  <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                    {usuario.perfil}
                  </span>
                </div>
              </div>

              {/* Detalhes da conta */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dados da Conta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Nome completo</p>
                    <p className="font-semibold text-gray-800">{usuario.nome}</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">E-mail</p>
                    <p className="font-semibold text-gray-800">{usuario.email}</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Perfil de acesso</p>
                    <p className="font-semibold text-gray-800 capitalize">{usuario.perfil}</p>
                  </div>

                  {usuario.criado_em && (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">Membro desde</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(usuario.criado_em).toLocaleDateString("pt-BR", {
                          day: "2-digit", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nota informativa sobre permissões */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Permissões</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                  <p>
                    Seu perfil é <strong className="capitalize">{usuario.perfil}</strong>.
                    {usuario.perfil === "coordenador" && (
                      " Como coordenador, você tem acesso completo ao dashboard pedagógico, podendo visualizar turmas, alunos em risco e indicadores de desempenho."
                    )}
                    {usuario.perfil === "professor" && (
                      " Como professor, você pode acompanhar o desempenho e a frequência dos alunos das turmas vinculadas."
                    )}
                    {usuario.perfil === "admin" && (
                      " Como administrador, você tem acesso total ao sistema, incluindo configurações e gerenciamento de usuários."
                    )}
                  </p>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
