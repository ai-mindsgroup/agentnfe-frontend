import React, { useState } from 'react';
import axiosInstance from '@/lib/axios'; // Importe sua instância do axios

const CFOPValidator = () => {
  const [cfop, setCfop] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Função para validar CFOP usando o backend Python
  const validateCFOP = async (cfopCode) => {
    try {
      const response = await axiosInstance.post('/api/validar-cfop', {
        cfop: cfopCode
      });
      return response.data;
    } catch (error) {
      console.error('Erro na validação CFOP:', error);
      
      // Tratamento de erros específicos
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Backend Python não está respondendo. Verifique se o servidor está rodando na porta 8000.');
      }
      
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      if (error.response?.status === 422) {
        throw new Error('CFOP inválido. Deve conter exatamente 4 dígitos.');
      }
      
      throw new Error(error.response?.data?.error || error.message || 'Erro desconhecido');
    }
  };

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  const clearResults = () => {
    setResult(null);
    setError('');
    setCfop('');
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '20px auto',
      backgroundColor: '#fafafa'
    }}>
      <h2 style={{ 
        marginBottom: '20px', 
        color: '#1976d2',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '24px' }}>🔍</span>
        Validador de CFOP
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={cfop}
            onChange={(e) => setCfop(e.target.value.replace(/\D/g, ''))}
            onKeyPress={handleKeyPress}
            placeholder="Digite o CFOP (4 dígitos)"
            maxLength={4}
            style={{ 
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              width: '120px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          />
          
          <button 
            onClick={handleValidate} 
            disabled={loading || cfop.length !== 4}
            style={{ 
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: loading ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!loading && cfop.length === 4) {
                e.target.style.backgroundColor = '#1565c0';
              }
            }}
            onMouseOut={(e) => {
              if (!loading && cfop.length === 4) {
                e.target.style.backgroundColor = '#1976d2';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Validando...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✅ Validar CFOP
              </span>
            )}
          </button>

          {(result || error) && (
            <button 
              onClick={clearResults}
              style={{ 
                padding: '12px 16px',
                fontSize: '14px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🗑️ Limpar
            </button>
          )}
        </div>

        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          <strong>Exemplos para testar:</strong> 5102, 6102, 5405, 1403
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          border: '1px solid #ffcdd2',
          borderRadius: '6px',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>❌</span>
          <div>
            <strong>Erro:</strong> {error}
          </div>
        </div>
      )}

      {result && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: result.valido ? '#e8f5e8' : '#fff3e0',
          border: `2px solid ${result.valido ? '#4caf50' : '#ff9800'}`,
          borderRadius: '8px',
          position: 'relative'
        }}>
          {/* Badge de status */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '20px',
            backgroundColor: result.valido ? '#4caf50' : '#ff9800',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {result.valido ? 'VÁLIDO' : 'INVÁLIDO'}
          </div>

          <h3 style={{ 
            marginBottom: '15px', 
            color: result.valido ? '#2e7d32' : '#f57c00',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>📊</span>
            Resultado da Validação
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>CFOP:</strong>
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: '#1976d2'
              }}>{result.cfop}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Status:</strong>
              <span style={{ 
                color: result.valido ? '#2e7d32' : '#f57c00', 
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {result.valido ? '✅ VÁLIDO' : '⚠️ INVÁLIDO'}
              </span>
            </div>
            
            {result.valido ? (
              <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Natureza:</strong>
                  <span>{result.natureza}</span>
                </div>
                
                <div>
                  <strong>Descrição:</strong>
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: 'rgba(255,255,255,0.5)', 
                    borderRadius: '4px',
                    marginTop: '4px',
                    fontStyle: 'italic'
                  }}>
                    {result.descricao_grupo}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Destino:</strong>
                  <span>{result.destino}</span>
                </div>
                
                {result.tributacao && (
                  <div style={{ 
                    marginTop: '10px',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderRadius: '6px'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '8px' }}>📋 Tributação:</strong>
                    <div style={{ display: 'grid', gap: '6px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tipo:</span>
                        <strong>{result.tributacao.tipo}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Gera crédito:</span>
                        <strong style={{ color: result.tributacao.gera_credito ? '#4caf50' : '#f44336' }}>
                          {result.tributacao.gera_credito ? 'Sim' : 'Não'}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Gera débito:</span>
                        <strong style={{ color: result.tributacao.gera_debito ? '#4caf50' : '#f44336' }}>
                          {result.tributacao.gera_debito ? 'Sim' : 'Não'}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>ICMS:</span>
                        <strong>{result.tributacao.icms}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.5)',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <strong style={{ color: '#d32f2f' }}>Erro:</strong>
                <div style={{ marginTop: '8px' }}>{result.erro}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CFOPValidator;