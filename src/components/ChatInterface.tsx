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
      text: 'Olá! Envie seu arquivo CSV de notas fiscais e faça perguntas sobre os dados. Posso ajudar com análises contábeis, apuração de impostos e geração de relatórios.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Processa mensagens externas (ex: confirmação de upload)
  useEffect(() => {
    if (externalMessage) {
      const systemMessage: Message = {
        type: 'bot',
        text: externalMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
      
      // Notifica que a mensagem foi processada
      if (onMessageProcessed) {
        onMessageProcessed();
      }
    }
  }, [externalMessage, onMessageProcessed]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/chat', {
        message: input,
        session_id: sessionId,
        file_id: fileId,
      });

      const botMessage: Message = {
        type: 'bot',
        text: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      
      if (response.data.session_id) {
        setSessionId(response.data.session_id);
      }
    } catch (error) {
      console.error('Erro no chat:', error);
      let errorText = 'Não foi possível processar sua mensagem';
      if (isAxiosError(error)) {
        errorText = error.response?.data?.detail || error.message;
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden flex flex-col h-[500px]">
      {/* File Context Banner */}
      {fileName && fileId ? (
        <div className="border-b bg-primary/5 px-4 py-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Analisando: <span className="text-primary">{fileName}</span>
          </span>
        </div>
      ) : (
        <Alert className="m-2 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-800">
            Carregue um arquivo CSV acima para começar a análise
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
              <span className="text-sm text-muted-foreground">Pensando...</span>
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
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
