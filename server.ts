import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import os from 'os';
// Removed GoogleGenerativeAI

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port must be 3000
const PORT = 3000;

// JSON DB for simplicity and compatibility (avoiding SQLite glibc issues)
const DB_FILE = path.join(process.cwd(), "HackDocumentPRO_Data.json");

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

async function getDB() {
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

async function saveDB(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

initDB();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

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

  // API: AI Refine
  app.post('/api/ai/refine', async (req, res) => {
    try {
      const { prompt, content } = req.body;
      const fullPrompt = `${prompt}\n\nAplique isso ao seguinte texto (retorne apenas o texto modificado):\n\n${content}`;
      
      // Integracao com Ollama Llama Localmente
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3', // Modelo padrao do ollama, pode ser alterado
          prompt: fullPrompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json({ refinedContent: data.response });
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
      const { to, subject, html, smtpUser, smtpPass } = req.body;
      
      let host = "smtp.mail.yahoo.com";
      if (smtpUser.toLowerCase().includes('gmail')) host = "smtp.gmail.com";
      else if (smtpUser.toLowerCase().includes('outlook') || smtpUser.toLowerCase().includes('hotmail')) host = "smtp.office365.com";

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
        html,
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
      res.json(db.logs);
    } catch (err: any) {
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
