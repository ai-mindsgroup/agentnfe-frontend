import React, { useState } from 'react';
import { validateCFOP } from '../services/apiService';

const CFOPValidator = () => {
  const [cfop, setCfop] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (cfop.length !== 4) {
      setError('CFOP deve ter exatamente 4 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const validationResult = await validateCFOP(cfop);
      setResult(validationResult);
    } catch (err) {
      setError('Erro ao conectar com o backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      maxWidth: '500px',
      margin: '20px auto'
    }}>
      <h2>🔍 Validador de CFOP</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          value={cfop}
          onChange={(e) => setCfop(e.target.value.replace(/\D/g, ''))}
          placeholder="Digite o CFOP (4 dígitos)"
          maxLength={4}
          style={{ 
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '150px',
            marginRight: '10px'
          }}
        />
        
        <button 
          onClick={handleValidate} 
          disabled={loading || cfop.length !== 4}
          style={{ 
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Validando...' : '✅ Validar CFOP'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          border: '1px solid #ffcdd2',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: result.valido ? '#e8f5e8' : '#fff3e0',
          border: `1px solid ${result.valido ? '#c8e6c9' : '#ffe0b2'}`,
          borderRadius: '4px'
        }}>
          <h3>📊 Resultado da Validação:</h3>
          <p><strong>CFOP:</strong> {result.cfop}</p>
          <p>
            <strong>Status:</strong> 
            <span style={{ color: result.valido ? '#2e7d32' : '#f57c00', fontWeight: 'bold' }}>
              {result.valido ? ' ✅ VÁLIDO' : ' ⚠️ INVÁLIDO'}
            </span>
          </p>
          
          {result.valido && (
            <div>
              <p><strong>Natureza:</strong> {result.natureza}</p>
              <p><strong>Descrição:</strong> {result.descricao_grupo}</p>
              <p><strong>Destino:</strong> {result.destino}</p>
              {result.tributacao && (
                <div>
                  <p><strong>Tributação:</strong></p>
                  <ul>
                    <li>Tipo: {result.tributacao.tipo}</li>
                    <li>Gera crédito: {result.tributacao.gera_credito ? 'Sim' : 'Não'}</li>
                    <li>Gera débito: {result.tributacao.gera_debito ? 'Sim' : 'Não'}</li>
                    <li>ICMS: {result.tributacao.icms}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {result.erro && (
            <p style={{ color: '#d32f2f' }}><strong>Erro:</strong> {result.erro}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CFOPValidator;