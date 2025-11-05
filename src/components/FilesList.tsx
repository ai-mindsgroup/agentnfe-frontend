import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { FileText, Database, Layers, AlertCircle, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileInfo {
  file_id: string;
  filename: string;
  rows: number;
  columns: number;
  upload_date?: string;
}

interface FilesListProps {
  refreshTrigger?: number;
  onFileSelect?: (fileId: string, fileName: string) => void;
}

const FilesList = ({ refreshTrigger, onFileSelect }: FilesListProps) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ AGORA USA refreshTrigger CORRETAMENTE
  useEffect(() => {
    console.log('🔄 FilesList: Atualizando lista de arquivos...', refreshTrigger);
    loadFiles();
  }, [refreshTrigger]); // ← Agora depende de refreshTrigger

  // Função para carregar arquivos
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📂 Carregando lista de arquivos...');
      
      // ✅ PRIMEIRO TENTA BUSCAR ARQUIVOS REAIS DO BACKEND
      const realFiles = await tryLoadRealFiles();
      
      if (realFiles && realFiles.length > 0) {
        console.log(`✅ ${realFiles.length} arquivos carregados do backend`);
        setFiles(realFiles);
      } else {
        // ✅ SE NÃO ENCONTRAR, USA DADOS MOCK + ARQUIVOS UPLOADED
        const mockFiles: FileInfo[] = [
          {
            file_id: 'demo-cfop',
            filename: 'dados_cfop_demo.csv',
            rows: 150,
            columns: 8,
            upload_date: '2024-01-15'
          },
          {
            file_id: 'demo-ncm', 
            filename: 'dados_ncm_demo.csv',
            rows: 89,
            columns: 6,
            upload_date: '2024-01-15'
          }
        ];

        // ✅ BUSCA ARQUIVOS UPLOADED DO LOCALSTORAGE
        const uploadedFiles = getUploadedFilesFromStorage();
        
        // ✅ COMBINA ARQUIVOS MOCK + UPLOADED
        const allFiles = [...mockFiles, ...uploadedFiles];
        
        setFiles(allFiles);
        console.log(`📁 ${allFiles.length} arquivos carregados (${mockFiles.length} demo + ${uploadedFiles.length} uploads)`);
      }

    } catch (error: unknown) {
      console.error('❌ Erro ao carregar arquivos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar com o servidor';
      setError(errorMessage);
      
      // ✅ FALLBACK: TENTA CARREGAR APENAS DO LOCALSTORAGE EM CASO DE ERRO
      try {
        const uploadedFiles = getUploadedFilesFromStorage();
        if (uploadedFiles.length > 0) {
          setFiles(uploadedFiles);
          console.log(`📁 ${uploadedFiles.length} arquivos carregados do localStorage`);
        } else {
          setFiles([]);
        }
      } catch (storageError) {
        console.error('Erro ao carregar do localStorage:', storageError);
        setFiles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA BUSCAR ARQUIVOS DO BACKEND REAL
  const tryLoadRealFiles = async (): Promise<FileInfo[] | null> => {
    try {
      const endpoints = ['/api/files', '/api/csv/files', '/files'];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Tentando endpoint: ${endpoint}`);
          const response = await axios.get(endpoint, { timeout: 5000 });
          
          if (response.data && Array.isArray(response.data.files || response.data)) {
            const files = response.data.files || response.data;
            console.log(`✅ ${files.length} arquivos encontrados em ${endpoint}`);
            return files;
          }
        } catch (e) {
          console.log(`❌ Endpoint ${endpoint} não disponível`);
        }
      }
      
      console.log('ℹ️ Nenhum endpoint de arquivos encontrado no backend');
      return null;
    } catch (error) {
      console.log('💥 Erro geral ao buscar arquivos do backend:', error);
      return null;
    }
  };

  // ✅ FUNÇÃO PARA BUSCAR ARQUIVOS UPLOADED DO LOCALSTORAGE
  const getUploadedFilesFromStorage = (): FileInfo[] => {
    try {
      const stored = localStorage.getItem('uploaded_files');
      if (stored) {
        const files = JSON.parse(stored);
        console.log(`💾 ${files.length} arquivos encontrados no localStorage`);
        return files;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar arquivos do localStorage:', error);
    }
    console.log('💾 Nenhum arquivo encontrado no localStorage');
    return [];
  };

  const handleFileSelect = (fileId: string, fileName: string) => {
    console.log(`📁 Arquivo selecionado: ${fileName} (${fileId})`);
    if (onFileSelect) {
      onFileSelect(fileId, fileName);
    }
  };

  const handleRetry = () => {
    console.log('🔄 Tentando recarregar arquivos...');
    loadFiles();
  };

  // ✅ FUNÇÃO PARA LIMPAR ARQUIVOS UPLOADED (OPCIONAL)
  const clearUploadedFiles = () => {
    try {
      localStorage.removeItem('uploaded_files');
      console.log('🗑️ Arquivos uploadados removidos do localStorage');
      loadFiles(); // Recarrega a lista
      toast.success('Arquivos uploadados removidos');
    } catch (error) {
      console.error('Erro ao limpar arquivos:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando arquivos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Arquivos de Dados
          </h3>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-destructive opacity-50" />
          <div className="text-destructive font-medium mb-2">Erro ao carregar arquivos</div>
          <div className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            {error.includes('offline') 
              ? 'Backend Python não está respondendo. Verifique se o servidor está rodando na porta 8000.'
              : error
            }
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar Página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Arquivos de Dados
          <span className="text-sm text-muted-foreground font-normal ml-2">
            ({files.length})
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRetry}
            variant="ghost"
            size="sm"
            className="gap-2 h-8"
            title="Recarregar lista"
          >
            <RefreshCw className="h-3 w-3" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="divide-y">
        {files.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <div className="font-medium mb-1">Nenhum arquivo disponível</div>
            <div className="text-sm">Faça upload de um arquivo CSV para começar</div>
          </div>
        ) : (
          files.map((file, index) => (
            <div
              key={`${file.file_id}-${index}`}
              className="p-4 hover:bg-accent/5 transition-colors group cursor-pointer"
              onClick={() => handleFileSelect(file.file_id, file.filename)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {file.filename}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                      <span className="truncate">ID: {file.file_id}</span>
                      {file.upload_date && (
                        <span className="truncate">Upload: {file.upload_date}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div 
                    className="flex items-center gap-1" 
                    title={`${file.rows} registros`}
                  >
                    <Database className="h-4 w-4" />
                    <span className="font-mono">{file.rows.toLocaleString()}</span>
                  </div>
                  <div 
                    className="flex items-center gap-1" 
                    title={`${file.columns} colunas`}
                  >
                    <Layers className="h-4 w-4" />
                    <span className="font-mono">{file.columns}</span>
                  </div>
                </div>
              </div>

              {/* ✅ BADGES DIFERENCIADOS PARA DIFERENTES TIPOS DE ARQUIVO */}
              <div className="mt-2 flex gap-2">
                {file.file_id.includes('demo') && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                    📁 Demonstração
                  </span>
                )}
                {file.file_id.includes('upload-') && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                    ✅ Upload Recente
                  </span>
                )}
                {!file.file_id.includes('demo') && !file.file_id.includes('upload-') && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 border border-gray-200">
                    📊 Backend
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ FOOTER MAIS INFORMATIVO */}
      <div className="p-3 border-t bg-muted/20">
        <div className="text-xs text-muted-foreground text-center flex flex-col gap-1">
          <div>
            💡 {files.filter(f => f.file_id.includes('upload-')).length} upload(s) recente(s) • 
            {files.filter(f => f.file_id.includes('demo')).length} demo(s)
          </div>
          <div>
            Conectado ao backend Python na porta 8000
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesList;