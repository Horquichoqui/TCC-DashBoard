// Serviço de integração com o sistema Sponte
// Por enquanto contém funções placeholder para integração futura
// O Sponte é o sistema acadêmico utilizado pela Coopen

/**
 * Busca dados gerais da API Sponte.
 * Integração futura: autenticar na API Sponte e buscar dados.
 */
export async function buscarDadosSponte() {
  console.log("[Sponte] buscarDadosSponte chamado - integração futura");
  return { mensagem: "Integração com API Sponte ainda não implementada. Dados carregados via banco Neon." };
}

/**
 * Sincroniza alunos do Sponte com o banco Neon.
 * Integração futura: buscar lista de alunos via API Sponte e salvar na tabela alunos.
 */
export async function sincronizarAlunos() {
  console.log("[Sponte] sincronizarAlunos chamado - integração futura");
  return { mensagem: "Sincronização de alunos via Sponte não implementada." };
}

/**
 * Sincroniza notas do Sponte com o banco Neon.
 * Integração futura: buscar notas via API Sponte e salvar na tabela notas.
 */
export async function sincronizarNotas() {
  console.log("[Sponte] sincronizarNotas chamado - integração futura");
  return { mensagem: "Sincronização de notas via Sponte não implementada." };
}

/**
 * Sincroniza frequências do Sponte com o banco Neon.
 * Integração futura: buscar frequências via API Sponte e salvar na tabela frequencias.
 */
export async function sincronizarFrequencias() {
  console.log("[Sponte] sincronizarFrequencias chamado - integração futura");
  return { mensagem: "Sincronização de frequências via Sponte não implementada." };
}
