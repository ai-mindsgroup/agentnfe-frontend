import axios from 'axios';

// Pega a URL da variável de ambiente ou null
const API_URL_FROM_ENV = import.meta.env.VITE_API_URL;

// Cache da URL detectada
let detectedBaseURL: string | null = null;
let detectionPromise: Promise<string> | null = null;
let isDetecting = false;

// Função para detectar qual porta está disponível
const detectBackendPort = async (): Promise<string> => {
  // Se já foi detectado, retorna do cache
  if (detectedBaseURL) {
    return detectedBaseURL;
  }

  // Se já está detectando, aguarda a detecção em andamento
  if (detectionPromise) {
    return detectionPromise;
  }

  // Inicia nova detecção
  isDetecting = true;
  detectionPromise = (async () => {
    // Se houver URL configurada na variável de ambiente, tenta ela primeiro
    if (API_URL_FROM_ENV) {
      try {
        const response = await axios.get(`${API_URL_FROM_ENV}/`, { // ✅ Mudado para endpoint raiz
          timeout: 2000,
        });
        
        if (response.status === 200) {
          console.log(`✅ Backend detectado na URL configurada: ${API_URL_FROM_ENV}`);
          detectedBaseURL = API_URL_FROM_ENV;
          return API_URL_FROM_ENV;
        }
      } catch (error) {
        console.log(`❌ URL configurada ${API_URL_FROM_ENV} não disponível, tentando portas padrão...`);
      }
    }
    
    // Tenta as portas padrão - Python na 8000 primeiro
    const ports = [8000, 8001]; // ✅ Python na 8000 tem prioridade
    
    for (const port of ports) {
      try {
        const response = await axios.get(`http://localhost:${port}/`, { // ✅ Mudado para endpoint raiz
          timeout: 2000,
        });
        
        if (response.status === 200) {
          console.log(`✅ Backend Python detectado na porta ${port}`);
          const url = `http://localhost:${port}`;
          detectedBaseURL = url;
          return url;
        }
      } catch (error) {
        console.log(`❌ Porta ${port} não disponível, tentando próxima...`);
      }
    }
    
    // Se nenhuma porta estiver disponível, usa a 8000 como padrão (Python)
    console.warn('⚠️ Backend não detectado em nenhuma porta, usando http://localhost:8000 como padrão');
    const defaultURL = 'http://localhost:8000'; // ✅ Python como padrão
    detectedBaseURL = defaultURL;
    return defaultURL;
  })();

  try {
    const url = await detectionPromise;
    return url;
  } finally {
    isDetecting = false;
  }
};

// Inicia a detecção imediatamente - padrão para Python
const initialBaseURL = API_URL_FROM_ENV || 'http://localhost:8000'; // ✅ Python como padrão
detectBackendPort().then((url) => {
  axiosInstance.defaults.baseURL = url;
  console.log(`🎯 Backend final configurado para: ${url}`);
});

const axiosInstance = axios.create({
  baseURL: initialBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para garantir que a URL correta seja usada
axiosInstance.interceptors.request.use(
  async (config) => {
    // Evita loop infinito em requisições de health check
    if (config.url?.includes('/health') || config.url === '/') {
      return config;
    }
    
    // Garante que a detecção foi concluída antes de fazer a requisição
    if (!detectedBaseURL || isDetecting) {
      const detectedURL = await detectBackendPort();
      config.baseURL = detectedURL;
      axiosInstance.defaults.baseURL = detectedURL;
    } else {
      config.baseURL = detectedBaseURL;
    }
    
    console.log(`📤 Requisição para: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para re-detectar em caso de erro de rede
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 Resposta de: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const url = error.config?.url;
    const baseURL = error.config?.baseURL;
    
    console.error(`💥 Erro na requisição para ${baseURL}${url}:`, error.message);
    
    // Não re-detecta se o erro for em uma requisição de health check
    const isHealthCheck = url?.includes('/health') || url === '/';
    
    // Se houver erro de rede em requisições normais, limpa o cache e tenta re-detectar
    if (!isHealthCheck && (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ECONNREFUSED')) {
      console.log('🔄 Erro de rede detectado, tentando re-detectar backend...');
      detectedBaseURL = null;
      detectionPromise = null;
      
      // Tenta detectar novamente
      try {
        const newURL = await detectBackendPort();
        axiosInstance.defaults.baseURL = newURL;
        console.log(`📡 Nova URL detectada: ${newURL}. Tente a requisição novamente.`);
      } catch (detectionError) {
        console.error('❌ Falha na re-detecção do backend:', detectionError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Função auxiliar para componentes que precisam aguardar a detecção
export const waitForBackendDetection = async (): Promise<string> => {
  return await detectBackendPort();
};

// Função para obter a URL atual
export const getCurrentBackendURL = (): string | null => {
  return detectedBaseURL;
};

// Função para forçar uma nova detecção
export const forceBackendDetection = async (): Promise<string> => {
  detectedBaseURL = null;
  detectionPromise = null;
  return await detectBackendPort();
};

export default axiosInstance;