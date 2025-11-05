import { useState, useRef, useEffect } from 'react';
import axios, { isAxiosError } from 'axios';
import axiosInstance from '@/lib/axios';
import { Send, Bot, User, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  fileId?: string;
  fileName?: string;
  externalMessage?: string;
  onMessageProcessed?: () => void;
}

const ChatInterface = ({ fileId, fileName, externalMessage, onMessageProcessed }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      text: 'Olá! Sou seu assistente especializado em análise tributária de notas fiscais. Posso ajudar com validação de CFOP/NCM, análise de dados fiscais e consultas sobre legislação tributária.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verifica se o backend está online
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/');
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      console.error('Backend offline:', error);
      setBackendStatus('offline');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Processa mensagens externas
  useEffect(() => {
    if (externalMessage) {
      const systemMessage: Message = {
        type: 'bot',
        text: externalMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
      
      if (onMessageProcessed) {
        onMessageProcessed();
      }
    }
  }, [externalMessage, onMessageProcessed]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Verifica se o backend está online antes de enviar
    if (backendStatus === 'offline') {
      const errorMessage: Message = {
        type: 'bot',
        text: '❌ Backend Python está offline. Verifique se o servidor está rodando na porta 8000.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Usando o endpoint de consulta tributária do seu backend Python
      const response = await axiosInstance.post('/api/consultar-tributacao', {
        query: input,
        context: fileId ? { file_id: fileId } : undefined
      });

      const botMessage: Message = {
        type: 'bot',
        text: response.data.resposta || response.data.response || 'Consulta processada com sucesso.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Erro no chat:', error);
      
      let errorText = 'Não foi possível processar sua mensagem';
      
      if (isAxiosError(error)) {
        // Tenta diferentes formatos de resposta de erro
        errorText = error.response?.data?.detail || 
                   error.response?.data?.error || 
                   error.response?.data?.message || 
                   error.message;
        
        // Se for erro de conexão, sugere verificar o backend
        if (error.code === 'ECONNREFUSED') {
          errorText = 'Backend Python não está respondendo. Verifique se o servidor está rodando na porta 8000.';
          setBackendStatus('offline');
        }
      } else if (error instanceof Error) {
        errorText = error.message;
      }
      
      const errorMessage: Message = {
        type: 'bot',
        text: `❌ Erro: ${errorText}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Função para validação rápida de CFOP/NCM
  const handleQuickValidation = async (type: 'cfop' | 'ncm', code: string) => {
    if (!code.trim()) return;

    setLoading(true);
    const userMessage: Message = {
      type: 'user',
      text: `Validar ${type.toUpperCase()} ${code}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const endpoint = type === 'cfop' ? '/api/validar-cfop' : '/api/validar-ncm';
      const payload = type === 'cfop' ? { cfop: code } : { ncm: code };
      
      const response = await axiosInstance.post(endpoint, payload);
      
      let resultText = '';
      if (response.data.valido) {
        resultText = `✅ ${type.toUpperCase()} ${code} é VÁLIDO\n`;
        if (type === 'cfop') {
          resultText += `📋 ${response.data.descricao_grupo}\n`;
          resultText += `📍 ${response.data.destino}\n`;
          resultText += `⚖️ ${response.data.natureza}`;
        } else {
          resultText += `📋 ${response.data.categoria}\n`;
          resultText += `📁 Capítulo: ${response.data.capitulo}\n`;
          resultText += `🔢 Formatado: ${response.data.ncm_formatado}`;
        }
      } else {
        resultText = `❌ ${type.toUpperCase()} ${code} é INVÁLIDO\n`;
        resultText += `💬 ${response.data.erro}`;
      }

      const botMessage: Message = {
        type: 'bot',
        text: resultText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error(`Erro na validação ${type}:`, error);
      const errorMessage: Message = {
        type: 'bot',
        text: `❌ Erro ao validar ${type.toUpperCase()} ${code}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Detecta automaticamente se a mensagem é sobre validação de CFOP/NCM
  const processInput = (text: string) => {
    const cfopMatch = text.match(/(cfop|CFOP)\s*(\d{4})/i);
    const ncmMatch = text.match(/(ncm|NCM)\s*(\d{8})/i);
    
    if (cfopMatch) {
      handleQuickValidation('cfop', cfopMatch[2]);
      return;
    }
    
    if (ncmMatch) {
      handleQuickValidation('ncm', ncmMatch[2]);
      return;
    }
    
    // Se não for validação, envia como mensagem normal
    setInput(text);
    sendMessage();
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden flex flex-col h-[500px]">
      {/* Header com status do backend */}
      <div className="border-b bg-primary/5 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Assistente Fiscal
          </span>
        </div>
        <div className={`text-xs px-2 py-1 rounded ${
          backendStatus === 'online' ? 'bg-green-100 text-green-700' :
          backendStatus === 'offline' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {backendStatus === 'online' ? '✅ Python Online' :
           backendStatus === 'offline' ? '❌ Python Offline' :
           '🔄 Verificando...'}
        </div>
      </div>

      {/* File Context */}
      {fileName && fileId ? (
        <div className="border-b bg-blue-50 px-4 py-2">
          <span className="text-sm font-medium text-blue-800">
            📄 Analisando: {fileName}
          </span>
        </div>
      ) : (
        <Alert className="m-2 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-800">
            💡 Dica: Você pode validar CFOPs (ex: "CFOP 5102") e NCMs (ex: "NCM 84714100") diretamente!
          </AlertDescription>
        </Alert>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.type === 'bot' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            )}
            
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                msg.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap break-words">{msg.text}</div>
              <div
                className={`text-xs mt-1 ${
                  msg.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}
              >
                {msg.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>

            {msg.type === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Consultando base tributária...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem ou valide CFOP/NCM (ex: CFOP 5102)"
            disabled={loading || backendStatus === 'offline'}
            className="flex-1"
          />
          <Button
            onClick={() => processInput(input)}
            disabled={loading || !input.trim() || backendStatus === 'offline'}
            size="icon"
            title={backendStatus === 'offline' ? 'Backend offline - verifique a porta 8000' : 'Enviar mensagem'}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickValidation('cfop', '5102')}
            disabled={loading || backendStatus === 'offline'}
            className="text-xs"
          >
            Testar CFOP 5102
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickValidation('ncm', '84714100')}
            disabled={loading || backendStatus === 'offline'}
            className="text-xs"
          >
            Testar NCM 84714100
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={checkBackendStatus}
            disabled={loading}
            className="text-xs"
          >
            🔄 Verificar Conexão
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;