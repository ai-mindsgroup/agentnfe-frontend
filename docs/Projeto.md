Plano de Ação - Projeto Final I2A2
1. Análise do Projeto e Requisitos
Após analisar os repositórios eda-aiminds-back e eda-aiminds-front, e o PDF I2A2-Agentes_-_Trabalho_Final.pdf, a situação atual do projeto é a seguinte:
Backend: Uma API em Python com FastAPI, estruturada para análise de dados (inicialmente focada em um dataset de fraude de cartão de crédito), ingestão de dados, geração de embeddings e armazenamento em um banco de dados vetorial (Supabase/Postgres). A arquitetura é modular, separando agentes, gerenciamento de dados, LLMs e serviços.
Frontend: Uma aplicação em React (Vite + TypeScript) com uma interface de chat (ChatInterface.tsx) que já inclui um componente para upload de arquivos (FileUploader.tsx). A comunicação com o backend parece ser feita via requisições HTTP.
Objetivo Final: O projeto de conclusão do curso exige a aplicação dos conceitos aprendidos em um dos temas propostos, que envolvem o uso de agentes autônomos para tarefas como contabilidade, apuração de impostos e geração de relatórios.
A principal pendência é integrar o fluxo de ponta a ponta para a importação e análise de um novo tipo de arquivo (o "arquivo de notas"), que é o foco do desafio.
2. Decisão do Fluxo de Upload: Chat vs. Seção Dedicada
Sua dúvida sobre onde o usuário deve fazer o upload é muito pertinente. Ambas as abordagens têm vantagens e desvantagens.
Opção A: Upload via Chat (Implementação Atual)
Como funciona: O usuário anexa o arquivo diretamente na interface de conversação, provavelmente junto com um comando como "Analise este arquivo de notas".
Prós:
Fluxo Conversacional: Mantém a interação centralizada no chat, o que é mais intuitivo para uma aplicação baseada em agentes.
Menor Esforço: O frontend (FileUploader.tsx) já está parcialmente integrado ao chat, exigindo apenas adaptações.
Contras:
Gestão de Arquivos: Fica mais difícil para o usuário gerenciar ou visualizar os arquivos que já foram enviados anteriormente.
Complexidade no Backend: O backend precisa ser capaz de associar o arquivo enviado a uma sessão de chat ou a um comando específico.
Opção B: Seção Dedicada para Uploads
Como funciona: Criar uma nova página ou uma seção na barra lateral onde o usuário pode ver uma lista de arquivos já enviados e fazer o upload de novos.
Prós:
Organização: Separa a gestão dos dados da interação com o agente, o que é um padrão de UX mais tradicional e claro.
Melhor Gerenciamento: Facilita a visualização do status de cada arquivo (processando, concluído, erro) e permite ações como deletar ou reprocessar.
Contras:
Quebra de Fluxo: O usuário precisa sair da tela de chat para carregar os dados.
Maior Esforço: Exige a criação de novos componentes e rotas no frontend.
Recomendação para o Projeto Final:
Para o escopo do trabalho final, recomendo manter e refinar a Opção A (Upload via Chat). O esforço é menor e está mais alinhado com a proposta de uma interface conversacional com agentes autônomos. A robustez da Opção B pode ser mencionada no relatório como uma melhoria futura.
3. Plano de Ação - Backend (eda-aiminds-back)
O objetivo é criar um endpoint que receba o arquivo de notas, o processe e armazene os dados para que os agentes possam consultá-los.
Passo 1: Criar o Endpoint de Upload de Notas
No arquivo api_completa.py, adicione um novo endpoint específico para o arquivo de notas. Isso evita conflitos com o endpoint de upload genérico existente.
# Em api_completa.py
from fastapi import UploadFile, File, HTTPException
from src.agent.data_ingestor import DataIngestor # Supondo que a lógica de ingestão será centralizada aqui

# ... (outros imports e código da API)

@app.post("/upload/notas/", tags=["Upload"])
async def upload_notas_file(file: UploadFile = File(...)):
    """
        Endpoint para upload e processamento de arquivos de notas (CSV).
            """
                if not file.filename.endswith('.csv'):
                        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Por favor, envie um arquivo .csv.")

                            try:
                                    # Plano de Ação — Projeto Final I2A2

                                    Este documento resume o estado atual do projeto, recomendações de fluxo de upload de arquivos e um plano de ação para integrar o processamento do "arquivo de notas" (CSV) de ponta a ponta.

                                    ## 1. Análise do projeto e requisitos

                                    Após revisar os repositórios `eda-aiminds-back` e `eda-aiminds-front` e o PDF `I2A2-Agentes_-_Trabalho_Final.pdf`, o cenário é:

                                    - Backend: API em Python com FastAPI para análise de dados (inicialmente o dataset de fraude em cartão), ingestão de dados, geração de embeddings e armazenamento em um banco vetorial (Supabase/Postgres). Arquitetura modular (agentes, gerenciamento de dados, LLMs e serviços).
                                    - Frontend: Aplicação React (Vite + TypeScript) com interface de chat (`ChatInterface.tsx`) e componente de upload (`FileUploader.tsx`). Comunicação com o backend via HTTP.
                                    - Objetivo final: Implementar agentes autônomos aplicados a um tema do trabalho (por exemplo, contabilidade, apuração de impostos, relatórios), usando o fluxo de ingestão e recuperação (RAG).

                                    Pendência principal: integrar o fluxo completo para importar e analisar o "arquivo de notas" (CSV) — esse é o foco deste plano.

                                    ## 2. Onde o usuário deve fazer o upload?

                                    Duas abordagens possíveis, com prós e contras:

                                    ### Opção A — Upload via chat (implementação atual)

                                    Como funciona: o usuário anexa o arquivo diretamente na conversa (ex.: "Analise este arquivo de notas").

                                    Prós:

                                    - Mantém a interação centralizada no chat (fluxo conversacional).
                                    - Menor esforço inicial (o `FileUploader.tsx` já existe e está integrado ao chat).

                                    Contras:

                                    - Gestão de arquivos fica menos visível para o usuário (difícil listar/uploads anteriores).
                                    - O backend precisa associar o arquivo a uma sessão/comando específico.

                                    ### Opção B — Seção dedicada para uploads

                                    Como funciona: criar uma página/área para listar arquivos enviados, permitir upload, reprocessamento e exclusão.

                                    Prós:

                                    - Melhor organização e gerenciamento do estado dos arquivos (processando, concluído, erro).
                                    - Possibilita ações administrativas (deletar, reprocessar).

                                    Contras:

                                    - Quebra o fluxo de conversação (usuário sai do chat).
                                    - Requer mais componentes e rotas no frontend.

                                    ### Recomendação

                                    Para o escopo do trabalho final, recomendo manter e refinar a Opção A (Upload via chat). É mais alinhado ao objetivo do projeto e demanda menos esforço. A Opção B pode ser documentada como melhoria futura.

                                    ## 3. Plano de ação — Backend (`eda-aiminds-back`)

                                    Objetivo: criar um endpoint que receba o CSV de notas, processe-o e armazene chunks/embeddings no vector store para que os agentes consultem.

                                    Passos sugeridos:

                                    1. Criar endpoint de upload específico para notas

                                    No arquivo `api_completa.py` crie um endpoint dedicado para evitar conflitos com uploads genéricos. Exemplo (Python/FastAPI):

                                    ```python
                                    from fastapi import APIRouter, UploadFile, File, HTTPException
                                    from src.agent.data_ingestor import DataIngestor  # ajusta conforme seu projeto

                                    router = APIRouter()

                                    @router.post("/upload/notas/", tags=["Upload"])
                                    async def upload_notas_file(file: UploadFile = File(...)):
                                            """Endpoint para upload e processamento de arquivos de notas (CSV)."""
                                            if not file.filename.endswith('.csv'):
                                                    raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Por favor, envie um arquivo .csv.")

                                            try:
                                                    temp_file_path = f"temp/{file.filename}"
                                                    # cria pasta temp se necessário
                                                    with open(temp_file_path, "wb") as buffer:
                                                            buffer.write(await file.read())

                                                    # instancia o ingestor de dados (ajuste parâmetros conforme implementação)
                                                    data_ingestor = DataIngestor(file_path=temp_file_path, file_id=file.filename)
                                                    # inicia o processo de ingestão (leitura, chunking, embeddings, etc.)
                                                    await data_ingestor.ingest_data()

                                                    return {"message": f"Arquivo '{file.filename}' processado e dados ingeridos com sucesso."}

                                            except Exception as e:
                                                    # adicionar logging do erro é uma boa prática
                                                    raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo: {str(e)}")

                                    ```

                                    2. Adaptar o `DataIngestor`

                                    - Ajustar `src/agent/data_ingestor.py` para interpretar a estrutura do "arquivo de notas" (possivelmente usando `pandas.read_csv`).
                                    - Na etapa de chunking (por exemplo em `src/embeddings/chunker.py`), criar chunks por linha/registro com formato legível, ex.:

                                        "Nota fiscal número {nf_numero} emitida por {emissor} com valor de R${valor}."

                                    - Incluir metadados úteis (ex.: `{'file_id': file.filename, 'tipo': 'nota_fiscal', 'data_emissao': '...'}`) para facilitar buscas futuras.

                                    3. Geração e armazenamento dos embeddings

                                    - Garantir que o fluxo que chama `EmbeddingGenerator` e `VectorStore` (em `src/embeddings/`) aceite os chunks gerados.
                                    - Verificar configurações de modelo e chaves em `settings`/variáveis de ambiente.

                                    ## 4. Plano de ação — Frontend (`eda-aiminds-front`)

                                    O frontend deve apontar para o novo endpoint e confirmar ao usuário que o arquivo foi processado.

                                    Passos sugeridos:

                                    1. Atualizar serviço de upload

                                    - No serviço ou componente que faz a requisição ao backend (ex.: `src/services/` ou diretamente em `src/components/FileUploader.tsx`), alterar a URL para `/upload/notas/`.

                                    Exemplo (axios):

                                    ```ts
                                    const handleFileUpload = async (file: File) => {
                                        const formData = new FormData()
                                        formData.append('file', file)

                                        try {
                                            const response = await axios.post('http://localhost:8000/upload/notas/', formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' },
                                            })
                                            console.log('Arquivo enviado com sucesso:', response.data)
                                            // exibir notificação/feedback ao usuário
                                        } catch (error) {
                                            console.error('Erro no upload do arquivo:', error)
                                            // exibir notificação de erro ao usuário
                                        }
                                    }
                                    ```

                                    2. Ajustar a interface do chat

                                    - No `src/components/ChatInterface.tsx`, após upload bem-sucedido, insira uma mensagem automática do sistema: "O arquivo nome_do_arquivo.csv foi carregado. Agora você pode fazer perguntas sobre ele." Isso melhora a experiência do usuário.

                                    ## 5. Testes e verificação

                                    Checklist para validação:

                                    - Teste unitário do endpoint: usar Insomnia/Postman ou testes automatizados para enviar um CSV de exemplo a `/upload/notas/`.
                                    - Verificar no Supabase/Postgres se os chunks/embeddings foram inseridos corretamente.
                                    - Teste ponta a ponta: executar frontend + backend, enviar arquivo via chat e observar processamento sem erros.
                                    - Teste de consulta: depois da ingestão, fazer perguntas no chat que dependam dos dados do arquivo e verificar se o agente RAG encontra as respostas.

                                    ## Observações finais

                                    Seguindo este plano vocês terão um caminho claro para implementar a funcionalidade faltante e finalizar o projeto. Como melhoria futura, considere adicionar uma seção dedicada de gerenciamento de arquivos (Opção B) para facilitar operações administrativas e reprocessamento.

                                    ---

                                    Se quiser, eu posso:

                                    - Gerar um exemplo de teste para o endpoint (pytest / requests).
                                    - Implementar o endpoint no repositório (se desejar que eu edite arquivos do backend aqui).
                                    - Atualizar o frontend (`FileUploader.tsx`) para apontar ao novo endpoint e exibir feedback.

                                    Diga qual próximo passo prefere que eu execute.
