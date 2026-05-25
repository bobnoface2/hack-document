import { useState, useEffect } from 'react';
import { Template, GeneratedDocument } from './types';
import { defaultTemplates } from './defaultTemplates';

const TEMPLATES_KEY = 'documestre_templates';
const DOCS_KEY = 'documestre_documents';

export function useAppStore() {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem(TEMPLATES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Template[];
        const missingDefaults = defaultTemplates.filter(
          def => !parsed.some(p => p.id === def.id)
        );
        return [...parsed, ...missingDefaults];
      } catch (e) {
        return defaultTemplates;
      }
    }
    return defaultTemplates;
  });

  const [documents, setDocuments] = useState<GeneratedDocument[]>(() => {
    const saved = localStorage.getItem(DOCS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [smtpUser, setSmtpUser] = useState<string>(() => {
    return localStorage.getItem('documestre_smtp_user') || '';
  });

  const [smtpPass, setSmtpPass] = useState<string>(() => {
    return localStorage.getItem('documestre_smtp_pass') || '';
  });

  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return localStorage.getItem('documestre_gemini_key') || '';
  });

  useEffect(() => {
    const apiGet = async (key: string) => {
      try {
        const res = await fetch(`/api/store?key=${key}`);
        const data = await res.json();
        return data.value;
      } catch (e) {
        return null;
      }
    };

    const loadFromDb = async () => {
      // Load templates from physical file directory
      try {
        const res = await fetch('/api/templates');
        if (res.ok) {
          const serverTemplates = await res.json() as Template[];
          if (serverTemplates && serverTemplates.length > 0) {
            setTemplates(serverTemplates);
            localStorage.setItem(TEMPLATES_KEY, JSON.stringify(serverTemplates));
          }
        }
      } catch (err) {
        console.error("Falha ao carregar templates do diretório físico:", err);
      }

      // Load other states
      const docsStr = await apiGet(DOCS_KEY);
      if (docsStr) {
        try { setDocuments(JSON.parse(docsStr)); } catch(e) {}
      }
      
      const smtpU = await apiGet('documestre_smtp_user');
      if (smtpU) setSmtpUser(smtpU);

      const smtpP = await apiGet('documestre_smtp_pass');
      if (smtpP) setSmtpPass(smtpP);

      const geminiK = await apiGet('documestre_gemini_key');
      if (geminiK) setGeminiKey(geminiK);
    };
    
    loadFromDb();
  }, []);

  const apiSet = async (key: string, value: string) => {
    try {
      await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch (e) {}
  };

  // We only cache templates locally for lightning fast boot, saving is handled individually
  useEffect(() => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(DOCS_KEY, JSON.stringify(documents));
    apiSet(DOCS_KEY, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('documestre_smtp_user', smtpUser);
    apiSet('documestre_smtp_user', smtpUser);
  }, [smtpUser]);

  useEffect(() => {
    localStorage.setItem('documestre_smtp_pass', smtpPass);
    apiSet('documestre_smtp_pass', smtpPass);
  }, [smtpPass]);

  useEffect(() => {
    localStorage.setItem('documestre_gemini_key', geminiKey);
    apiSet('documestre_gemini_key', geminiKey);
  }, [geminiKey]);

  const addTemplate = async (template: Template) => {
    setTemplates((prev) => [template, ...prev]);
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
    } catch (err) {
      console.error("Falha ao persistir novo template no servidor:", err);
    }
  };

  const updateTemplate = async (id: string, updated: Partial<Template>) => {
    setTemplates((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updated, updatedAt: new Date().toISOString() } : t));
      const updatedTmpl = next.find((t) => t.id === id);
      if (updatedTmpl) {
        fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTmpl)
        }).catch((err) => console.error("Falha ao persistir template atualizado no servidor:", err));
      }
      return next;
    });
  };

  const deleteTemplate = async (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Falha ao deletar template do servidor:", err);
    }
  };

  const saveDocument = (doc: GeneratedDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return {
    templates,
    documents,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    saveDocument,
    deleteDocument,
    smtpUser,
    setSmtpUser,
    smtpPass,
    setSmtpPass,
    geminiKey,
    setGeminiKey,
  };
}
