import React from "react";

export default function StatCard({ titulo, valor, icone, cor = "blue" }) {
  const cores = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{titulo}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{valor ?? "-"}</p>
        </div>
        {icone && (
          <div className={`text-3xl p-3 rounded-lg ${cores[cor]}`}>{icone}</div>
        )}
      </div>
    </div>
  );
}
