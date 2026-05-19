-- Tabela de configuracao do Sponte
CREATE TABLE IF NOT EXISTS sponte_configuracoes (
  id SERIAL PRIMARY KEY,
  codigo_cliente VARCHAR(100),
  token_criptografado TEXT,
  endpoint VARCHAR(255) NOT NULL DEFAULT 'https://api.sponteeducacional.net.br/WSAPIEdu.asmx?WSDL',
  modo_mock BOOLEAN NOT NULL DEFAULT TRUE,
  ativo BOOLEAN NOT NULL DEFAULT FALSE,
  ultima_sincronizacao TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de sincronizacao
CREATE TABLE IF NOT EXISTS sponte_logs (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(80) NOT NULL,
  status VARCHAR(30) NOT NULL,
  mensagem TEXT,
  detalhes JSONB,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de controle de sincronizacoes
CREATE TABLE IF NOT EXISTS sponte_sincronizacoes (
  id SERIAL PRIMARY KEY,
  entidade VARCHAR(80) NOT NULL,
  status VARCHAR(30) NOT NULL,
  total_recebido INT DEFAULT 0,
  total_inserido INT DEFAULT 0,
  total_atualizado INT DEFAULT 0,
  total_erros INT DEFAULT 0,
  mensagem TEXT,
  iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finalizado_em TIMESTAMP
);

-- Tabela de mapeamento entre IDs locais e do Sponte
CREATE TABLE IF NOT EXISTS sponte_mapeamentos (
  id SERIAL PRIMARY KEY,
  entidade VARCHAR(80) NOT NULL,
  sponte_id VARCHAR(100) NOT NULL,
  local_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entidade, sponte_id)
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_sponte_logs_tipo ON sponte_logs(tipo);
CREATE INDEX IF NOT EXISTS idx_sponte_logs_criado ON sponte_logs(criado_em);
CREATE INDEX IF NOT EXISTS idx_sponte_sincronizacoes_entidade ON sponte_sincronizacoes(entidade);
CREATE INDEX IF NOT EXISTS idx_sponte_mapeamentos_entidade ON sponte_mapeamentos(entidade);
