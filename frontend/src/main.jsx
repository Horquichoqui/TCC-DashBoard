// ============================================================
// PONTO DE ENTRADA DO REACT — main.jsx
// ============================================================
// Este é o primeiro arquivo executado pelo React.
// Ele monta o componente App dentro da div #root do index.html.
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Estilos globais com Tailwind CSS

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
