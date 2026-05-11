// ============================================================
// TELA DE CONFIGURAÇÕES — Configuracoes.jsx
// ============================================================
// Exibe informações sobre o sistema e os integrantes do TCC.
// ============================================================

import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";

// Lista de integrantes do TCC
const integrantes = [
  { nome: "Vinícius Franco Ferreira",          ra: "RA: 23205519" },
  { nome: "Márcio José Valderrama",            ra: "RA: 23203273" },
  { nome: "Gabriel Pereira Job",               ra: "RA: 23221644" },
  { nome: "André Henrique Torres de Araújo",   ra: "RA: 23207674" },
  { nome: "Benício Rogério de Oliveira",       ra: "RA: 23223433" },
  { nome: "Filipe Cunha de Sousa",             ra: "RA: 23217763" },
  { nome: "Tatiane Rodrigues Tiburcio",        ra: "RA: 23203768" },
  { nome: "Mateus Vinicius dos Santos Souza",  ra: "RA: 23218131" },
];

export default function Configuracoes() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header titulo="Configurações" />

        <main className="flex-1 p-6 space-y-6">

          {/* Sobre o Sistema */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sobre o Sistema</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <span className="font-medium">Sistema:</span> Dashboard Pedagógico Coopen
              </li>
              <li>
                <span className="font-medium">Tutora:</span> Julia Leite Lumini
              </li>
              <li>
                <span className="font-medium">Curso:</span> Ciência de Dados, Engenharia da Computação e TI
              </li>
            </ul>
          </section>

          {/* Integrantes do TCC */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Integrantes do TCC</h2>
            <ul className="divide-y divide-gray-100">
              {integrantes.map((integrante) => (
                <li
                  key={integrante.ra}
                  className="py-3 flex justify-between items-center"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {integrante.nome}
                  </span>
                  <span className="text-xs text-gray-500">{integrante.ra}</span>
                </li>
              ))}
            </ul>
          </section>

        </main>
      </div>
    </div>
  );
}
