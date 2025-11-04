import React, { useEffect, useState } from 'react';

// Serviço simplificado para conectar com seu backend Python
const backendService = {
  // Testa a conexão com o backend
  checkHealth: async () => {
    try {
      const response = await fetch('http://localhost:8000/');
      return response.ok;
    } catch (error) {
      console.error('Erro na conexão:', error);
      return false;
    }
  },

  // Busca informações da API
  getAPIInfo: async () => {
    try {
      const response = await fetch('http://localhost:8000/');
      return await response.json();
    } catch (error) {
      throw new Error('Não foi possível obter informações da API');
    }
  },

  // Testa o endpoint de validação CFOP
  testCFOP: async () => {
    try {
      const response = await fetch('http://localhost:8000/api/validar-cfop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cfop: '5102' }),
      });
      return await response.json();
    } catch (error) {
      throw new Error('Endpoint CFOP não disponível');
    }
  },

  // Testa o endpoint de validação NCM
  testNCM: async () => {
    try {
      const response = await fetch('http://localhost:8000/api/validar-ncm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ncm: '84714100' }),
      });
      return await response.json();
    } catch (error) {
      throw new Error('Endpoint NCM não disponível');
    }
  }
};

const TestConnection: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [backendInfo, setBackendInfo] = useState<any>(null);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [testResults, setTestResults] = useState<{cfop: any, ncm: any}>({cfop: null, ncm: null});

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔍 Testando conexão com o backend Python...');
        
        const isHealthy = await backendService.checkHealth();
        
        if (isHealthy) {
          setStatus('connected');
          console.log('✅ Backend Python conectado com sucesso!');
          
          // Buscar informações da API
          try {
            const info = await backendService.getAPIInfo();
            setBackendInfo(info);
            console.log('📋 Informações da API:', info);
          } catch (error) {
            console.log('ℹ️ Informações detalhadas não disponíveis');
          }

          // Testar endpoints específicos
          try {
            const cfopResult = await backendService.testCFOP();
            setTestResults(prev => ({...prev, cfop: cfopResult}));
            console.log('✅ Endpoint CFOP funcionando:', cfopResult);
          } catch (error) {
            console.warn('⚠️ Endpoint CFOP com problemas:', error);
          }

          try {
            const ncmResult = await backendService.testNCM();
            setTestResults(prev => ({...prev, ncm: ncmResult}));
            console.log('✅ Endpoint NCM funcionando:', ncmResult);
          } catch (error) {
            console.warn('⚠️ Endpoint NCM com problemas:', error);
          }

          // Definir endpoints disponíveis
          setEndpoints([
            { name: 'Validação CFOP', path: '/api/validar-cfop', method: 'POST', status: testResults.cfop ? 'working' : 'error' },
            { name: 'Validação NCM', path: '/api/validar-ncm', method: 'POST', status: testResults.ncm ? 'working' : 'error' },
            { name: 'Documentação', path: '/docs', method: 'GET', status: 'working' }
          ]);
          
        } else {
          setStatus('error');
          console.error('❌ Falha na conexão com o backend Python');
        }
      } catch (error) {
        console.error('💥 Erro no teste de conexão:', error);
        setStatus('error');
      }
    };

    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return '🟢';
      case 'error': return '🔴';
      default: return '🟡';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Backend Conectado';
      case 'error': return 'Backend Offline';
      default: return 'Testando Conexão...';
    }
  };

  const retryConnection = async () => {
    setStatus('loading');
    setBackendInfo(null);
    setTestResults({cfop: null, ncm: null});
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Não renderizar em produção se preferir
  // if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
            <span className="font-semibold text-gray-800">Status Backend</span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title={showDetails ? 'Ocultar detalhes' : 'Mostrar detalhes'}
          >
            {showDetails ? '▲' : '▼'}
          </button>
        </div>

        {/* Status Principal */}
        <div className="flex items-center space-x-2 text-sm">
          <span>{getStatusIcon()}</span>
          <span className={`font-medium ${
            status === 'connected' ? 'text-green-600' : 
            status === 'error' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {getStatusText()}
          </span>
        </div>

        {/* Detalhes Expandidos */}
        {showDetails && (
          <div className="space-y-3 pt-2 border-t border-gray-200">
            {/* Informações do Backend */}
            {backendInfo && (
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">API:</span>
                  <span className="font-medium">NFe Tax Specialist</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">URL:</span>
                  <span className="font-mono">localhost:8000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
              </div>
            )}

            {/* Endpoints Testados */}
            <div className="text-xs">
              <div className="text-gray-600 mb-2">Endpoints:</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span>POST /api/validar-cfop</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    testResults.cfop ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testResults.cfop ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>POST /api/validar-ncm</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    testResults.ncm ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testResults.ncm ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            </div>

            {/* Resultados dos Testes */}
            {(testResults.cfop || testResults.ncm) && (
              <div className="text-xs">
                <div className="text-gray-600 mb-1">Testes Realizados:</div>
                <div className="bg-gray-50 rounded p-2 max-h-24 overflow-y-auto space-y-1">
                  {testResults.cfop && (
                    <div className="flex justify-between">
                      <span>CFOP 5102:</span>
                      <span className={testResults.cfop.valido ? 'text-green-600' : 'text-red-600'}>
                        {testResults.cfop.valido ? 'Válido' : 'Inválido'}
                      </span>
                    </div>
                  )}
                  {testResults.ncm && (
                    <div className="flex justify-between">
                      <span>NCM 84714100:</span>
                      <span className={testResults.ncm.valido ? 'text-green-600' : 'text-red-600'}>
                        {testResults.ncm.valido ? 'Válido' : 'Inválido'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ações Rápidas */}
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors"
              >
                📚 API Docs
              </button>
              <button
                onClick={retryConnection}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded transition-colors"
              >
                🔄 Retestar
              </button>
            </div>

            {/* Mensagem de Erro Detalhada */}
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                <div className="font-medium mb-1">Backend Python Offline</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Execute: <code>python main.py</code></li>
                  <li>Verifique a porta 8000</li>
                  <li>Confirme que o ambiente virtual está ativo</li>
                  <li>Verifique o terminal do backend</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-200">
          Frontend: 8080 • Backend: 8000
        </div>
      </div>
    </div>
  );
};

export default TestConnection;