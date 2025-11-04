import { api, uploadApi, checkApiHealth } from '@/lib/api';

export interface Invoice {
  id: string;
  number: string;
  value: number;
  date: string;
  status: string;
}

export interface AnalysisResult {
  invoice_id: string;
  analysis: {
    total_value: number;
    taxes: number;
    items: number;
    vendor: string;
    risk_score?: number;
    anomalies_detected?: boolean;
  };
  confidence: number;
  status: string;
  analyzed_by?: string;
  timestamp?: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  status: string;
  message: string;
  uploaded_at: string;
  user_id?: string;
}

export const invoiceService = {
  async uploadInvoice(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await uploadApi.post<UploadResponse>('/invoices/upload', formData);
    return response.data;
  },

  async getInvoices(): Promise<Invoice[]> {
    const response = await api.get<Invoice[]>('/invoices');
    return response.data;
  },

  async analyzeInvoice(invoiceId: string): Promise<AnalysisResult> {
    const response = await api.post<AnalysisResult>(`/invoices/${invoiceId}/analyze`);
    return response.data;
  },

  async checkHealth(): Promise<boolean> {
    return await checkApiHealth();
  },

  // Método adicional para buscar uma invoice específica
  async getInvoiceById(invoiceId: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/${invoiceId}`);
    return response.data;
  },

  // Método para deletar uma invoice
  async deleteInvoice(invoiceId: string): Promise<void> {
    await api.delete(`/invoices/${invoiceId}`);
  }
};