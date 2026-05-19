import React from 'react';
import '../styles/SponteSyncLogTable.css';

/**
 * Tabela de logs de sincronização do Sponte
 * Exibe data, tipo, status e mensagem de cada sincronização
 */
export default function SponteSyncLogTable({ logs, loading }) {
  if (loading) {
    return (
      <div className="logs-container loading">
        <div className="spinner"></div>
        <p>Carregando logs...</p>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="logs-container empty">
        <p>📋 Nenhum log de sincronização ainda</p>
      </div>
    );
  }

  return (
    <div className="logs-container">
      <h3>Histórico de Sincronizações</h3>

      <div className="logs-table-wrapper">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Mensagem</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className={`log-${log.status.toLowerCase()}`}>
                <td className="data">
                  {new Date(log.criado_em).toLocaleString('pt-BR')}
                </td>
                <td className="tipo">
                  <span className="badge">{log.tipo}</span>
                </td>
                <td className="status">
                  <span className={`status-${log.status.toLowerCase()}`}>
                    {log.status === 'SUCESSO' && '✓'}
                    {log.status === 'ERRO' && '✕'}
                    {log.status === 'INFO' && 'ℹ'}
                    {' '} {log.status}
                  </span>
                </td>
                <td className="mensagem">{log.mensagem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
