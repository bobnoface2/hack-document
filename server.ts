import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import os from 'os';
import { defaultTemplates } from './src/defaultTemplates';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port must be 3000
const PORT = 3000;

// JSON DB for simplicity and compatibility (avoiding SQLite glibc issues)
const DB_FILE = path.join(process.cwd(), "HackDocumentPRO_Data.json");
const TEMPLATES_DIR = path.join(process.cwd(), "templates");

async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    try {
      await fs.writeFile(DB_FILE, JSON.stringify({ store: {}, logs: [] }, null, 2));
    } catch (err) {
      console.error("Failed to initialize DB", err);
    }
  }
}

async function initTemplates() {
  try {
    const db = await getDB();
    if (!db.templates) {
      db.templates = [];
      await saveDB(db);
    }
  } catch (err) {
    console.error("Failed to initialize templates structure", err);
  }
}

async function getDB() {
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

async function saveDB(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

initDB();
initTemplates();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.get('/imagem.ico', (req, res) => {
    const icoPath = path.join(process.cwd(), 'imagem.ico');
    res.sendFile(icoPath, err => {
      if (err) {
        res.status(404).send('Icon not found');
      }
    });
  });

  // API: Store
  app.post('/api/store', async (req, res) => {
    try {
      const { key, value } = req.body;
      const db = await getDB();
      db.store[key] = value;
      await saveDB(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/store', async (req, res) => {
    try {
      const key = req.query.key as string;
      const db = await getDB();
      res.json({ value: db.store[key] || null });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Physical Templates Directory
  app.get('/api/templates', async (req, res) => {
    try {
      const db = await getDB();
      const templatesList = [];
      try {
        const files = await fs.readdir(TEMPLATES_DIR);
        for (const filename of files) {
          if (filename.endsWith('.json')) {
            try {
              const filePath = path.join(TEMPLATES_DIR, filename);
              const raw = await fs.readFile(filePath, 'utf-8');
              templatesList.push(JSON.parse(raw));
            } catch (err) { }
          }
        }
      } catch (e) { }

      if (db.templates) {
        templatesList.push(...db.templates);
      }

      // Sort templates by updatedAt (newest first). Fallback to createdAt.
      templatesList.sort((a, b) => {
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        return bTime - aTime;
      });
      res.json(templatesList);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/templates', async (req, res) => {
    try {
      const template = req.body;
      if (!template.id) {
        return res.status(400).json({ error: "O template precisa de um ID válido." });
      }
      
      const db = await getDB();
      if (!db.templates) db.templates = [];
      const idx = db.templates.findIndex((t: any) => t.id === template.id);
      if (idx >= 0) db.templates[idx] = template;
      else db.templates.push(template);
      
      await saveDB(db);
      res.json({ success: true, template });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/templates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const db = await getDB();
      if (db.templates) {
        const len = db.templates.length;
        db.templates = db.templates.filter((t: any) => t.id !== id);
        if (db.templates.length !== len) {
          await saveDB(db);
          return res.json({ success: true });
        }
      }
      res.status(404).json({ error: "Template não encontrado." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Export PDF
  app.post('/api/export/pdf', async (req, res) => {
    try {
      const { content, filename } = req.body;
      const PDFDocument = (await import('pdfkit')).default;
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename || 'documento.pdf'}`);
      
      doc.pipe(res);
      doc.fontSize(12).text(content, 50, 50);
      doc.end();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // Client lazy initialization helper for Gemini
  async function getGeminiClient() {
    let dbKey = '';
    try {
      const db = await getDB();
      dbKey = db.store['documestre_gemini_key'];
    } catch (e) {
      // ignore
    }
    const key = dbKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("Opção indisponível: GEMINI_API_KEY não configurada nos Ajustes (Preferências) do sistema.");
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // AI Endpoint: Spellcheck
  app.post('/api/ai/spellcheck', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Conteúdo vazío." });

      const ai = await getGeminiClient();
      const prompt = `Faça UMA CORREÇÃO ORTOGRÁFICA E GRAMATICAL profunda neste texto.
Regras:
1. Preserve todas as tags HTML originais e classes CSS Tailwind.
2. Não altere as variáveis {{variavel}}, deixe-as intactas.
3. REGRA ABSOLUTA: É TOTALMENTE PROIBIDO gerar texto adicional, explicações, cumprimentos ou blocos markdown de código (\`\`\`html). Retorne APENAS E ESTRITAMENTE o HTML final corrigido. Nada antes, nada depois.

Conteúdo:
${content}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { systemInstruction: "Você é um revisor de ortografia de elite." }
      });
      res.json({ success: true, result: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Spacing
  app.post('/api/ai/spacing', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Conteúdo vazío." });

      const ai = await getGeminiClient();
      const prompt = `Corrija e melhore visualmente a estrura de ESPAÇAMENTOS (margin, padding, line-height, quebras de bloco) deste HTML de documento aplicando as classes corretas de Tailwind CSS.
Regras:
1. Deixe o documento com visual profissional, organizado e fácil de ler. 
2. Não altere o texto real ou variáveis {{variavel}}. 
3. REGRA ABSOLUTA: É TOTALMENTE PROIBIDO gerar explicações, introduções ou usar formatação de markdown. Sua resposta deve conter ESTRITAMENTE O CÓDIGO HTML bruto modificado.

Conteúdo HTML:
${content}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { systemInstruction: "Você é um expert em UI/UX e design de documentos usando HTML/Tailwind CSS." }
      });
      res.json({ success: true, result: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Batch Parse Data
  app.post('/api/ai/batch-parse', async (req, res) => {
    try {
      const { text, variables } = req.body;
      if (!text || !variables || !Array.isArray(variables)) {
        return res.status(400).json({ error: "Propriedades text e variables são obrigatórias." });
      }

      const ai = await getGeminiClient();
      const prompt = `ATUE COMO UM EXTRATOR DE DADOS ESTRUTURADOS.
O usuário enviou os seguintes dados (pode ser texto solto, lista ou tabular delimitado):
${text}

Preciso que você leia e identifique múltiplos "registros" (ex: múltiplas pessoas/itens).
Para CADA registro encontrado, extraia os valores para as seguintes chaves: ${variables.join(', ')}.
Se algum campo não estiver presente ou for deduzível como vazio, deixe como string vazia "".
A resposta DEVE ser estritamente um array JSON de objetos válidos. 
Exemplo de formato esperado: [{"nome": "joao", "cpf": "123"}, {"nome": "maria", "cpf": "456"}]
REGRA ABSOLUTA: É TOTALMENTE PROIBIDO gerar qualquer texto de introdução ou conclusão. Não use tags markdown (\`\`\`json). Retorne OBRIGATORIAMENTE O JSON PURO DA ARRAY. Qualquer palavra extra quebrará o sistema.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let resultText = response.text || "[]";
      const parsed = JSON.parse(resultText);
      res.json({ success: true, records: parsed });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Templatize (Extract Data to Vars)
  app.post('/api/ai/templatize', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Conteúdo vazío." });

      const ai = await getGeminiClient();
      const prompt = `Leia todo o documento abaixo. Localize dados específicos e reais (como nomes próprios, CPFs, RGs, Reais/Moedas, Datas, Endereços, etc.) e os SUBSTITUA por variáveis usando exatas duas chaves: {{nome_da_variavel}}.
Exemplo: Se achar "João Silva", troque por {{nome_cliente}}. Se achar "01/05/2026", troque por {{data_vencimento}}.

Regras MÁXIMAS de preservação:
1. É ESTRITAMENTE PROIBIDO alterar qualquer formatação, espaçamento (margin, padding, enter, tabs), classes CSS ou estrutura HTML do documento!
2. Retorne o documento EXATAMENTE do jeito que ele veio, mexendo APENAS nas posições exatas das palavras substituídas.
3. REGRA ABSOLUTA: PROIBIDO FORNECER QUALQUER RESPOSTA CONVERSACIONAL (como "Aqui está", "Entendido"). NUNCA use blocos markdown \`\`\`html. Sua resposta deve ser ÚNICA E EXCLUSIVAMENTE o conteúdo HTML final processado. Qualquer frase extra quebrará o sistema.

Conteúdo do documento:
${content}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { systemInstruction: "Você é um assistente cirúrgico que transforma documentos estáticos em modelos dinâmicos preenchíveis. Você faz substituições exatas como um Find and Replace, sem alterar nada além das palavras.", temperature: 0.1 }
      });
      res.json({ success: true, result: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Generate HTML Template from prompt
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "O prompt de geração de documento não foi fornecido." });
      }

      const ai = await getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Crie um modelo/template de documento profissional e elegante baseado na solicitação do usuário: "${prompt}".
Siga as diretrizes:
1. Deve ser escrito em formato HTML sem tags HTML/head/body globais, apenas a div externa e elementos filhos estruturados.
2. Insira classes limpas do Tailwind CSS para garantir sofisticação visual (margens, espaçamento de linha legível de cerca de 1.8x, cabeçalho sutil, negritos e seções divisórias). A cor do texto deve ser predominantemente preta ou carvão leve com fundo branco para excelente leitura ao preencher ou imprimir.
3. Crie e posicione variáveis usando o formato de duas chaves duplas {{nome_variavel}} em todos os pontos dinâmicos que deveriam ser completados no contexto real (ex: {{data_inicio}}, {{valor_total}}, {{dados_contratado}}).
4. O layout DEVE CABER EM UMA ÚNICA PÁGINA A4. Use classes compactas (text-xs ou text-sm, leading-tight) e reduza paddings e margens longas. A impressão não pode pular para a página 2.
5. Forneça um título enxuto e profissional correspondente para o template.
REGRA CRÍTICA DO SISTEMA: VOCÊ DEVE RETORNAR APENAS E EXCLUSIVAMENTE O FORMATO SOLICITADO NO SCHEMA (JSON), SEM BLOCOS MARKDOWN, SEM EXPLICAÇÕES, SEM "AQUI ESTÁ!".`,
        config: {
          systemInstruction: "MÁQUINA GERADORA DE TEMPLATES HTML. OBRIGATÓRIO: Resposta deve ser PURAMENTE conteúdo estrito no formato de um objeto estruturado (com as propriedades exigidas). Você tem MUDES e AMNÉSIA CONVERSACIONAL: Não diga frases. Responda APENAS os dados e o HTML estrito requirido, senão uma exceção fatal ocorrerá.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nome curto, formal e profissional do tipo de documento gerado" },
              content: { type: Type.STRING, description: "O código HTML estilizado de alta qualidade com classes Tailwind contendo as variáveis {{variaveis}}" }
            },
            required: ["name", "content"]
          },
          temperature: 0.7
        }
      });

      const dataResult = JSON.parse(response.text || '{}');
      res.json({ success: true, ...dataResult });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/generate:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Reproduce from image/pdf base64
  app.post('/api/ai/reproduce', async (req, res) => {
    try {
      const { base64Data, mimeType } = req.body;
      if (!base64Data || !mimeType) {
        return res.status(400).json({ error: "Arquivo vazio ou não providenciado." });
      }

      const ai = await getGeminiClient();
      const prompt = `ATUE COMO UMA MÁQUINA DE XEROX (FOTOCOPIADORA) INTELIGENTE.
Sua única função é escanear a imagem fornecida e recriar o documento idêntico ao original em HTML com Tailwind CSS.

Regras de Cópia Fiel (Xerox):
1. CÓPIA FIEL: O documento gerado deve ser uma cópia 100% fiel e idêntica ao original. Não altere os textos, títulos, rodapés ou estrutura de nenhuma forma.
2. RESPEITO ABSOLUTO A LINHAS E TABELAS: Você deve respeitar rigorosamente tanto as linhas horizontais quanto as linhas verticais originais do documento. 
   - Elementos como tabelas, divisores, grades de folha de ponto ou grades de relatórios devem ser recriados de forma idêntica.
   - Use as bordas apropriadas do Tailwind (ex: border, border-black, border-collapse, divide-x, divide-y, etc.) para assegurar que todas as grades verticais e horizontais fiquem perfeitamente visíveis e formatadas.
3. SEM RESPOSTAS OU TEXTOS EXTRAS: Retorne APENAS o documento solicitado e estruturado. Não adicione nenhum tipo de nota, explicação, introdução, aviso de IA ou texto extra no documento. O documento final deve parecer um documento real, limpo de qualquer metadado do prompt.
4. GERAÇÃO DE VARIÁVEIS: Identifique dados variáveis específicos já preenchidos no documento original (ex: nomes de pessoas, CPFs, datas específicas, valores monetários preenchidos, horários) e converta-os para o formato de chaves {{nome_da_variavel}}.
5. CAMPOS VAZIOS: Se um espaço ou célula de tabela estiver sem dados, em branco ou apenas com uma linha tracejada lisa para preenchimento posterior, mantenha-a perfeitamente em branco, sem inventar texto ou variáveis desnecessárias.
6. COMPATIBILIDADE A4: O layout completo deve ser dimensionado perfeitamente para caber em uma página A4 sem ultrapassar limites físicos, usando espaçamentos e fontes equilibradas.
7. REGRA ABSOLUTA DE SAÍDA: O JSON DEVE SER PURO E CRU. PROÍBIDO USO DE MARKDOWN (\`\`\`json) OU TEXTO DE SAUDAÇÃO. RETORNE MERA E EXCLUSIVAMENTE AS CHAVES OBRIGATÓRIAS COMPILADAS NO TIPO EXIGIDO. QUALQUER TEXTO FORA DO JSON IRÁ CORROMPER A INICIALIZAÇÃO DO SERVIDOR.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Data } }
            ]
          }
        ],
        config: {
          systemInstruction: "VOCÊ É UMA MÁQUINA DE XEROX HTML. Você clona as imagens de documentos que recebe com 100% de precisão para HTML/Tailwind. REGRA RÍGIDA: NÃO fale, NÃO cumprimente, NÃO use code blocks em markdown, emita EXCLUSIVAMENTE O FORMATO DE DADOS EXIGIDO no responseSchema (JSON PURO).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["name", "content"]
          },
          temperature: 0.0,
          topP: 0.1,
          topK: 1
        }
      });

      const dataResult = JSON.parse(response.text || '{}');
      res.json({ success: true, ...dataResult });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/reproduce:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Rewrite / Tone / Legal Adjustment
  app.post('/api/ai/rewrite', async (req, res) => {
    try {
      const { content, action } = req.body;
      if (!content) return res.status(400).json({ error: "Conteúdo vazio." });
      if (!action) return res.status(400).json({ error: "Ação de reescrita não informada." });

      const ai = await getGeminiClient();
      let instruction = "";

      if (action === 'formalize') {
        instruction = "Reescreva este trecho em linguagem corporativa de altíssimo escalão, extremamente formal, polida e elegante, no estilo de diretores e advogados sêniores de multinacionais, mantendo o sentido original intacto.";
      } else if (action === 'legal_robust') {
        instruction = "Aumente significativamente a segurança jurídica (compliance) e a robustez das obrigações neste trecho. Use terminologia legal precisa, afaste ambiguidades e garanta proteção máxima para quem está contratando.";
      } else if (action === 'simplify') {
        instruction = "Simplifique e torne este trecho extremamente claro, objetivo e conciso. Remova o excesso de jargões técnicos difíceis de compreender (juridiquês), mantendo total validade e exatidão operacional.";
      } else if (action === 'translate_en') {
        instruction = "Traduza este trecho para o inglês de negócios e contratos internacionais (Business Legal English) com máxima precisão terminológica.";
      } else if (action === 'translate_es') {
        instruction = "Traduza este trecho para o espanhol culto corporativo de negócios e contratos (Castellano Corporativo) de alta qualidade.";
      } else {
        instruction = "Melhore e otimize a redação deste texto corporativo para torná-lo impecável e profissional.";
      }

      const prompt = `Atue como um redator corporativo e advogado de compliance de elite.
Sua tarefa é modificar o texto do usuário baseado na seguinte instrução: "${instruction}"

Regras Críticas:
1. Preserve com absoluta fidelidade todos os marcadores, tags HTML, propriedades Tailwind e as variáveis escritas entre chaves duplas {{nome_da_variavel}}. Eles não podem ser desfeitos ou modificados.
2. REGRA TOTAL E ABSOLUTA: É estritamente PROIBIDO adicionar saudações, introduções, justificativas ou blocos de código markdown (\`\`\`html). Sua resposta deve conter ÚNICA E EXCLUSIVAMENTE o texto final polido. Todo o sistema quebrará se você retornar qualquer caractere a mais.

Conteúdo de entrada:
${content}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { systemInstruction: "Você é um refinador ortográfico e redator corporativo de contratos b2b s/a." }
      });

      res.json({ success: true, result: response.text });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/rewrite:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Deep Contract Compliance & Risk Auditor
  app.post('/api/ai/audit', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Conteúdo do documento vazio." });

      const ai = await getGeminiClient();
      const prompt = `Analise detalhadamente o documento corporativo abaixo. Identifique falhas de compliance, brechas em contratos, riscos para a empresa contratante (ausência de multas claras, multas unilaterais abusivas, prazos indefinidos, confidencialidade frouxa, falta de clareza no objeto ou eleição de foro inexistente).

Após a auditoria, compile seus achados na estrutura de dados JSON informada.
O documento está escrito em formato HTML:
${content}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é um auditor de termos jurídicos b2b e diretor sênior de governança corporativa. Sua função é auditar contratos, analisar riscos financeiros e de compliance e indicar pontos críticos reais. Você é mudo e frio: emita apenas o JSON exigido e nada mais.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              complianceScore: { type: Type.INTEGER, description: "Pontuação de conformidade e segurança jurídica, de 0 a 100" },
              executiveSummary: { type: Type.STRING, description: "Resumo executivo em português da análise, destacando a qualidade e nível de governança do instrumento" },
              risks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.STRING, description: "Nível do risco: 'Alto', 'Médio' ou 'Baixo'" },
                    clause: { type: Type.STRING, description: "Título da cláusula ou seção associada ao risco" },
                    impact: { type: Type.STRING, description: "Impacto financeiro ou operacional prejudicial decorrente do risco" },
                    suggestion: { type: Type.STRING, description: "Recomendação textual ou redação segura para mitigar ou sanar o risco" }
                  },
                  required: ["level", "clause", "impact", "suggestion"]
                }
              },
              missingItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Cláusulas cruciais, proteções ou anexos importantes que estão ausentes no documento atual"
              }
            },
            required: ["complianceScore", "executiveSummary", "risks", "missingItems"]
          },
          temperature: 0.2
        }
      });

      const parsedAudit = JSON.parse(response.text || '{}');
      res.json({ success: true, audit: parsedAudit });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/audit:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Generate Dynamic Corporate Clauses S/A
  app.post('/api/ai/generate-clause', async (req, res) => {
    try {
      const { clauseType, customPrompt } = req.body;
      const ai = await getGeminiClient();

      let prompt = "";
      if (clauseType === 'custom') {
        prompt = `Escreva uma cláusula contratual customizada e de conformidade legal de alto escalão com base nas seguintes orientações do usuário: "${customPrompt}".`;
      } else if (clauseType === 'nda') {
        prompt = `Escreva uma Cláusula de Confidencialidade e Sigilo (NDA S/A) extremamente rigorosa e robusta para contratos b2b, estipulando multas pesadas por quebra de sigilo institucional, obrigação de devolução de dados em até 5 dias pós-rescisão, validade mínima de 5 anos adicionais e proteção de segredos industriais.`;
      } else if (clauseType === 'sla') {
        prompt = `Escreva uma Cláusula de Níveis de Serviço (SLA) e Limitador de Responsabilidade Corporativa, estipulando tempos máximos de resposta (Urgente: 2h, Alta: 8h, Normal: 24h), multas compensatórias de até 10% do faturamento mensal em caso de inadimplemento do SLA, e limitação mútua de responsabilidade direta limitada a 100% dos valores pagos nos últimos 12 meses.`;
      } else if (clauseType === 'ip') {
        prompt = `Escreva uma Cláusula de Propriedade Intelectual (IP) reversiva e indestrutível, salvaguardando que todos os softwares, designs, códigos, patentes e marcas gerados durante a vigência do contrato pertencem exclusiva e inteiramente à parte contratante, sendo outorgada apenas uma licença temporária, intransferível e não exclusiva para fins de execução operativa.`;
      } else if (clauseType === 'termination') {
        prompt = `Escreva uma Cláusula de Rescisão de Pleno Direito e Penalidades Comerciais por descumprimento, exigindo aviso prévio de 30 dias para rescisão sem justa causa, rescisão imediata em caso de falência, recuperação judicial ou fraudes de compliance, com multa penal irredutível correspondente a 20% do saldo total estimado do contrato.`;
      } else {
        prompt = `Escreva uma cláusula contratual corporativa e de compliance jurídico sênior generalista de alta segurança.`;
      }

      const fullPrompt = `${prompt}
      
Regras Absolutas de Geração:
1. Retorne o texto formatado elegantemente com tags HTML básicas adequadas para inserção direta no editor (como <p>, <ul>, <li>, <strong>, ou tabelas se julgar necessário, mas preferencialmente parágrafo estruturado com parágrafos numerados ex.: 'Parágrafo Único', 'Parágrafo Primeiro', 'Item A').
2. Utilize estilo de digitação comercial sênior (Juridiquês moderno e claro, sem clichês informais). Use termos como 'Acordo', 'Instrumento', 'Partes', 'Contratante', 'Contratada'.
3. REGRA EXTREMA: Retorne APENAS o HTML final gerado de forma limpa. Não inclua cabeçalhos extras, introduções do tipo "Aqui está sua cláusula:", congratulações, explicações ou blocos de código com a sintaxe do markdown (\`\`\`html). Se houver qualquer coisa além do HTML final, o sistema quebrará.

Garanta coerência jurídica total.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction: "Você é um renomado redator de contratos e sócio sênior de um dos maiores escritórios de advocacia corporativa do mundo (M&A e Compliance de Elite). Você apenas emite o texto legal pronto com tags HTML limpas de forma direta, sem falar mais nada.",
          temperature: 0.3
        }
      });

      res.json({ success: true, clause: response.text });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/generate-clause:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Intelligent variable autofill from raw text S/A
  app.post('/api/ai/autofill-vars', async (req, res) => {
    try {
      const { text, variables } = req.body;
      if (!text || !variables || !Array.isArray(variables)) {
        return res.status(400).json({ error: "Parâmetros 'text' e 'variables' exigidos." });
      }

      const ai = await getGeminiClient();
      const prompt = `ATUE COMO UM PARSER INTELIGENTE DE CONTRATOS.
O usuário quer preencher os campos do documento com base nas informações avulsas descritas abaixo:
"${text}"

Preciso que você leia este texto com atenção e mapeie as informações para as seguintes chaves do formulário contratual:
${JSON.stringify(variables)}

Regras de Extração:
1. Extraia e preencha o valor correspondente de forma exata e elegante para cada chave.
2. Formate datas no formato brasileiro (DD/MM/AAAA) se deduzíveis. Formate valores monetários para "R$ X.XXX,XX" se aplicável.
3. Se alguma chave não puder ser deduzida ou estiver totalmente ausente, deixe-a com string vazia "".
4. Retorne OBRIGATORIAMENTE apenas um objeto JSON com as chaves e valores mapeados. Exemplo: {"nome": "Guilherme Santos", "cpf": "123.456.789-00"}.
5. Não use marcações de código markdown (\`\`\`json). Retorne apenas o JSON bruto na resposta.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      const parsedValues = JSON.parse(response.text || '{}');
      res.json({ success: true, values: parsedValues });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/autofill-vars:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Jurisdiction Adaptability & Localization S/A
  app.post('/api/ai/localize', async (req, res) => {
    try {
      const { content, jurisdiction } = req.body;
      if (!content || !jurisdiction) {
        return res.status(400).json({ error: "Parâmetros 'content' e 'jurisdiction' são obrigatórios." });
      }

      const ai = await getGeminiClient();

      let jurisdictionDesc = "";
      if (jurisdiction === 'br_civil') {
        jurisdictionDesc = "Direito Civil Brasileiro (Código Civil de 2002 e Leis Federais correlatas), utilizando termos corriqueiros de cartórios, foro e obrigações do ordenamento nacional.";
      } else if (jurisdiction === 'us_delaware') {
        jurisdictionDesc = "Delaware Corporate Law (EUA), adaptando o texto para normas anglo-saxãs de Common Law, estipulando convenções bilaterais americanas, termos como 'representante autorizado', e foro no Estado de Delaware.";
      } else if (jurisdiction === 'eu_gdpr') {
        jurisdictionDesc = "Conformidade GDPR e LGPD Europeia/Nacional, adaptando cláusulas de privacidade, tratamento de cookies, eliminação definitiva e sigilo de dados sob os rígidos parâmetros dos regulamentos gerais de proteção de dados.";
      } else if (jurisdiction === 'mercosul_arbitration') {
        jurisdictionDesc = "Arbitragem Internacional do Mercosul, inserindo regras específicas de eleição de câmara arbitral internacional (como a CCI ou congênere) e resolvendo litígios sob resoluções multilaterais do bloco.";
      } else {
        jurisdictionDesc = `Jurisdição solicitada: ${jurisdiction}. Adapte o texto para cumprir as boas práticas dessa localidade legal específica.`;
      }

      const prompt = `ATUE COMO UM CONSULTOR INTERNACIONAL SÊNIOR DE CONLITOS E JURISDIÇÃO.
Adapte e reescreva o trecho legal/contratual a seguir para que fique em total conformidade técnica e semântica com o seguinte ordenamento: ${jurisdictionDesc}

TRECHO ORIGINAL DE ENTRADA:
"${content}"

Regras Absolutas de Geração:
1. Se o trecho de entrada tiver tags HTML, preserve-as ou re-estruture o resultado em tags HTML limpas (<p>, <li>, etc.).
2. Adote termos formais avançados (Juridiquês sofisticado, condizente com acordos empresariais de grande porte).
3. Mantenha os valores inteiros das cláusulas e a finalidade do contrato original intactos, apenas localizando as referências legais, foros corriqueiros e expressões latinas ou idiomáticas equivalentes mais aceitas naquela jurisdição.
4. REGRA EXTREMA: Retorne APENAS o HTML final gerado diretamente no corpo da resposta legal pronta, sem introduções ou marcações de markdown do tipo \`\`\`html. Qualquer elemento extra causará erro.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é um consultor jurídico internacional sênior especializado em contratos transfronteiriços de M&A. Responda apenas com o texto legal adaptado no formato HTML de inserção direta.",
          temperature: 0.3
        }
      });

      res.json({ success: true, result: response.text });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/localize:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Dynamic Interactive Clause Negotiator (Estudo Bilateral)
  app.post('/api/ai/negotiate', async (req, res) => {
    try {
      const { clauseText } = req.body;
      if (!clauseText) {
        return res.status(400).json({ error: "Parâmetro 'clauseText' é obrigatório." });
      }

      const ai = await getGeminiClient();
      const prompt = `ATUE COMO UM MEDIADOR SÊNIOR DE LITÍGIOS CORPORATIVOS E NEGOCIAÇÃO DE CONTRATOS S/A.
Analise a seguinte cláusula contratual e prepare duas versões de contraproposta alternativas extremamente competitivas, seguidas de uma rápida justificativa tática.

CLÁUSULA COMERCIAL PARA ANÁLISE:
"${clauseText}"

Instruções Estruturais e de Formato de Resposta:
Você deve retornar OBRIGATORIAMENTE um objeto JSON válido contendo exatamente as seguintes chaves:
{
  "buyerVersion": "Uma variação da cláusula que seja altamente benéfica para a contratante/compradora (por exemplo, estendendo prazos a seu favor, reduzindo multas relativas, aumentando penalidades para a outra parte, etc.). Formate em HTML limpo.",
  "vendorVersion": "Uma variação da cláusula que seja altamente benéfica para a contratada/provedora (como mitigando riscos, limitando indenizações ao valor pago, reduzindo prazos de repúdio, etc.). Formate em HTML limpo.",
  "brief": "Um parágrafo de análise de apenas duas linhas com a estratégia tática comercial sênior por trás das alterações propostas."
}

Regras Cruciais:
1. Retorne APENAS o objeto JSON direto, sem markdown do tipo \`\`\`json ou qualquer texto ao redor. O formato precisa ser analisável pelo JSON.parse.
2. O tom deve ser de advocacia de excelência internacional.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });

      const parsedResult = JSON.parse(response.text || '{}');
      res.json({ success: true, data: parsedResult });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/negotiate:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Generate Dynamic Executive Briefing S/A Board Summary
  app.post('/api/ai/board-briefing', async (req, res) => {
    try {
      const { docHtml } = req.body;
      if (!docHtml || docHtml.trim() === '') {
        return res.status(400).json({ error: "O conteúdo do documento está vazio ou não pôde ser lido." });
      }

      const ai = await getGeminiClient();
      const prompt = `ATUE COMO COMPLIANCE OFFICER E CONSELHEIRO CORPORATIVO DE BOARD DE ADMINISTRAÇÃO DAS EMPRESAS S/A SÊNIOR.
Com base no inteiro teor do contrato fornecido abaixo em formato HTML, extraia e estruture uma 'Ficha Técnica de Governança e Board Summary S/A' altamente profissional.

CONTRATO INTEGRAL DE ENTRADA:
"${docHtml}"

Como deve ser o design do HTML retornado:
Adapte o design em HTML de forma que ao ser inserido no documento, possua um visual limpo e suntuoso, compatível com a impressão e folhas timbradas corporativas.
Utilize uma estrutura de containers em linha, tabelas elegantes e listas sofisticadas. Evite cores gritantes; prefira cinzas de grande contraste, bordas sólidas pretas e cinzas finas, fontes mono para dados cruciais de prazos/valores, tags <strong> de destaque em preto e espaçamentos limpos.

O resumo deve conter:
1. Título do Sumário: 'FICHA TÉCNICA DE COMPLIANCE E REGULAÇÃO S/A' com um subtítulo explicativo de auditoria prévia.
2. Identificação das Partes e Objeto: Uma tabela detalhando quem assume a posição Ativa e Passiva e o propósito da transação.
3. Principais Obrigações Financeiras e Limitação de Responsabilidade: Um sumário das faturas, multas, SLA ou teto de responsabilidade (ex: indenizações).
4. Próximos Eventos & Marcos Críticos: Tabela de entregas, renovações ou prazos cruciais inferidos do texto.
5. Ponto Focal de Riscos do C-Level: 2 ou 3 alertas essenciais de compliance para os diretores estarem cientes.

Regras Absolutas de Geração:
1. Retorne APENAS o HTML final gerado de forma limpa. Não inclua cabeçalhos extras, introduções do tipo "Certamente, aqui está...", justificativas de layout ou blocos de código com a sintaxe do markdown (\`\`\`html). Se houver qualquer coisa além do HTML final, o sistema quebrará.
2. Empregue juridiquês excelente de board corporativo institucional.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é o Diretor Global de Compliance e Governança Jurídica de uma multinacional de auditoria de elite. Você gera apenas fofas e perfeitas fichas técnicas de conselho em HTML puro sem introduções ou desculpas.",
          temperature: 0.2
        }
      });

      res.json({ success: true, briefingHtml: response.text });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/board-briefing:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Generate Email HTML & Subject Line S/A
  app.post('/api/ai/generate-email', async (req, res) => {
    try {
      const { tema, corPrincipal, corSecundaria, estilo, cabecalho, mensagem, botaoTexto, botaoLink, rodape, layoutBlocks } = req.body;
      const ai = await getGeminiClient();

      const prompt = `Crie um modelo de e-mail corporativo decorado e de altíssima conversão baseado nas seguintes variáveis:
- Tema: ${tema || "Informativo Geral"}
- Estilo: ${estilo || "profissional"}
- Cores de Preferência: Principal="${corPrincipal || "#1a1a1a"}", Secundária="${corSecundaria || "#39FF14"}"
- Cabeçalho / Logo info: ${cabecalho || "Empresa Corporativa"}
- Mensagem (Corpo do Email): ${mensagem || "Escreva uma mensagem padrão profissional."}
- Chamada de Ação (Botão): Texto="${botaoTexto || "Clique Aqui"}", Link="${botaoLink || "#"}"
- Rodapé: ${rodape || "Todos os direitos reservados."}

Blocos de Layout opcionais que você DEVE integrar:
1. Banner Superior (Imagem Placeholder elegante de unsplash, como imagens abstratas ou corporativas limpas): ${layoutBlocks?.banner ? "SIM - Coloque um banner de imagem de cabeçalho sutil" : "NÃO"}
2. Tabela de 3 Recursos/Características com mini ícones ou destaque visual: ${layoutBlocks?.features ? "SIM - Adicione uma seção de 3 recursos-chave organizados em colunas com descrição" : "NÃO"}
3. Caixa de Cupom / Código de Desconto em destaque ("HTML COUPON BOX"): ${layoutBlocks?.coupon ? "SIM - Crie um container retangular destacado com bordas tracejadas e estilo de cupom de desconto" : "NÃO"}
4. Assinatura do Remetente ou Bloco Social: ${layoutBlocks?.social ? "SIM - Inclua um bloco social elegante e informações de contato no rodapé" : "NÃO"}

Diretrizes de Layout e Estilo:
1. Retorne o código em HTML limpo utilizando classes Tailwind CSS elegantes.
2. Certifique-se de que o design se adapte de forma fantástica no visual do e-mail. Utilize uma largura máxima de 600px para o e-mail, centralizado, de modo que pareça uma newsletter real, mas sofisticada.
3. Não utilize tags de html inteiro (como <html> ou <body>), apenas a div container externa principal e seus filhos organizados.
4. O email deve ser extremamente limpo e voltado para vendas e profissionalismo, com fontes bonitas e grande contraste de leitura.
5. Emita também uma sugestão incrível de assunto de e-mail (subject line) de alta taxa de abertura baseado nas técnicas de copywriting adequadas ao estilo escolhido.

SUA RESPOSTA DEVE SER ESTRITAMENTE EM FORMATO JSON:
{
  "subject": "A linha de assunto recomendada",
  "html": "O código HTML puro com as classes Tailwind e o conteúdo estilizado"
}
REGRA DE OURO: Não gere introduções, explicações ou markdown (\`\`\`json). Retorne apenas o objeto JSON puro compatível com JSON.parse.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é um Copywriter de elite e Designer especialista em e-mail marketing (HTML/Tailwind CSS). Você cria campanhas altamente persuasivas e esteticamente perfeitas. Você só emite o objeto JSON direto, sem falar mais nada.",
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const dataResult = JSON.parse(response.text || '{}');
      res.json({ success: true, ...dataResult });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/generate-email:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Escopo do pkg (empacotamento executavel) - a build estara no mesmo __dirname do bundle js (dentro do zip compilado)
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running at http://localhost:${PORT}`);
    
    // Automatically open browser if we are running as a compiled standalone app
    if (process.env.NODE_ENV === 'production') {
      try {
        const open = (await import('open')).default;
        await open(`http://localhost:${PORT}`);
      } catch (err) {
        console.log("-> Acesse http://localhost:3000 em seu navegador.");
      }
    }
  });
}

startServer();
