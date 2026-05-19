import React from 'react';
import '../styles/SponteStatusCard.css';

/**
 * Card que exibe o status da integração Sponte
 * Mostra: Configuração, Modo, Última sincronização, etc.
 */
export default function SponteStatusCard({ status, loading }) {
  if (loading) {
    return (
      <div className="status-card loading">
        <div className="spinner"></div>
        <p>Carregando status...</p>
      </div>
    );
  }

  return (
    <div className="status-card">
      <div className="status-header">
        <h3>Status da Integração Sponte</h3>
        <span className={`status-badge ${status?.configurado ? 'configurado' : 'pendente'}`}>
          {status?.configurado ? '✓ Configurado' : '⚠ Não configurado'}
        </span>
      </div>

      <div className="status-grid">
        <div className="status-item">
          <label>Configuração</label>
          <p>{status?.configurado ? 'Ativa' : 'Pendente'}</p>
        </div>

        <div className="status-item">
          <label>Modo</label>
          <p>
            {status?.modo === 'real' ? '🔌 Real' : '🎭 Demonstração'}
          </p>
        </div>

        <div className="status-item">
          <label>Token</label>
          <p>{status?.tokenConfigurado ? 'Configurado ✓' : 'Não configurado'}</p>
        </div>

        <div className="status-item">
          <label>Última sincronização</label>
          <p>
            {status?.ultimaSincronizacao
              ? new Date(status.ultimaSincronizacao).toLocaleString('pt-BR')
              : 'Nunca'}
          </p>
        </div>
      </div>

      {status?.aviso && (
        <div className="status-aviso">
          <span>ℹ️</span>
          <p>{status.aviso}</p>
        </div>
      )}

      <div className="status-footer">
        <small>Endpoint: {status?.endpoint}</small>
      </div>
    </div>
  );
}
