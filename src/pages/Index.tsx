import { useState, CSSProperties } from 'react';
import MetricsBar from '@/components/MetricsBar';
import FileUploader from '@/components/FileUploader';
import ChatInterface from '@/components/ChatInterface';
import FilesList from '@/components/FilesList';
import HealthStatus from '@/components/HealthStatus';
import GoogleDriveStatus from '@/components/GoogleDriveStatus';
import { Brain, Upload, MessageCircle, FileText, BarChart3, Cpu, Database, Zap } from 'lucide-react';

const Index = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [currentFileId, setCurrentFileId] = useState<string | undefined>();
  const [currentFileName, setCurrentFileName] = useState<string | undefined>();
  const [chatMessage, setChatMessage] = useState<string>('');

  const handleUploadSuccess = (fileId: string, fileName: string): void => {
    setRefreshKey((prev) => prev + 1);
    setCurrentFileId(fileId);
    setCurrentFileName(fileName);
  };

  const handleChatMessage = (message: string): void => {
    setChatMessage(message);
  };

  const handleMessageProcessed = (): void => {
    setChatMessage('');
  };

  const headerGradient: CSSProperties = {
    background: 'linear-gradient(135deg, #059669 0%, #0ea5e9 100%)',
  };

  const cardStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgba(5, 150, 105, 0.1)',
    boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.1)',
  };

  const accentStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #0ea5e9, #059669)',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header Principal */}
        <header 
          className="rounded-2xl p-8 text-center space-y-4 shadow-lg"
          style={headerGradient}
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white">FiscalMind</h1>
              <p className="text-white/90 text-lg">Inteligência Artificial para sua Contabilidade</p>
            </div>
          </div>
          <div className="flex justify-center items-center space-x-6 pt-4">
            <HealthStatus />
            <div className="flex items-center space-x-2 text-white/90">
              <Zap className="h-5 w-5" />
              <span className="font-medium">Processamento em Tempo Real</span>
            </div>
          </div>
        </header>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Coluna Lateral - Funcionalidades de Dados */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Card de Upload */}
            <section 
              className="rounded-xl p-6 space-y-4"
              style={cardStyle}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Upload className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Upload de Notas Fiscais</h2>
                  <p className="text-sm text-gray-600">Envie seus arquivos CSV para análise fiscal</p>
                </div>
              </div>
              <GoogleDriveStatus />
              <FileUploader 
                onUploadSuccess={handleUploadSuccess} 
                onChatMessage={handleChatMessage}
              />
            </section>

            {/* Card de Arquivos */}
            <section 
              className="rounded-xl p-6 space-y-4"
              style={cardStyle}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-sky-500/20">
                  <FileText className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Notas Processadas</h2>
                  <p className="text-sm text-gray-600">Seus arquivos fiscais analisados</p>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <FilesList refreshTrigger={refreshKey} />
              </div>
            </section>

            {/* Cards de Status do Sistema */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg p-4 text-center bg-white/80 border border-emerald-100">
                <Database className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-800">Processamento</h3>
                <p className="text-xs text-gray-600">Ativo</p>
              </div>
              <div className="rounded-lg p-4 text-center bg-white/80 border border-sky-100">
                <Cpu className="h-6 w-6 text-sky-600 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-800">IA</h3>
                <p className="text-xs text-gray-600">Online</p>
              </div>
            </div>
          </div>

          {/* Coluna Principal - Análise e Chat */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Card de Métricas */}
            <section 
              className="rounded-xl p-6"
              style={cardStyle}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={accentStyle}
                  >
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Dashboard Fiscal</h2>
                    <p className="text-sm text-gray-600">Métricas e análises das suas notas fiscais</p>
                  </div>
                </div>
                {currentFileName && (
                  <div className="hidden lg:flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-emerald-700">
                      Ativo: {currentFileName}
                    </span>
                  </div>
                )}
              </div>
              <MetricsBar key={`metrics-${refreshKey}`} />
            </section>

            {/* Card de Chat com IA */}
            <section 
              className="rounded-xl p-6 space-y-4"
              style={cardStyle}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg"
                  style={accentStyle}
                >
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Assistente Fiscal IA</h2>
                  <p className="text-sm text-gray-600">
                    {currentFileName 
                      ? `Analisando: ${currentFileName}` 
                      : 'Faça perguntas sobre suas notas fiscais'
                    }
                  </p>
                </div>
              </div>
              <ChatInterface 
                fileId={currentFileId} 
                fileName={currentFileName}
                externalMessage={chatMessage}
                onMessageProcessed={handleMessageProcessed}
              />
            </section>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg p-4 bg-white/80 border border-emerald-100 text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">100%</div>
                <div className="text-xs text-gray-600">Precisão</div>
              </div>
              <div className="rounded-lg p-4 bg-white/80 border border-sky-100 text-center">
                <div className="text-2xl font-bold text-sky-600 mb-1">24/7</div>
                <div className="text-xs text-gray-600">Disponível</div>
              </div>
              <div className="rounded-lg p-4 bg-white/80 border border-emerald-100 text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">Rápido</div>
                <div className="text-xs text-gray-600">Processamento</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <footer className="text-center py-6 border-t border-emerald-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-700 font-medium mb-4 md:mb-0">
              FiscalMind • Inteligência Artificial para Contabilidade
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Cpu className="h-4 w-4 text-emerald-600" />
                <span>IA Contábil</span>
              </div>
              <div className="flex items-center space-x-1">
                <Database className="h-4 w-4 text-sky-600" />
                <span>Análise Fiscal</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;