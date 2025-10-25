import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';
import { Upload, FileText, Loader2, CheckCircle2, Cloud, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToGoogleDrive, isAuthenticated, authenticateGoogle, hasValidCredentials } from '@/services/googleDriveService';

interface UploadResponse {
  file_id: string;
  filename: string;
  rows: number;
  columns: number;
  message: string;
}

interface FileUploaderProps {
  onUploadSuccess: (fileId: string, fileName: string) => void;
  onChatMessage?: (message: string) => void;
}

const FileUploader = ({ onUploadSuccess, onChatMessage }: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [driveUploadProgress, setDriveUploadProgress] = useState<number>(0);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Enviando arquivo...');
    setDriveUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload para o backend (processamento de dados)
      setUploadProgress('Enviando para o servidor...');
      const response = await axios.post<UploadResponse>('/upload/notas/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 2. Upload para o Google Drive (armazenamento)
      // Verifica se as credenciais do Google Drive estão configuradas
      if (hasValidCredentials()) {
        setUploadProgress('Salvando no Google Drive...');
        
        try {
          // Verifica autenticação do Google
          if (!isAuthenticated()) {
            setUploadProgress('Solicitando autorização do Google...');
            await authenticateGoogle();
          }

          // Faz upload para o Google Drive
          const driveResult = await uploadToGoogleDrive(file, (progress) => {
            setDriveUploadProgress(progress);
          });

          console.log('Arquivo salvo no Google Drive:', driveResult);
          
          setUploadProgress('Processado com sucesso!');
          toast.success(`✅ ${response.data.filename}`, {
            description: `${response.data.rows.toLocaleString()} linhas • ${response.data.columns} colunas processadas | 💾 Salvo no Drive`,
          });
        } catch (driveError) {
          console.error('Erro ao salvar no Google Drive:', driveError);
          // Não bloqueia o fluxo se o Google Drive falhar
          toast.warning(`⚠️ ${response.data.filename}`, {
            description: `Processado com sucesso, mas não foi possível salvar no Google Drive. ${response.data.rows.toLocaleString()} linhas • ${response.data.columns} colunas`,
          });
        }
      } else {
        // Credenciais não configuradas - notifica o usuário
        console.warn('Credenciais do Google Drive não configuradas');
        setUploadProgress('Processado com sucesso!');
        toast.success(`✅ ${response.data.filename}`, {
          description: `${response.data.rows.toLocaleString()} linhas • ${response.data.columns} colunas processadas`,
        });
        toast.info('ℹ️ Google Drive não configurado', {
          description: 'Configure as credenciais no .env para salvar arquivos no Drive. Veja docs/GOOGLE_DRIVE_SETUP.md',
          duration: 5000,
        });
      }
      
      setTimeout(() => {
        onUploadSuccess(response.data.file_id, response.data.filename);
        
        // Envia mensagem automática para o chat
        if (onChatMessage) {
          onChatMessage(`📄 Arquivo "${response.data.filename}" foi carregado com sucesso! ${response.data.rows.toLocaleString()} linhas processadas. Agora você pode fazer perguntas sobre os dados.`);
        }
        
        setUploadProgress('');
        setDriveUploadProgress(0);
      }, 1500);
    } catch (error) {
      console.error('Erro no upload:', error);
      let errorText = 'Tente novamente';
      if (isAxiosError(error)) {
        errorText = error.response?.data?.detail || error.message;
      } else if (error instanceof Error) {
        errorText = error.message;
      }
      toast.error('Erro no upload', {
        description: errorText,
      });
      setUploadProgress('');
      setDriveUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-border hover:border-primary/50 hover:bg-accent/5'
        }
        ${uploading ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        {uploading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div>
              <div className="text-lg font-medium text-foreground">Processando...</div>
              <div className="text-sm text-muted-foreground mt-1">{uploadProgress}</div>
            </div>
          </>
        ) : uploadProgress ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-success" />
            <div className="text-lg font-medium text-success">{uploadProgress}</div>
          </>
        ) : (
          <>
            {isDragActive ? (
              <>
                <FileText className="h-12 w-12 text-primary" />
                <div className="text-lg font-medium text-primary">Solte o arquivo aqui</div>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div>
                  <div className="text-lg font-medium text-foreground">
                    Arraste seu arquivo CSV de notas fiscais aqui
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    ou clique para selecionar
                  </div>
                  {driveUploadProgress > 0 && driveUploadProgress < 100 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                      <Cloud className="h-4 w-4" />
                      <span>Google Drive: {driveUploadProgress}%</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Apenas arquivos .csv • Backup automático no Drive
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
