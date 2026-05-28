import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
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

  // API: Send Email
  app.post('/api/send-email', async (req, res) => {
    try {
      const { to, subject, html, smtpUser, smtpPass, smtpProvider } = req.body;
      
      let modifiedHtml = html;
      const attachments: any[] = [];
      let c = 0;
      
      // Converte tags de imagem base64 para attachments CID inline
      modifiedHtml = modifiedHtml.replace(/<img[^>]+src="data:(image\/[^;]+);base64,([^"]+)"[^>]*>/g, (match: string, mime: string, base64: string) => {
          c++;
          const cid = `img${c}@hackdocument.pro`;
          attachments.push({
             filename: `image${c}.${mime.split('/')[1]}`,
             content: base64,
             encoding: 'base64',
             cid: cid
          });
          return match.replace(`data:${mime};base64,${base64}`, `cid:${cid}`);
      });

      let host = "smtp.mail.yahoo.com";
      if (smtpProvider === 'gmail') {
        host = "smtp.gmail.com";
      } else if (smtpProvider === 'yahoo') {
        host = "smtp.mail.yahoo.com";
      } else if (smtpProvider === 'outlook') {
        host = "smtp.office365.com";
      } else {
        // Fallback to auto-detection
        if (smtpUser.toLowerCase().includes('gmail')) host = "smtp.gmail.com";
        else if (smtpUser.toLowerCase().includes('outlook') || smtpUser.toLowerCase().includes('hotmail')) host = "smtp.office365.com";
        else host = "smtp.mail.yahoo.com";
      }

      const transporter = nodemailer.createTransport({
        host,
        port: 465,
        secure: true,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"DocuMestre Pro" <${smtpUser}>`,
        to,
        subject,
        html: modifiedHtml,
        attachments,
      });

      // Log success
      const db = await getDB();
      db.logs.unshift({
        id: Date.now().toString(),
        to,
        subject,
        timestamp: new Date().toLocaleString(),
        status: 'Sucesso'
      });
      if (db.logs.length > 50) db.logs.pop();
      await saveDB(db);

      res.json({ success: true });
    } catch (err: any) {
      // Log failure
      const db = await getDB();
      db.logs.unshift({
        id: Date.now().toString(),
        to: req.body.to,
        subject: req.body.subject,
        timestamp: new Date().toLocaleString(),
        status: `Erro: ${err.message}`
      });
      await saveDB(db);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/logs', async (req, res) => {
    try {
      const db = await getDB();
      res.json(db.logs || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Client lazy initialization helper for Gemini
  function getGeminiClient() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("Opção indisponível: GEMINI_API_KEY não configurada nos Secrets da aplicação.");
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

      const ai = getGeminiClient();
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

      const ai = getGeminiClient();
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

  // AI Endpoint: Templatize (Extract Data to Vars)
  app.post('/api/ai/templatize', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Conteúdo vazío." });

      const ai = getGeminiClient();
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

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Crie um modelo/template de documento profissional e elegante baseado na solicitação do usuário: "${prompt}".
Siga as diretrizes:
1. Deve ser escrito em formato HTML sem tags HTML/head/body globais, apenas a div externa e elementos filhos estruturados.
2. Insira classes limpas do Tailwind CSS para garantir sofisticação visual (margens, espaçamento de linha legível de cerca de 1.8x, cabeçalho sutil, negritos e seções divisórias). A cor do texto deve ser predominantemente preta ou carvão leve com fundo branco para excelente leitura ao preencher ou imprimir.
3. Crie e posicione variáveis usando o formato de duas chaves duplas {{nome_variavel}} em todos os pontos dinâmicos que deveriam ser completados no contexto real (ex: {{data_inicio}}, {{valor_total}}, {{dados_contratado}}).
4. Forneça um título enxuto e profissional correspondente para o template.`,
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

      const ai = getGeminiClient();
      const prompt = `Analise o documento fornecido na imagem ou PDF.
Transcreva 100% de todo o conteúdo textual, a estrutura correspondente e crie um HTML incrivelmente bonito usando classes do Tailwind CSS.
Regras:
1. Retorne HTML contendo todos os dados, espaçamentos, título, margens, com classes do Tailwind aplicadas apropriadamente.
2. Identifique partes dinâmicas como CPFs reais, Nomes do cliente, valores e substitua por formato de duas chaves {{nome_variavel}}.
3. Retorne tudo formatado visualmente para impressão (exemplo de classes no wrapper: bg-white p-10 max-w-4xl mx-auto shadow-sm border).
4. Retorne apenas JSON com as propriedades "name" (um titulo limpo) e "content" (todo HTML criado). Sem tags markdown \`\`\`json ou \`\`\`html.`;

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
          systemInstruction: "Você é um assistente OCR inteligente e especialista em UI/UX para documentos HTML.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["name", "content"]
          },
          temperature: 0.1
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
