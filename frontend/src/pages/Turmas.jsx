import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import Loading from "../components/Loading.jsx";
import EmptyState from "../components/EmptyState.jsx";
import api from "../services/api.js";

export default function Turmas() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/turmas").then((r) => setTurmas(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header titulo="Turmas" />
        <main className="flex-1 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? <Loading /> : turmas.length === 0 ? <EmptyState /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-600">Turma</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Ano Letivo</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Turno</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Alunos</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Média</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Frequência</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Em Risco</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turmas.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/alunos-risco?turma_id=${t.id}`)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3 font-medium text-blue-700">{t.nome}</td>
                        <td className="px-4 py-3 text-gray-600">{t.ano_letivo}</td>
                        <td className="px-4 py-3 text-gray-600">{t.turno || "-"}</td>
                        <td className="px-4 py-3">{t.total_alunos}</td>
                        <td className="px-4 py-3 font-semibold">
                          {t.media_turma ? Number(t.media_turma).toFixed(1) : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {t.frequencia_media ? `${Number(t.frequencia_media).toFixed(1)}%` : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {parseInt(t.alunos_em_risco) > 0 ? (
                            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                              {t.alunos_em_risco} em risco
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                              Nenhum
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
