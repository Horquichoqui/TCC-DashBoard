// Tela de alunos em risco: lista alunos com situação Risco ou Atenção
// Permite filtros por turma e situação, e exportação CSV
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import FilterBar from "../components/FilterBar.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import Loading from "../components/Loading.jsx";
import EmptyState from "../components/EmptyState.jsx";
import api from "../services/api.js";

export default function AlunosRisco() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [filtros, setFiltros] = useState({ turma_id: "", situacao: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/turmas").then((r) => setTurmas(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    carregarAlunos();
  }, [filtros]);

  async function carregarAlunos() {
    setLoading(true);
    try {
      const params = {};
      if (filtros.turma_id) params.turma_id = filtros.turma_id;
      const { data } = await api.get("/alunos/risco", { params });
      setAlunos(filtros.situacao ? data.filter((a) => a.situacao === filtros.situacao) : data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function exportarCSV() {
    const params = new URLSearchParams();
    if (filtros.turma_id) params.set("turma_id", filtros.turma_id);
    const token = localStorage.getItem("token");
    const url = `${import.meta.env.VITE_API_URL || "/api"}/relatorios/alunos-risco/exportar?${params}`;
    // Cria link temporário para download com autenticação via fetch
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "alunos_em_risco.csv";
        a.click();
      });
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header titulo="Alunos em Risco" />
        <main className="flex-1 p-6 space-y-4">

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <FilterBar filtros={filtros} onChange={setFiltros} opcoesTurmas={turmas} />
            <button
              onClick={exportarCSV}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              📥 Exportar CSV
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">{alunos.length} alunos encontrados</p>
            </div>

            {loading ? (
              <Loading />
            ) : alunos.length === 0 ? (
              <EmptyState mensagem="Nenhum aluno em risco encontrado com os filtros selecionados." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-600">Nome</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Matrícula</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Turma</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Média</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Frequência</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Situação</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Motivo</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map((a) => (
                      <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{a.nome}</td>
                        <td className="px-4 py-3 text-gray-500">{a.matricula}</td>
                        <td className="px-4 py-3 text-gray-600">{a.turma}</td>
                        <td className="px-4 py-3 font-semibold">{Number(a.media_geral).toFixed(1)}</td>
                        <td className="px-4 py-3">{Number(a.frequencia_media).toFixed(1)}%</td>
                        <td className="px-4 py-3"><RiskBadge situacao={a.situacao} /></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{a.motivo}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/alunos/${a.id}`)}
                            className="text-blue-600 hover:underline text-xs font-medium"
                          >
                            Ver detalhes
                          </button>
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
