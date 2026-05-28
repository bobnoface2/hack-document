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
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse documents from localStorage", e);
      }
    }
    return [];
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [smtpUser, setSmtpUser] = useState<string>(() => {
    return localStorage.getItem('documestre_smtp_user') || '';
  });

  const [smtpPass, setSmtpPass] = useState<string>(() => {
    return localStorage.getItem('documestre_smtp_pass') || '';
  });

  const [smtpProvider, setSmtpProvider] = useState<string>(() => {
    return localStorage.getItem('documestre_smtp_provider') || 'gmail';
  });

  const [saveSmtp, setSaveSmtp] = useState<boolean>(() => {
    const saved = localStorage.getItem('documestre_save_smtp');
    return saved !== null ? saved === 'true' : true;
  });

  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return localStorage.getItem('documestre_gemini_key') || '';
  });

  useEffect(() => {
    const apiGet = async (key: string) => {
      try {
        const res = await fetch(`/api/store?key=${key}`);
        const data = await res.json();
        return (data && data.value !== undefined && data.value !== null) ? data.value : null;
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

      let loadedSaveSmtp = true;
      const saveSmtpStr = await apiGet('documestre_save_smtp');
      if (saveSmtpStr !== null && saveSmtpStr !== undefined) {
        loadedSaveSmtp = saveSmtpStr === 'true';
        setSaveSmtp(loadedSaveSmtp);
      }

      if (loadedSaveSmtp) {
        const smtpU = await apiGet('documestre_smtp_user');
        if (smtpU !== null && smtpU !== undefined) setSmtpUser(smtpU);

        const smtpP = await apiGet('documestre_smtp_pass');
        if (smtpP !== null && smtpP !== undefined) setSmtpPass(smtpP);

        const smtpPr = await apiGet('documestre_smtp_provider');
        if (smtpPr !== null && smtpPr !== undefined) setSmtpProvider(smtpPr);
      } else {
        setSmtpUser('');
        setSmtpPass('');
      }

      const geminiK = await apiGet('documestre_gemini_key');
      if (geminiK) setGeminiKey(geminiK);

      setIsLoaded(true);
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
    if (!isLoaded) return;
    localStorage.setItem(DOCS_KEY, JSON.stringify(documents));
    apiSet(DOCS_KEY, JSON.stringify(documents));
  }, [documents, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('documestre_save_smtp', String(saveSmtp));
    apiSet('documestre_save_smtp', String(saveSmtp));
    if (!saveSmtp) {
      setSmtpUser('');
      setSmtpPass('');
      localStorage.removeItem('documestre_smtp_user');
      localStorage.removeItem('documestre_smtp_pass');
      apiSet('documestre_smtp_user', '');
      apiSet('documestre_smtp_pass', '');
    }
  }, [saveSmtp, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (saveSmtp) {
      localStorage.setItem('documestre_smtp_user', smtpUser);
      apiSet('documestre_smtp_user', smtpUser);
    }
  }, [smtpUser, isLoaded, saveSmtp]);

  useEffect(() => {
    if (!isLoaded) return;
    if (saveSmtp) {
      localStorage.setItem('documestre_smtp_pass', smtpPass);
      apiSet('documestre_smtp_pass', smtpPass);
    }
  }, [smtpPass, isLoaded, saveSmtp]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('documestre_smtp_provider', smtpProvider);
    apiSet('documestre_smtp_provider', smtpProvider);
  }, [smtpProvider, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('documestre_gemini_key', geminiKey);
    apiSet('documestre_gemini_key', geminiKey);
  }, [geminiKey, isLoaded]);

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
    smtpProvider,
    setSmtpProvider,
    saveSmtp,
    setSaveSmtp,
    geminiKey,
    setGeminiKey,
  };
}
