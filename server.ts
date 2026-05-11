import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API endpoint to send email
  app.post('/api/send-email', async (req, res) => {
    const { to, subject, html, smtpUser: reqSmtpUser, smtpPass: reqSmtpPass } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const finalSmtpUser = reqSmtpUser || process.env.SMTP_USER;
      const finalSmtpPass = reqSmtpPass || process.env.SMTP_PASS;

      if (!finalSmtpUser || !finalSmtpPass) {
        return res.status(400).json({ error: 'Faltam credenciais SMTP' });
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mail.yahoo.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true, 
        auth: {
          user: finalSmtpUser,
          pass: finalSmtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"Hack Document" <${finalSmtpUser}>`,
        to,
        subject,
        html,
      });

      console.log('Message sent: %s', info.messageId);
      res.json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email', details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
