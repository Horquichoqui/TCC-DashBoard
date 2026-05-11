import React from "react";

export default function DataTable({ colunas, dados, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {colunas.map((col) => (
              <th key={col.key} className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((linha, i) => (
            <tr
              key={i}
              onClick={() => onRowClick && onRowClick(linha)}
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {colunas.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700">
                  {col.render ? col.render(linha) : linha[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
