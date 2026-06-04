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
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });
    const files = await fs.readdir(TEMPLATES_DIR);
    if (files.length === 0) {
      console.log("Populating physical templates directory with default templates...");
      for (const template of defaultTemplates) {
        const templatePath = path.join(TEMPLATES_DIR, `${template.id}.json`);
        await fs.writeFile(templatePath, JSON.stringify(template, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.error("Failed to initialize templates directory", err);
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
      await fs.mkdir(TEMPLATES_DIR, { recursive: true });
      const files = await fs.readdir(TEMPLATES_DIR);
      const templatesList = [];
      for (const filename of files) {
        if (filename.endsWith('.json')) {
          try {
            const filePath = path.join(TEMPLATES_DIR, filename);
            const raw = await fs.readFile(filePath, 'utf-8');
            templatesList.push(JSON.parse(raw));
          } catch (err) {
            console.error(`Error reading template file ${filename}:`, err);
          }
        }
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
      await fs.mkdir(TEMPLATES_DIR, { recursive: true });
      const templatePath = path.join(TEMPLATES_DIR, `${template.id}.json`);
      await fs.writeFile(templatePath, JSON.stringify(template, null, 2), 'utf-8');
      res.json({ success: true, template });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/templates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const templatePath = path.join(TEMPLATES_DIR, `${id}.json`);
      try {
        await fs.unlink(templatePath);
        res.json({ success: true });
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          res.status(404).json({ error: "Template não encontrado." });
        } else {
          throw err;
        }
      }
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
3. Não adicione explicações de Markdown (ex: sem \`\`\`html). Retorne APENAS o HTML final corrigido ortograficamente.

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
3. Retorne APENAS HTML, sem markdown de blocos de código.

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
Nenhum texto adicional ou tags markdown, retorne a resposta OBRIGATORIAMENTE em JSON puro no formato List<Object>.`;

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
3. Não adicione blocos invisíveis, formatações de markdown ou quebras de linhas novas. Retorne APENAS o documento processado.

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
5. Forneça um título enxuto e profissional correspondente para o template.`,
        config: {
          systemInstruction: "Você é uma inteligência artificial assistente de design de documentos especialista em criar templates em HTML com variáveis automáticas.",
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
Sua única função é "escanear" a imagem fornecida e recriar EXATAMENTE O MESMO DOCUMENTO em HTML com Tailwind CSS. 
Regras:
1. OBRIGAÇÃO MÁXIMA E ABSOLUTA CÓPIA FIEL: O documento gerado DEVE SER UMA CÓPIA 100% FIEL E IDÊNTICA AO ORIGINAL. Não modifique absolutamente nada no texto, na ordem ou na estrutura.
2. TABELAS E GRADES: Se houver uma tabela (ex: folha de ponto, relatórios), recrie EXATAMENTE o número de linhas e colunas. USE BORDAS CORRETAMENTE (border, border-black, border-collapse, etc.). Coloque TODAS as linhas verticais (border-l, border-r, divide-x) e horizontais (border-t, border-b, divide-y) que estiverem presentes e visíveis na foto. NÃO ignore linhas internas ou de separação.
3. ABSOLUTAMENTE TODOS OS DADOS ESPECÍFICOS E PREENCHIDOS DEVEM VIRAR VARIÁVEIS! Isso inclui CPFs, Nomes, Valores, datas, horários, horas trabalhadas, números, etc. Substitua-os pelo formato de chaves {{nome_da_variavel}}.
4. REGRA CRUCIAL DE CAMPOS VAZIOS: Se um campo (ou célula da tabela) estiver vazio, em branco ou tiver apenas linha pontilhada/sublinhado/espaço em branco, DEIXE EM BRANCO. NÃO invente variáveis para espaços vazios, NÃO insira "-" ou "___", NÃO preencha células vazias! Apenas mantenha a estrutura da célula em branco.
5. Para campos de assinatura, crie apenas uma linha simples com o texto embaixo (ex: <div class="text-center mt-8"><div class="border-t border-black w-48 mx-auto mb-2"></div><p>Assinatura</p></div>).
6. O layout DEVE CABER EM UMA ÚNICA PÁGINA A4. Use classes compactas (text-[10px], text-xs, py-1) e evite gap/margin excessivo.
7. Retorne apenas JSON com as propriedades "name" (um titulo limpo) e "content" (todo HTML criado). Sem tags markdown \`\`\`json ou \`\`\`html.
8. VOCÊ DEVE SER EXATAMENTE DETERMINÍSTICO. NUNCA INVENTE DADOS que não estão explicitamente visíveis na imagem.`;

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
          systemInstruction: "VOCÊ É UMA MÁQUINA DE XEROX HTML. Você clona as imagens que recebe convertendo 100% de precisão para HTML/Tailwind. Você tem amnésia criativa: você nunca inventa texto, nunca preenche espaços em branco, e nunca altera a formatação original além de converter para Tailwind.",
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
