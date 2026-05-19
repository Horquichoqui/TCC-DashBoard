import React, { useState, useEffect } from 'react';
import sponteApi from '../services/sponteApi';
import SponteStatusCard from '../components/SponteStatusCard';
import SponteSyncLogTable from '../components/SponteSyncLogTable';
import '../styles/IntegracaoSponte.css';

/**
 * Página de Integração com o Sponte
 *
 * Responsável por:
 * 1. Exibir status da integração
 * 2. Configurar CodigoCliente e Token
 * 3. Testar conexão com o Sponte
 * 4. Sincronizar dados (turmas, alunos, boletins)
 * 5. Exibir logs de sincronização
 */
export default function IntegracaoSponte() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testando, setTestando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  // Formulário
  const [codigoCliente, setCodigoCliente] = useState('');
  const [token, setToken] = useState('');
  const [modoMock, setModoMock] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Carregar status e logs ao montar
  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [statusResp, logsResp] = await Promise.all([
        sponteApi.getStatus(),
        sponteApi.getLogs(50),
      ]);

      setStatus(statusResp.data);
      setLogs(logsResp.data || []);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao carregar dados do Sponte',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvarConfiguracao(e) {
    e.preventDefault();

    if (!codigoCliente || !token) {
      setMensagem({
        tipo: 'erro',
        texto: 'CodigoCliente e Token são obrigatórios',
      });
      return;
    }

    try {
      setSalvando(true);
      const response = await sponteApi.saveConfig(codigoCliente, token, modoMock);

      if (response.success) {
        setMensagem({
          tipo: 'sucesso',
          texto: 'Configuração salva com sucesso!',
        });

        // Limpar formulário
        setToken('');
        setCodigoCliente('');

        // Recarregar status
        await carregarDados();
      }
    } catch (erro) {
      console.error('Erro ao salvar configuração:', erro);
      setMensagem({
        tipo: 'erro',
        texto: erro.response?.data?.error || 'Erro ao salvar configuração',
      });
    } finally {
      setSalvando(false);
    }
  }

  async function handleTestarConexao() {
    try {
      setTestando(true);
      const response = await sponteApi.testConnection();

      if (response.success) {
        setMensagem({
          tipo: 'sucesso',
          texto: '✓ Conexão com o Sponte testada com sucesso!',
        });
      }
    } catch (erro) {
      console.error('Erro ao testar conexão:', erro);
      setMensagem({
        tipo: 'erro',
        texto: erro.response?.data?.error || 'Erro ao conectar com o Sponte',
      });
    } finally {
      setTestando(false);
      await carregarDados();
    }
  }

  async function handleSincronizarTurmas() {
    try {
      setSincronizando(true);
      setMensagem({
        tipo: 'info',
        texto: 'Sincronizando turmas...',
      });

      const response = await sponteApi.syncTurmas();
      if (response.success) {
        setMensagem({
          tipo: 'sucesso',
          texto: `✓ Turmas sincronizadas! ${response.data.totalInserido} inseridas, ${response.data.totalAtualizado} atualizadas.`,
        });
      }
    } catch (erro) {
      console.error('Erro ao sincronizar turmas:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao sincronizar turmas',
      });
    } finally {
      setSincronizando(false);
      await carregarDados();
    }
  }

  async function handleSincronizarAlunos() {
    try {
      setSincronizando(true);
      setMensagem({
        tipo: 'info',
        texto: 'Sincronizando alunos...',
      });

      const response = await sponteApi.syncAlunos();
      if (response.success) {
        setMensagem({
          tipo: 'sucesso',
          texto: `✓ Alunos sincronizados! ${response.data.totalInserido} inseridos, ${response.data.totalAtualizado} atualizados.`,
        });
      }
    } catch (erro) {
      console.error('Erro ao sincronizar alunos:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao sincronizar alunos',
      });
    } finally {
      setSincronizando(false);
      await carregarDados();
    }
  }

  async function handleSincronizarBoletins() {
    try {
      setSincronizando(true);
      setMensagem({
        tipo: 'info',
        texto: 'Sincronizando notas e frequências...',
      });

      const response = await sponteApi.syncBoletins();
      if (response.success) {
        setMensagem({
          tipo: 'sucesso',
          texto: `✓ Boletins sincronizados! ${response.data.totalInserido} inseridos, ${response.data.totalAtualizado} atualizados.`,
        });
      }
    } catch (erro) {
      console.error('Erro ao sincronizar boletins:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao sincronizar boletins',
      });
    } finally {
      setSincronizando(false);
      await carregarDados();
    }
  }

  async function handleSincronizarCompleta() {
    try {
      setSincronizando(true);
      setMensagem({
        tipo: 'info',
        texto: 'Sincronizando tudo (turmas, alunos, boletins)...',
      });

      const response = await sponteApi.syncCompleta();
      if (response.success) {
        setMensagem({
          tipo: 'sucesso',
          texto: '✓ Sincronização completa realizada com sucesso!',
        });
      }
    } catch (erro) {
      console.error('Erro na sincronização completa:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro na sincronização',
      });
    } finally {
      setSincronizando(false);
      await carregarDados();
    }
  }

  return (
    <div className="integracao-sponte-page">
      <div className="header-integracao">
        <h1>🔌 Integração com Sponte Educacional</h1>
        <p>
          O Sponte é o sistema de gestão acadêmica que alimenta o dashboard pedagógico.
          Configure as credenciais abaixo para sincronizar alunos, turmas, notas e frequências.
        </p>
      </div>

      {/* Mensagem de Status */}
      {mensagem && (
        <div className={`mensagem mensagem-${mensagem.tipo}`}>
          {mensagem.texto}
          <button
            className="fechar-mensagem"
            onClick={() => setMensagem(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Card de Status */}
      <SponteStatusCard status={status} loading={loading} />

      {/* Seção de Configuração */}
      <section className="secao-configuracao">
        <h2>⚙️ Configuração de Credenciais</h2>

        <form onSubmit={handleSalvarConfiguracao} className="forma-configuracao">
          <div className="form-group">
            <label htmlFor="codigo">CodigoCliente Sponte</label>
            <input
              id="codigo"
              type="text"
              value={codigoCliente}
              onChange={(e) => setCodigoCliente(e.target.value)}
              placeholder="Exemplo: COOPEN123"
              disabled={salvando}
            />
            <small>ID fornecido pelo Sponte para sua instituição</small>
          </div>

          <div className="form-group">
            <label htmlFor="token">Token Sponte</label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Cole seu token aqui"
              disabled={salvando}
            />
            <small>Token será criptografado antes de salvar</small>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={modoMock}
                onChange={(e) => setModoMock(e.target.checked)}
                disabled={salvando}
              />
              Usar modo demonstração (dados fictícios)
            </label>
            <small>
              Desmarque para conectar diretamente ao Sponte com as credenciais acima
            </small>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={salvando || !codigoCliente || !token}
            >
              {salvando ? '⏳ Salvando...' : '💾 Salvar Configuração'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleTestarConexao}
              disabled={testando || !status?.tokenConfigurado}
            >
              {testando ? '⏳ Testando...' : '🧪 Testar Conexão'}
            </button>
          </div>
        </form>

        {!status?.tokenConfigurado && (
          <div className="alerta alerta-info">
            <span>ℹ️</span>
            <div>
              <strong>Modo Demonstração Ativo</strong>
              <p>
                Enquanto as credenciais reais não forem informadas, o sistema usa dados fictícios
                para demonstração do TCC. Configure o CodigoCliente e Token acima para sincronizar
                com o Sponte real.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Seção de Sincronização */}
      <section className="secao-sincronizacao">
        <h2>📊 Sincronização de Dados</h2>

        <div className="botoes-sync">
          <button
            className="btn btn-sync"
            onClick={handleSincronizarTurmas}
            disabled={sincronizando}
          >
            📚 Sincronizar Turmas
          </button>

          <button
            className="btn btn-sync"
            onClick={handleSincronizarAlunos}
            disabled={sincronizando}
          >
            👥 Sincronizar Alunos
          </button>

          <button
            className="btn btn-sync"
            onClick={handleSincronizarBoletins}
            disabled={sincronizando}
          >
            📋 Sincronizar Boletins
          </button>

          <button
            className="btn btn-sync btn-completa"
            onClick={handleSincronizarCompleta}
            disabled={sincronizando}
          >
            {sincronizando ? '⏳ Sincronizando...' : '🔄 Sincronização Completa'}
          </button>
        </div>

        <p className="info-sincronizacao">
          A sincronização completa importa turmas, alunos, notas e frequências do Sponte
          para o banco de dados local, atualizando o dashboard pedagógico.
        </p>
      </section>

      {/* Tabela de Logs */}
      <section className="secao-logs">
        <SponteSyncLogTable logs={logs} loading={loading} />
      </section>
    </div>
  );
}
