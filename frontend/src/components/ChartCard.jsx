import React from "react";

export default function ChartCard({ titulo, children, altura = "h-64" }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-700 mb-4">{titulo}</h3>
      <div className={altura}>{children}</div>
    </div>
  );
}
