import API_BASE_URL from '../config/api';

// Serviço para validação CFOP
export const validateCFOP = async (cfop) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/validar-cfop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cfop }),
    });
    
    if (!response.ok) {
      throw new Error('Erro na requisição ao backend');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao validar CFOP:', error);
    throw error;
  }
};

// Serviço para validação NCM
export const validateNCM = async (ncm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/validar-ncm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ncm }),
    });
    
    if (!response.ok) {
      throw new Error('Erro na requisição ao backend');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao validar NCM:', error);
    throw error;
  }
};

// Serviço para testar conexão com backend
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.error('Backend não conectado:', error);
    return false;
  }
};