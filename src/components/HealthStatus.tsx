import { useEffect, useState } from 'react';
import { Activity, AlertCircle, Server, RefreshCw } from 'lucide-react';

interface HealthData {
  status: string;
  timestamp: string;
  message: string;
}

const HealthStatus = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // URL do seu backend Python
  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    checkHealth();
    
    // Check a cada 30 segundos
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      console.log('🔍 Verificando saúde da API Python...');
      
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Cria um objeto de saúde baseado na resposta da sua API
      const healthData: HealthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: data.message || 'API Python funcionando normalmente'
      };

      setHealth(healthData);
      setError(false);
      setLastChecked(new Date());
      console.log('✅ API Python está online:', data);
      
    } catch (err) {
      console.error('❌ Falha na verificação da API:', err);
      setError(true);
      setHealth(null);
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  };

  const isHealthy = health?.status === 'healthy' && !error;

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
    return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  };

  const handleRetry = () => {
    checkHealth();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Indicator */}
      <div 
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
          isHealthy 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        } ${loading ? 'opacity-70' : ''}`}
        onClick={handleRetry}
        title={loading ? 'Verificando...' : 'Clique para verificar novamente'}
      >
        {loading ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Verificando...</span>
          </>
        ) : isHealthy ? (
          <>
            <Activity className="h-3 w-3 animate-pulse" />
            <span>API Online</span>
            <Server className="h-3 w-3" />
            <span className="font-mono">:8000</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-3 w-3" />
            <span>API Offline</span>
          </>
        )}
      </div>

      {/* Last checked time */}
      {lastChecked && (
        <span className="text-xs text-gray-500" title={`Última verificação: ${lastChecked.toLocaleTimeString()}`}>
          {formatTimeAgo(lastChecked)}
        </span>
      )}

      {/* Detailed status on hover (tooltip alternative) */}
      <div className="relative group">
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {loading && '🔄 Verificando conexão com o backend...'}
            {isHealthy && (
              <>
                <div>✅ Backend Python Online</div>
                <div>📍 {API_BASE_URL}</div>
                {health?.message && <div>💬 {health.message}</div>}
              </>
            )}
            {error && (
              <>
                <div>❌ Backend Python Offline</div>
                <div>📍 {API_BASE_URL}</div>
                <div>🔧 Verifique se está rodando</div>
              </>
            )}
          </div>
          <div className="w-3 h-3 bg-gray-800 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1"></div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatus;