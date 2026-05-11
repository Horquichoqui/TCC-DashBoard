export function formatarNota(nota) {
  if (nota === null || nota === undefined) return "-";
  return Number(nota).toFixed(1);
}

export function formatarFrequencia(freq) {
  if (freq === null || freq === undefined) return "-";
  return `${Number(freq).toFixed(1)}%`;
}

export function formatarData(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
}
