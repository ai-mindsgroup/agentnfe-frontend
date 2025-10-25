# FiscalMind - Inteligência Artificial para Contabilidade

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sistema inteligente de análise de notas fiscais e dados contábeis com chat interativo e IA.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

## 📋 Pré-requisitos

- Node.js 18+ (recomendado usar [nvm](https://github.com/nvm-sh/nvm))
- Backend API rodando na porta 8000 ou 8001

## 🎯 Funcionalidades

- ✅ Upload de arquivos CSV de notas fiscais
- ✅ **Upload automático para Google Drive** 💾 *(opcional - funciona sem configuração)*
- ✅ Chat interativo com IA para análise contábil e fiscal
- ✅ Análise de impostos e apuração tributária
- ✅ Geração de relatórios fiscais inteligentes
- ✅ Detecção automática de porta do backend
- ✅ Visualização de arquivos processados
- ✅ Métricas em tempo real
- ✅ Interface moderna e responsiva

### 📍 Status do Google Drive

> ⚠️ **Atenção**: O Google Drive **não está configurado** no momento. Os arquivos serão processados normalmente, mas não serão salvos no Drive.
> 
> 🚀 **Quer configurar?** Siga o guia rápido: **[docs/GOOGLE_DRIVE_QUICK_START.md](./docs/GOOGLE_DRIVE_QUICK_START.md)** (5 minutos)
>
> ℹ️ **Prefere não configurar agora?** Sem problemas! A aplicação funciona perfeitamente sem essa funcionalidade.

## 🏗️ Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **State:** React Query (TanStack Query)
- **HTTP Client:** Axios com detecção automática de porta
- **Routing:** React Router v6

## 🔧 Configuração

### Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Backend API (opcional - detecta automaticamente se não especificado)
VITE_API_URL=http://localhost:8000

# Google Drive API (obrigatório para upload de arquivos)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
VITE_GOOGLE_DRIVE_FOLDER_ID=1TZRAYnvGAQt--Dp3jWuPEV36bVVLpv2M

# Supabase (se necessário)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
```

### Google Drive

Para configurar a integração com o Google Drive e permitir que os arquivos sejam automaticamente salvos:

1. Siga o guia completo em **[docs/GOOGLE_DRIVE_SETUP.md](./docs/GOOGLE_DRIVE_SETUP.md)**
2. Configure as credenciais no Google Cloud Console
3. Adicione as variáveis de ambiente no arquivo `.env`

**⚠️ Importante**: Sem as credenciais do Google Drive, os arquivos serão processados normalmente pelo backend, mas não serão salvos no Drive.

### Backend

O frontend detecta automaticamente qual porta o backend está usando (8000 ou 8001).

**Nenhuma configuração manual necessária!**

Para mais detalhes, veja [docs/PORT_DETECTION.md](./docs/PORT_DETECTION.md)

## 📚 Documentação

Documentação detalhada disponível na pasta [`docs/`](./docs/):

### 🆕 Google Drive (Novo!)
- **[📍 Status Atual](./docs/STATUS_GOOGLE_DRIVE.md)** - LEIA PRIMEIRO: Onde você está e o que fazer
- **[⚡ Quick Start](./docs/GOOGLE_DRIVE_QUICK_START.md)** - Guia rápido de 5 minutos
- **[📖 Setup Completo](./docs/GOOGLE_DRIVE_SETUP.md)** - Guia detalhado passo a passo
- **[📋 Resumo da Integração](./docs/GOOGLE_DRIVE_INTEGRATION.md)** - Detalhes técnicos

### Outros
- **[Backend Fix Instructions](./docs/BACKEND_FIX_INSTRUCTIONS.md)** - Como corrigir o roteamento de agentes no backend
- **[Why Agents Not Working](./docs/WHY_AGENTS_NOT_WORKING.md)** - Diagnóstico completo do problema de invocação de agentes
- **[Port Detection](./docs/PORT_DETECTION.md)** - Como funciona a detecção automática de porta
- **[Network Error Fix](./docs/NETWORK_ERROR_FIX.md)** - Correções de erros de rede
- **[Console Warnings Fix](./docs/CONSOLE_WARNINGS_FIX.md)** - Warnings corrigidos do console

## 🏃 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

## 📁 Estrutura do Projeto

```
csv-chat-flow/
├── src/
│   ├── components/     # Componentes React
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários e configurações
│   ├── pages/          # Páginas da aplicação
│   └── integrations/   # Integrações externas
├── docs/               # Documentação técnica
├── public/             # Arquivos estáticos
└── ...                 # Arquivos de configuração
```

## 🐛 Solução de Problemas

### Backend não detectado
- Verifique se o backend está rodando na porta 8000 ou 8001
- Veja os logs no console do navegador (F12)
- Consulte [docs/PORT_DETECTION.md](./docs/PORT_DETECTION.md)

### Agentes não estão analisando os dados
- O problema está no backend, não no frontend
- Consulte [docs/WHY_AGENTS_NOT_WORKING.md](./docs/WHY_AGENTS_NOT_WORKING.md)
- Siga as instruções em [docs/BACKEND_FIX_INSTRUCTIONS.md](./docs/BACKEND_FIX_INSTRUCTIONS.md)

### Erros no console
- Consulte [docs/CONSOLE_WARNINGS_FIX.md](./docs/CONSOLE_WARNINGS_FIX.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

Copyright (c) 2025 AI Minds Group

## 🔗 Links Úteis

- [Lovable Project](https://lovable.dev/projects/37d2fe7e-602f-45e4-955c-b5dfcf97f3aa)
- [Documentação Técnica](./docs/)

---

**Desenvolvido por AI Minds Group** 🧠
