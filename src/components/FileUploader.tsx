import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';
import { Upload, FileText, Loader2, CheckCircle2, Cloud, AlertCircle, Database } from 'lucide-react';
import { toast } from 'sonner';

interface UploadResponse {
  file_id: string;
  filename: string;
  rows: number;
  columns: number;
  message: string;
  upload_date?: string;
}

interface FileUploaderProps {
  onUploadSuccess: (fileId: string, fileName: string) => void;
  onChatMessage?: (message: string) => void;
  onUploadComplete?: () => void; // ✅ NOVA PROP PARA ATUALIZAR A LISTA
}

const FileUploader = ({ onUploadSuccess, onChatMessage, onUploadComplete }: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validação do arquivo
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Formato inválido', {
        description: 'Apenas arquivos CSV são permitidos',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Arquivo muito grande', {
        description: 'O arquivo deve ter menos de 10MB',
      });
      return;
    }

    setUploading(true);
    setCurrentFile(file);
    setUploadProgress('Preparando upload...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload para o backend Python
      setUploadProgress('Enviando para análise...');
      
      console.log('📤 Iniciando upload para backend Python...');
      const response = await axios.post<UploadResponse>('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 segundos para upload
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(`Enviando... ${percentCompleted}%`);
          }
        },
      });

      console.log('✅ Upload concluído:', response.data);

      // 2. Processamento bem-sucedido
      setUploadProgress('Processando dados...');
      
      // ✅ SALVA O ARQUIVO NO LOCALSTORAGE PARA O FILESLIST
      const fileInfo = {
        file_id: response.data.file_id || `upload-${Date.now()}`,
        filename: response.data.filename,
        rows: response.data.rows,
        columns: response.data.columns,
        upload_date: new Date().toISOString().split('T')[0] // Data atual
      };

      try {
        const currentFiles = JSON.parse(localStorage.getItem('uploaded_files') || '[]');
        
        // Remove arquivo duplicado se existir
        const filteredFiles = currentFiles.filter((f: any) => f.file_id !== fileInfo.file_id);
        const updatedFiles = [...filteredFiles, fileInfo];
        
        localStorage.setItem('uploaded_files', JSON.stringify(updatedFiles));
        console.log('💾 Arquivo salvo no localStorage para o FilesList');
      } catch (storageError) {
        console.error('Erro ao salvar no localStorage:', storageError);
      }

      // Simula um pequeno delay para mostrar o feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress('Concluído!');

      // Notificação de sucesso
      toast.success(`✅ ${response.data.filename}`, {
        description: `${response.data.rows.toLocaleString()} linhas • ${response.data.columns} colunas processadas`,
        action: {
          label: 'Ver Detalhes',
          onClick: () => {
            console.log('Detalhes do arquivo:', response.data);
          },
        },
      });

      // 3. Callback para o componente pai
      setTimeout(() => {
        onUploadSuccess(response.data.file_id, response.data.filename);
        
        // ✅ CHAMA A FUNÇÃO PARA ATUALIZAR A LISTA DE ARQUIVOS
        if (onUploadComplete) {
          console.log('🔄 Disparando atualização da lista de arquivos...');
          onUploadComplete();
        }
        
        // Envia mensagem automática para o chat
        if (onChatMessage) {
          const chatMessage = `📄 Arquivo "${response.data.filename}" foi carregado com sucesso! 
          
📊 **Resumo do arquivo:**
• ${response.data.rows.toLocaleString()} registros processados
• ${response.data.columns} colunas de dados
• Pronto para análise tributária

💡 **O que você pode fazer agora:**
• Validar CFOPs e NCMs dos registros
• Consultar sobre tributação específica
• Gerar relatórios fiscais
• Detectar anomalias nos dados`;

          onChatMessage(chatMessage);
        }
        
        // Reset states
        setUploadProgress('');
        setCurrentFile(null);
      }, 500);

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      
      let errorTitle = 'Erro no upload';
      let errorDescription = 'Tente novamente';
      
      if (isAxiosError(error)) {
        // Tratamento específico para erros do backend Python
        if (error.code === 'ECONNREFUSED') {
          errorTitle = 'Backend offline';
          errorDescription = 'Verifique se o servidor Python está rodando na porta 8000';
        } else if (error.response?.status === 413) {
          errorTitle = 'Arquivo muito grande';
          errorDescription = 'O arquivo excede o limite de 10MB';
        } else if (error.response?.status === 415) {
          errorTitle = 'Formato não suportado';
          errorDescription = 'Apenas arquivos CSV são aceitos';
        } else if (error.response?.status === 422) {
          errorTitle = 'Dados inválidos';
          errorDescription = error.response.data.detail || 'Erro de validação nos dados';
        } else if (error.response?.data?.detail) {
          errorDescription = error.response.data.detail;
        } else if (error.response?.data?.error) {
          errorDescription = error.response.data.error;
        } else {
          errorDescription = error.message;
        }
      } else if (error instanceof Error) {
        errorDescription = error.message;
      }

      toast.error(errorTitle, {
        description: errorDescription,
        duration: 5000,
      });
      
      // Reset states em caso de erro
      setUploadProgress('');
      setCurrentFile(null);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: uploading,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const getDropzoneClass = () => {
    if (uploading) {
      return 'border-primary/30 bg-primary/5 cursor-not-allowed opacity-60';
    }
    if (isDragReject) {
      return 'border-destructive/50 bg-destructive/5 cursor-not-allowed';
    }
    if (isDragActive) {
      return 'border-primary bg-primary/5 scale-[1.02] shadow-lg';
    }
    return 'border-border hover:border-primary/50 hover:bg-accent/5';
  };

  const getStatusIcon = () => {
    if (uploading) {
      return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
    }
    if (uploadProgress && uploadProgress.includes('Concluído')) {
      return <CheckCircle2 className="h-12 w-12 text-success" />;
    }
    if (isDragActive) {
      return <FileText className="h-12 w-12 text-primary" />;
    }
    return <Upload className="h-12 w-12 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (uploading) {
      return (
        <div className="text-center">
          <div className="text-lg font-medium text-foreground">Processando arquivo...</div>
          <div className="text-sm text-muted-foreground mt-1">{uploadProgress}</div>
          {currentFile && (
            <div className="text-xs text-primary mt-2 flex items-center justify-center gap-1">
              <FileText className="h-3 w-3" />
              {currentFile.name}
            </div>
          )}
        </div>
      );
    }
    
    if (uploadProgress && uploadProgress.includes('Concluído')) {
      return (
        <div className="text-center">
          <div className="text-lg font-medium text-success">Upload Concluído!</div>
          <div className="text-sm text-muted-foreground mt-1">
            Arquivo processado com sucesso
          </div>
        </div>
      );
    }

    if (isDragReject) {
      return (
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
          <div className="text-lg font-medium text-destructive">Arquivo não suportado</div>
          <div className="text-sm text-muted-foreground mt-1">
            Apenas arquivos CSV são permitidos
          </div>
        </div>
      );
    }

    if (isDragActive) {
      return (
        <div className="text-center">
          <div className="text-lg font-medium text-primary">Solte o arquivo aqui</div>
          <div className="text-sm text-muted-foreground mt-1">
            Solte o arquivo CSV para upload
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="text-lg font-medium text-foreground">
          Arraste seu arquivo CSV aqui
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          ou clique para selecionar
        </div>
        <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full mt-3">
          <Database className="h-3 w-3 inline mr-1" />
          Suporta até 10MB • Análise automática de dados
        </div>
      </div>
    );
  };

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-all duration-200
        ${getDropzoneClass()}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        {getStatusIcon()}
        {getStatusText()}
      </div>

      {/* Informações adicionais quando não está fazendo upload */}
      {!uploading && !uploadProgress && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
          <div className="text-sm font-medium text-foreground mb-2">
            📋 Formato esperado do CSV:
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Colunas: CFOP, NCM, Valor, etc.</div>
            <div>• Codificação: UTF-8 recomendado</div>
            <div>• Delimitador: Vírgula (,)</div>
            <div>• Cabeçalho: Primeira linha com nomes das colunas</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;