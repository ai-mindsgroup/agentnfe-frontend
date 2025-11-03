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
    background: 'linear-gradient(135deg, #1e40af 0%, #7e22ce 100%)',
  };

  const primaryCardStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.98)',
    border: '2px solid rgba(30, 64, 175, 0.15)',
    boxShadow: '0 8px 25px -8px rgba(30, 64, 175, 0.3)',
  };

  const secondaryCardStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid rgba(30, 64, 175, 0.1)',
    boxShadow: '0 4px 12px -4px rgba(30, 64, 175, 0.2)',
  };

  const accentStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #7e22ce, #1e40af)',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Principal Destacado */}
        <header 
          className="rounded-3xl p-10 text-center space-y-6 shadow-2xl mb-8"
          style={headerGradient}
        >
          <div className="flex items-center justify-center space-x-6">
            <div className="p-4 rounded-3xl bg-white/25 backdrop-blur-md border border-white/30">
              <Brain className="h-12 w-12 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold text-white mb-2">FiscalMind</h1>
              <p className="text-white/95 text-xl font-light">Inteligência Artificial Avançada para sua Contabilidade</p>
            </div>
          </div>
          <div className="flex justify-center items-center space-x-8 pt-6">
            <HealthStatus />
            <div className="flex items-center space-x-3 text-white/95 bg-white/20 px-4 py-2 rounded-full">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Processamento em Tempo Real</span>
            </div>
          </div>
        </header>

        {/* Grid Principal com Layout Focado */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Coluna Esquerda - Upload e Arquivos (Destaque) */}
          <div className="xl:col-span-5 space-y-8">
            
            {/* Card de Upload - Principal */}
            <section 
              className="rounded-2xl p-8 space-y-6 transition-all duration-300 hover:shadow-xl"
              style={primaryCardStyle}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-xl"
                  style={accentStyle}
                >
                  <Upload className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload de Notas Fiscais</h2>
                  <p className="text-base text-gray-700 mt-1">Envie seus arquivos CSV para análise fiscal inteligente</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <GoogleDriveStatus />
                <FileUploader 
                  onUploadSuccess={handleUploadSuccess} 
                  onChatMessage={handleChatMessage}
                />
              </div>
            </section>

            {/* Card de Arquivos Processados */}
            <section 
              className="rounded-2xl p-6 space-y-4"
              style={secondaryCardStyle}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Notas Processadas</h2>
                  <p className="text-sm text-gray-600">Seus arquivos fiscais analisados</p>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <FilesList refreshTrigger={refreshKey} />
              </div>
            </section>
          </div>

          {/* Coluna Direita - Chat e Análise (Destaque) */}
          <div className="xl:col-span-7 space-y-8">
            
            {/* Card de Chat com IA - Principal */}
            <section 
              className="rounded-2xl p-8 space-y-6 transition-all duration-300 hover:shadow-xl"
              style={primaryCardStyle}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-xl"
                  style={accentStyle}
                >
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">Assistente Fiscal IA</h2>
                  <p className="text-base text-gray-700 mt-1">
                    {currentFileName 
                      ? `Analisando: ${currentFileName}` 
                      : 'Faça perguntas sobre suas notas fiscais'
                    }
                  </p>
                </div>
                {currentFileName && (
                  <div className="hidden lg:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                    <span className="text-sm font-semibold text-blue-700">
                      Arquivo Ativo
                    </span>
                  </div>
                )}
              </div>
              
              <ChatInterface 
                fileId={currentFileId} 
                fileName={currentFileName}
                externalMessage={chatMessage}
                onMessageProcessed={handleMessageProcessed}
              />
            </section>

            {/* Card de Métricas */}
            <section 
              className="rounded-2xl p-6 space-y-4"
              style={secondaryCardStyle}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Dashboard Fiscal</h2>
                  <p className="text-sm text-gray-600">Métricas e análises das suas notas fiscais</p>
                </div>
              </div>
              <MetricsBar key={`metrics-${refreshKey}`} />
            </section>

            {/* Status do Sistema */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl p-5 text-center bg-white/90 border border-blue-200 transition-colors hover:bg-blue-50">
                <Database className="h-7 w-7 text-blue-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-800">Processamento</h3>
                <p className="text-xs text-gray-600 mt-1">Ativo</p>
              </div>
              <div className="rounded-xl p-5 text-center bg-white/90 border border-purple-200 transition-colors hover:bg-purple-50">
                <Cpu className="h-7 w-7 text-purple-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-800">IA</h3>
                <p className="text-xs text-gray-600 mt-1">Online</p>
              </div>
              <div className="rounded-xl p-5 text-center bg-white/90 border border-blue-200 transition-colors hover:bg-blue-50">
                <Zap className="h-7 w-7 text-blue-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-800">Velocidade</h3>
                <p className="text-xs text-gray-600 mt-1">Rápido</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <footer className="text-center py-8 border-t border-blue-200 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-800 font-semibold text-lg mb-4 md:mb-0">
              FiscalMind • Inteligência Artificial para Contabilidade
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span className="font-medium">IA Contábil</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Análise Fiscal</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;