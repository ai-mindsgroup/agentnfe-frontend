import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Activity, Database, FileText, Layers, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Metrics {
  total_files: number;
  total_rows: number;
  total_columns: number;
  status: string;
  backend_version?: string;
  last_updated?: string;
}

const MetricsBar = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Carregando métricas do backend...');
      
      const [filesResponse, healthResponse] = await Promise.all([
        axios.get('/api/files').catch(() => ({ data: { files: [], total: 0 } })),
        axios.get('/health').catch(() => ({ data: { status: 'unknown', version: '1.0.0' } }))
      ]);

      const files = filesResponse.data.files || [];
      const health = healthResponse.data;

      const totalFiles = files.length;
      const totalRows = files.reduce((sum: number, file: any) => sum + (file.rows || 0), 0);
      const totalColumns = files.reduce((sum: number, file: any) => sum + (file.columns || 0), 0);

      const metricsData: Metrics = {
        total_files: totalFiles,
        total_rows: totalRows,
        total_columns: totalColumns,
        status: health.status === 'healthy' ? 'Online' : 'Offline',
        backend_version: health.version || '1.0.0',
        last_updated: new Date().toISOString()
      };

      setMetrics(metricsData);
      console.log('✅ Métricas carregadas:', metricsData);

    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error);
      
      const mockMetrics: Metrics = {
        total_files: 3,
        total_rows: 984,
        total_columns: 41,
        status: 'Demo',
        backend_version: '1.0.0',
        last_updated: new Date().toISOString()
      };
      
      setMetrics(mockMetrics);
      setError('Usando dados de demonstração - Backend offline');
      
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadMetrics();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'healthy':
        return 'text-green-600';
      case 'demo':
        return 'text-blue-600';
      case 'offline':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'healthy':
        return 'bg-green-100';
      case 'demo':
        return 'bg-blue-100';
      case 'offline':
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Função para formatar números grandes
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <div className="text-gray-500">Carregando métricas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Métricas do Sistema</h3>
        </div>
        <div className="flex items-center gap-2">
          {metrics?.backend_version && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              v{metrics.backend_version}
            </span>
          )}
          <Button
            onClick={handleRetry}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Atualizar métricas"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          <div className="text-sm text-yellow-800">{error}</div>
        </div>
      )}

      {/* Grid de métricas - Layout compacto */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Arquivos */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border min-w-0">
          <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xl font-bold text-gray-900 truncate">
              {formatNumber(metrics?.total_files || 0)}
            </div>
            <div className="text-sm text-gray-500 truncate">Arquivos</div>
          </div>
        </div>

        {/* Registros */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border min-w-0">
          <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
            <Database className="h-5 w-5 text-green-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xl font-bold text-gray-900 truncate">
              {formatNumber(metrics?.total_rows || 0)}
            </div>
            <div className="text-sm text-gray-500 truncate">Registros</div>
          </div>
        </div>

        {/* Campos */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border min-w-0">
          <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
            <Layers className="h-5 w-5 text-purple-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xl font-bold text-gray-900 truncate">
              {formatNumber(metrics?.total_columns || 0)}
            </div>
            <div className="text-sm text-gray-500 truncate">Campos</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border min-w-0">
          <div className={`flex-shrink-0 p-2 rounded-lg ${getStatusBgColor(metrics?.status || '')}`}>
            <Activity className={`h-5 w-5 ${getStatusColor(metrics?.status || '')}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-xl font-bold truncate ${getStatusColor(metrics?.status || '')}`}>
              {metrics?.status || 'Unknown'}
            </div>
            <div className="text-sm text-gray-500 truncate">Status</div>
          </div>
        </div>
      </div>

      {/* Informações adicionais */}
      {metrics?.last_updated && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-gray-500 text-center">
            Atualizado: {new Date(metrics.last_updated).toLocaleTimeString('pt-BR')}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsBar;