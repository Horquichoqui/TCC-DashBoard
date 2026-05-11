// Dashboard principal: exibe cards de indicadores pedagógicos e gráficos
// Consome dados do backend Express que consulta o banco Neon
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import StatCard from "../components/StatCard.jsx";
import ChartCard from "../components/ChartCard.jsx";
import FilterBar from "../components/FilterBar.jsx";
import Loading from "../components/Loading.jsx";
import api from "../services/api.js";

const CORES_SITUACAO = { Regular: "#22c55e", "Atenção": "#eab308", Risco: "#ef4444" };

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [riscoPorTurma, setRiscoPorTurma] = useState([]);
  const [evolucao, setEvolucao] = useState([]);
  const [freqPorTurma, setFreqPorTurma] = useState([]);
  const [distribuicao, setDistribuicao] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [filtros, setFiltros] = useState({ turma_id: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/turmas").then((r) => setTurmas(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  async function carregarDados() {
    setLoading(true);
    try {
      const params = filtros.turma_id ? { turma_id: filtros.turma_id } : {};
      const [r1, r2, r3, r4, r5] = await Promise.all([
        api.get("/dashboard/resumo", { params }),
        api.get("/dashboard/risco-por-turma"),
        api.get("/dashboard/evolucao-desempenho"),
        api.get("/dashboard/frequencia-por-turma"),
        api.get("/dashboard/distribuicao-situacao"),
      ]);
      setResumo(r1.data);
      setRiscoPorTurma(r2.data);
      setEvolucao(r3.data);
      setFreqPorTurma(r4.data);
      const dist = r5.data;
      setDistribuicao(Object.entries(dist).map(([name, value]) => ({ name, value })));
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1"><Header titulo="Dashboard" /><Loading /></div>
    </div>
  );

  const alunosRiscoCount = riscoPorTurma.reduce((acc, t) => acc + parseInt(t.em_risco || 0), 0);
  const percAbaixoMedia = resumo?.total_alunos > 0
    ? ((alunosRiscoCount / resumo.total_alunos) * 100).toFixed(1)
    : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header titulo="Dashboard" />
        <main className="flex-1 p-6 space-y-6">

          <FilterBar filtros={filtros} onChange={setFiltros} opcoesTurmas={turmas} />

          {/* Cards de indicadores */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard titulo="Total de Alunos" valor={resumo?.total_alunos} icone="👨‍🎓" cor="blue" />
            <StatCard titulo="Alunos em Risco" valor={alunosRiscoCount} icone="⚠️" cor="red" />
            <StatCard titulo="Média Geral" valor={resumo?.media_geral} icone="📝" cor="blue" />
            <StatCard titulo="Frequência Média" valor={resumo?.frequencia_media ? `${resumo.frequencia_media}%` : "-"} icone="📅" cor="green" />
            <StatCard titulo="Turmas" valor={resumo?.total_turmas} icone="🏫" cor="blue" />
            <StatCard titulo="Abaixo da Média" valor={`${percAbaixoMedia}%`} icone="📉" cor="yellow" />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard titulo="Alunos em Risco por Turma">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riscoPorTurma}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="turma" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_alunos" name="Total" fill="#93c5fd" />
                  <Bar dataKey="em_risco" name="Em Risco" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard titulo="Evolução da Média por Período">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="media" name="Média" stroke="#2563eb" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard titulo="Distribuição por Situação">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribuicao} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                    {distribuicao.map((entry, i) => (
                      <Cell key={i} fill={CORES_SITUACAO[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard titulo="Frequência Média por Turma">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={freqPorTurma}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="turma" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="frequencia_media" name="Frequência" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

        </main>
      </div>
    </div>
  );
}
