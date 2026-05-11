import React from "react";

export default function FilterBar({ filtros, onChange, opcoesTurmas = [], opcoesDisciplinas = [], opcoesPeriodos = [] }) {
  function handle(e) {
    onChange({ ...filtros, [e.target.name]: e.target.value });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Turma</label>
        <select name="turma_id" value={filtros.turma_id || ""} onChange={handle}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="">Todas as turmas</option>
          {opcoesTurmas.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
      </div>

      {opcoesDisciplinas.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Disciplina</label>
          <select name="disciplina_id" value={filtros.disciplina_id || ""} onChange={handle}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Todas</option>
            {opcoesDisciplinas.map((d) => (
              <option key={d.id} value={d.id}>{d.nome}</option>
            ))}
          </select>
        </div>
      )}

      {opcoesPeriodos.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Período</label>
          <select name="periodo_id" value={filtros.periodo_id || ""} onChange={handle}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Todos</option>
            {opcoesPeriodos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Situação</label>
        <select name="situacao" value={filtros.situacao || ""} onChange={handle}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="">Todas</option>
          <option value="Risco">Risco</option>
          <option value="Atenção">Atenção</option>
          <option value="Regular">Regular</option>
        </select>
      </div>
    </div>
  );
}
