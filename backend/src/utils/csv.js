// Utilitário para geração de CSV simples, sem bibliotecas externas
export function gerarCSV(cabecalho, linhas) {
  const header = cabecalho.join(";");
  const rows = linhas.map((linha) =>
    linha.map((cel) => `"${String(cel ?? "").replace(/"/g, '""')}"`).join(";")
  );
  return [header, ...rows].join("\n");
}
