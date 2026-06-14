import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from './store';
import { 
  Code, FileText, History, Settings, Printer, Download, Save, Plus, 
  Trash2, Mail, TerminalSquare, Menu, X, LayoutDashboard, Sparkles, 
  ChevronRight, ArrowRight, CheckCircle2, AlertCircle, FileDown, 
  Clock, Send, ShieldCheck, Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, ExternalLink, Image, Camera, UploadCloud, Brush, Copy, Wand2, ListOrdered, DownloadCloud
} from 'lucide-react';
import { generateId, extractVariables, replaceVariables, cn } from './lib/utils';
import { Template, GeneratedDocument } from './types';
import { motion, AnimatePresence } from 'motion/react';

const copyRichText = async (htmlString: string) => {
  try {
    const formattedHtml = `
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          </style>
        </head>
        <body>
          ${htmlString}
        </body>
      </html>
    `;
    const blob = new Blob([formattedHtml], { type: 'text/html' });
    const textPlain = htmlString.replace(/<[^>]*>/g, '');
    const textBlob = new Blob([textPlain], { type: 'text/plain' });
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob
      })
    ]);
    return true;
  } catch (err) {
    console.error("Erro ao copiar Rich Text:", err);
    try {
      await navigator.clipboard.writeText(htmlString);
      return true;
    } catch (e) {
      return false;
    }
  }
};

const handleSendViaWebmail = async (provider: 'gmail' | 'yahoo', htmlContent: string) => {
  const success = await copyRichText(htmlContent);
  if (success) {
    alert("✨ E-mail Formatado Copiado com Sucesso!\n\n1. O design completo do e-mail foi copiado automaticamente para sua Área de Transferência.\n\n2. Agora vamos abrir seu Webmail em uma nova janela.\n\n3. Basta clicar na caixa onde se escreve a mensagem e dar 'Ctrl + V' (ou botão direito -> 'Colar').\n\nPronto! O seu e-mail manterá TODA a formatação original dele: fotos/imagens, botões de ação e cores!");
  } else {
    alert("Copiamos o código HTML do e-mail. Você pode colar diretamente no seu editor ou webmail.");
  }
  
  if (provider === 'gmail') {
    window.open('https://mail.google.com/mail/?view=cm&fs=1', '_blank');
  } else if (provider === 'yahoo') {
    window.open('https://compose.mail.yahoo.com/', '_blank');
  }
};

type Tab = 'dashboard' | 'generate' | 'templates'  | 'history' | 'settings' | 'creation';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const store = useAppStore();

  useEffect(() => {
    // any initialization if needed
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-gray-100 font-sans selection:bg-[#39FF14] selection:text-black">
      {/* Top Header Navigation */}
      <header className="bg-[#0a0a0a] border-b border-[#1a1a1a] min-h-[5rem] py-3 px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4 shadow-lg relative z-50">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#39FF14]/20 bg-[#111]">
            <img src="/imagem.ico" alt="Logo" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://img.icons8.com/neon/96/cyber-security.png'; }} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base md:text-lg tracking-tight leading-none text-[#39FF14] whitespace-nowrap">HACK DOCUMENT</span>
            <span className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest whitespace-nowrap">Enterprise Pro</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 md:gap-2 max-w-full overflow-x-auto no-scrollbar py-1">
          <NavItem 
            icon={<LayoutDashboard className="h-4 w-4 md:h-5 md:w-5" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); }} 
          />
          <NavItem 
            icon={<FileText className="h-4 w-4 md:h-5 md:w-5" />} 
            label="Gerador" 
            active={activeTab === 'generate'} 
            onClick={() => { setActiveTab('generate'); }} 
          />
          <NavItem 
            icon={<Code className="h-4 w-4 md:h-5 md:w-5" />} 
            label="Templates" 
            active={activeTab === 'templates'} 
            onClick={() => { setActiveTab('templates'); }} 
          />
          <NavItem 
            icon={<History className="h-4 w-4 md:h-5 md:w-5" />} 
            label="Histórico" 
            active={activeTab === 'history'} 
            onClick={() => { setActiveTab('history'); }} 
          />
          <NavItem 
            icon={<Settings className="h-4 w-4 md:h-5 md:w-5" />} 
            label="Configurar" 
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); }} 
          />
          <NavItem 
            icon={<Brush className="h-4 w-4 md:h-5 md:w-5" />} 
            label="Ferramentas de Criação" 
            active={activeTab === 'creation'} 
            onClick={() => { setActiveTab('creation'); }} 
          />
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <main className="flex-1 overflow-auto bg-[#050505] relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-10 min-h-full"
            >
              {activeTab === 'dashboard' && <DashboardView store={store} onAction={() => setActiveTab('generate')} />}
              {activeTab === 'generate' && <GenerateView store={store} />}
              {activeTab === 'templates' && <TemplatesView store={store} />}
              {activeTab === 'history' && <HistoryView store={store} />}
              {activeTab === 'settings' && <SettingsView store={store} />}
              {activeTab === 'creation' && <CreationView store={store} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="h-10 bg-[#0a0a0a] border-t border-[#1a1a1a] flex items-center justify-between px-4 px-10 text-[10px] font-mono text-gray-500 tracking-wider relative">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-[#39FF14]" /> SECURITY</span>
          <span className="opacity-50 hidden inline">DB: SQLITE</span>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-center w-full max-w-[200px] max-w-none pointer-events-auto">
          <a href="https://wa.me/5521993367328" target="_blank" rel="noopener noreferrer" className="text-[#39FF14] hover:underline decoration-skip-ink">WALLACE ARÃO</a> © {new Date().getFullYear()}
        </div>
        <div className="hidden block opacity-50 text-right">
          VERSÃO 1.0.0
        </div>
      </footer>
    </div>
  );
}

// --- Views Components ---

function DashboardView({ store, onAction }: { store: any, onAction: () => void }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Status do Ecossistema</h1>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Painel de Controle Enterprise</p>
      </div>

      <div className="grid grid-cols-1 grid-cols-3 gap-6 mb-12">
        <StatCard icon={<FileText className="text-[#39FF14]" />} label="Templates Salvos" value={store.templates.length} color="green" />
        <StatCard icon={<Printer className="text-blue-400" />} label="Docs Gerados" value={store.documents.length} color="blue" />
        <StatCard icon={<Send className="text-orange-400" />} label="E-mails Enviados" value={store.documents.length * 0.8 | 0} color="orange" />
      </div>

      <div className="grid grid-cols-1 grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-[#39FF14]" /> Atividade Recente</h3>
              <button onClick={onAction} className="text-xs text-[#39FF14] hover:underline">Ver tudo</button>
            </div>
            <div className="space-y-4">
              {store.documents.slice(0, 5).map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-[#050505] border border-[#1a1a1a] rounded-xl hover:border-[#39FF14]/30 transition-all group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center font-bold text-gray-500 group-hover:text-[#39FF14] transition-colors">
                       {doc.templateName.charAt(0)}
                     </div>
                     <div>
                       <p className="font-medium text-sm text-gray-200">{doc.templateName}</p>
                       <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">{new Date(doc.createdAt).toLocaleString()}</p>
                     </div>
                   </div>
                   <div className="text-[10px] bg-[#1a1a1a] px-2 py-1 rounded border border-[#222222] font-semibold text-gray-400">
                     {doc.type}
                   </div>
                </div>
              ))}
              {store.documents.length === 0 && (
                <div className="py-12 text-center text-gray-500 font-mono text-sm italic">
                  Nenhuma atividade encontrada no banco de dados.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-4">Informações do Sistema</h3>
            <ul className="space-y-3">
              <li className="flex justify-between text-xs">
                <span className="text-gray-500">Versão:</span>
                <span className="text-white font-mono">v4.0.0-OFFLINE</span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-gray-500">Storage:</span>
                <span className="text-white font-mono">Persistent JSON</span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-gray-500">Modo:</span>
                <span className="text-[#39FF14] font-bold">OFFLINE SERVER</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenerateView({ store }: { store: any }) {
  const [selectedId, setSelectedId] = useState(store.templates[0]?.id || '');
  const [vars, setVars] = useState<Record<string, string>>({});
  const [finalContent, setFinalContent] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatures, setSignatures] = useState([{ name: '', role: '' }]);
  const [unsavedTemplate, setUnsavedTemplate] = useState<Template | null>(null);
  const template = (unsavedTemplate && unsavedTemplate.id === selectedId) 
    ? unsavedTemplate 
    : store.templates.find((t: any) => t.id === selectedId);
  const detected = template ? extractVariables(template.content) : [];
  
  const [localFormat, setLocalFormat] = useState<'html' | 'text'>('html');

  useEffect(() => {
    if (template) {
      setLocalFormat(template.format);
    }
  }, [template?.id]);

  const [leftTab, setLeftTab] = useState<'fill' | 'ai'>('fill');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeActions, setActiveActions] = useState<Record<string, boolean>>({});

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');

  const handleBatchGenerate = async () => {
    if (!batchText.trim()) return alert("Cole os dados primeiro.");
    if (detected.length === 0) return alert("Seu modelo atual não possui nenhuma variável {{variavel}} para preencher.");
    setActiveActions(prev => ({ ...prev, 'isBatching': true }));
    try {
      const response = await fetch('/api/ai/batch-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: batchText, variables: detected })
      });
      const data = await response.json();
      if (data.success && data.records && data.records.length > 0) {
        let count = 0;
        for (const record of data.records) {
          // preenche o template
          let filledContent = template.content;
          for (const variable of detected) {
            const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
            filledContent = filledContent.replace(regex, record[variable] || '');
          }

          // Tenta pegar alguma variavel principal para nomear o documento, ex: NOME
          const nameVar = record['nome'] || record['Nome'] || record['NOME'] || record[detected[0]];
          const documentName = nameVar ? `${template.name} - ${nameVar}` : `${template.name} - Automação ${count+1}`;

          const doc: any = {
            id: generateId(),
            templateId: template.id,
            templateName: documentName,
            type: template.type,
            format: localFormat,
            variables: record, // O que ele preencheu 
            finalContent: filledContent,
            createdAt: new Date().toISOString()
          };
          store.saveDocument(doc);
          count++;
        }
        alert(`Sucesso! Foram gerados e salvos ${count} documentos na aba Histórico.`);
        setShowBatchModal(false);
        setBatchText('');
      } else {
        alert("Erro: IA não conseguiu identificar registros no texto fornecido.");
      }
    } catch (err) {
      alert("Erro ao processar lote: " + err);
    } finally {
      setActiveActions(prev => ({ ...prev, 'isBatching': false }));
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("O arquivo é muito grande. O limite é de 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const mimeType = file.type;

      setActiveActions(prev => ({ ...prev, 'isReproducing': true }));
      try {
        const response = await fetch('/api/ai/reproduce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data, mimeType })
        });
        const data = await response.json();
        if (data.success && data.content) {
          const newId = 'ai-reproduced-' + Math.random().toString(36).substring(2, 9);
          const newTmpl = {
            id: newId,
            name: data.name || 'Documento Reproduzido',
            type: 'documento',
            format: 'html',
            content: data.content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUnsavedTemplate(newTmpl);
          setSelectedId(newId);
          setVars({});
          setLeftTab('fill');
          alert(`Documento reproduzido com sucesso!`);
        } else {
          alert("Erro ao reproduzir: " + (data.error || "Erro desconhecido"));
        }
      } catch (err: any) {
        alert("Erro na conexão: " + err.message);
      } finally {
        setActiveActions(prev => ({ ...prev, 'isReproducing': false }));
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };

  const handleAiRequest = async (endpoint: string, actionKey: string) => {
    const currentHTML = document.getElementById('editable-document-body')?.innerHTML || finalContent;
    if (!currentHTML || currentHTML.trim() === '') {
      alert("Por favor, digite ou selecione algum documento primeiro.");
      return;
    }
    setActiveActions(prev => ({ ...prev, [actionKey]: true }));
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentHTML })
      });
      const data = await response.json();
      if (data.success && data.result) {
        setFinalContent(data.result);
        const editor = document.getElementById('editable-document-body');
        if (editor) {
          editor.innerHTML = data.result;
        }
        if (template) {
          store.updateTemplate(template.id, { content: data.result });
        }
        alert("Operação concluída com sucesso!");
      } else {
        alert("Erro na operação: " + (data.error || "Erro desconhecido"));
      }
    } catch (e: any) {
      alert("Erro ao conectar com a IA: " + e.message);
    } finally {
      setActiveActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert("Por favor, digite o que você quer que o assistente crie (ex: 'Contrato de Parceria Comercial').");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await response.json();
      if (data.success) {
        const newId = 'ai-' + Math.random().toString(36).substring(2, 9);
        const newTmpl = {
          id: newId,
          name: data.name || 'Gerado por IA',
          type: 'documento',
          format: 'html',
          content: data.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUnsavedTemplate(newTmpl);
        setSelectedId(newId);
        setVars({});
        setAiPrompt('');
        alert(`Modelo "${data.name}" criado com IA e selecionado com sucesso! Preencha as variáveis ao lado.`);
        setLeftTab('fill');
      } else {
        alert("Erro ao gerar: " + (data.error || "Erro desconhecido"));
      }
    } catch (e: any) {
      alert("Erro ao conectar com o gerador de IA: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (template) {
      setFinalContent(replaceVariables(template.content, vars));
    }
  }, [template, vars]);

  const handleSaveToHistory = () => {
    if (!template) return;
    
    const docName = prompt("Qual título/nome deseja dar a este documento gerado?", template.name);
    if (!docName) return; // cancelou ou deixou vazio
    
    const currentContent = document.getElementById('editable-document-body')?.innerHTML || finalContent;

    const doc: GeneratedDocument = {
      id: generateId(),
      templateId: template.id,
      templateName: docName,
      type: template.type,
      format: localFormat,
      variables: vars,
      finalContent: currentContent,
      createdAt: new Date().toISOString()
    };
    store.saveDocument(doc);
    alert("Salvo no histórico com sucesso!");
  };

  const insertDraggableImageBlock = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const blockId = 'img-block-' + Math.random().toString(36).substring(2, 9);
    let style = "width: 140px; height: 175px; border: 2px dashed #39FF14; background-color: #fcfcfc; border-radius: 8px; position: absolute; top: 20px; right: 20px; overflow: hidden; cursor: grab; text-align: center; font-family: sans-serif; resize: both; z-index: 50;";

    const htmlString = `<div id="${blockId}" class="photo-upload-container absolute-draggable" style="${style}" contenteditable="false" ` +
      `onclick="if(!this.dataset.justDragged && !this.dataset.loaded) { const input = this.querySelector('input'); if(input) { input.value = ''; input.click(); } }" ` +
      `onmousedown="` +
        `const rect = this.getBoundingClientRect(); ` +
        `if (event.clientX > rect.right - 25 && event.clientY > rect.bottom - 25) return; ` +
        `if (event.target.tagName.toLowerCase() === 'input') return; ` +
        `const el = this; ` +
        `const startX = event.clientX; ` +
        `const startY = event.clientY; ` +
        `const initX = parseInt(el.style.left || el.offsetLeft || 0); ` +
        `const initY = parseInt(el.style.top || el.offsetTop || 0); ` +
        `el.style.cursor = 'grabbing'; ` +
        `let dragged = false; ` +
        `const mouseMoveHandler = function(e){ ` +
          `if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) dragged = true; ` +
          `el.style.left = (initX + e.clientX - startX) + 'px'; ` +
          `el.style.top = (initY + e.clientY - startY) + 'px'; ` +
        `}; ` +
        `const mouseUpHandler = function(e){ ` +
          `document.removeEventListener('mousemove', mouseMoveHandler); ` +
          `document.removeEventListener('mouseup', mouseUpHandler); ` +
          `el.style.cursor = 'grab'; ` +
          `if(dragged) { setTimeout(() => { el.dataset.justDragged = 'true'; }, 0); setTimeout(() => { el.dataset.justDragged = ''; }, 100); }` +
        `}; ` +
        `document.addEventListener('mousemove', mouseMoveHandler); ` +
        `document.addEventListener('mouseup', mouseUpHandler);` +
      `">` +
      `<input type="file" accept="image/*, .png, .jpg, .jpeg, .webp, .svg, .gif, .bmp" style="position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none;" onchange="` +
        `const file = this.files[0];` +
        `if (file) {` +
          `const reader = new FileReader();` +
          `reader.onload = (e) => {` +
            `const parent = document.getElementById('${blockId}');` +
            `if (!parent) return;` +
            `parent.style.border = '2px solid transparent';` +
            `parent.style.backgroundColor = 'transparent';` +
            `parent.dataset.loaded = 'true';` +
            `const img = parent.querySelector('.photo-preview-img');` +
            `if (img) { img.src = e.target.result; img.style.display = 'block'; }` +
            `const plc = parent.querySelector('.photo-upload-placeholder');` +
            `if (plc) plc.style.display = 'none';` +
            `const editor = document.getElementById('editable-document-body');` +
            `if (editor) editor.focus();` +
          `};` +
          `reader.readAsDataURL(file);` +
        `}` +
      `" />` +
      `<img class="photo-preview-img" style="width: 100%; height: 100%; object-fit: cover; display: none; object-position: center;" />` +
      `<div class="photo-upload-placeholder" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 10px; color: #444; user-select: none; pointer-events: none;">` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#39FF14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 6px;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>` +
      `<span style="font-size: 11px; font-weight: bold; line-height: 1.2; color: #111; pointer-events: none;">Anexo / Foto</span>` +
      `<span style="font-size: 8px; color: #666; margin-top: 4px; pointer-events: none;">Clique / Arraste</span>` +
      `</div>` +
      `</div>&nbsp;`;

    const editor = document.getElementById('editable-document-body');
    if (editor) {
      editor.focus();
    }
    
    document.execCommand('insertHTML', false, htmlString);
    
    if (editor && !editor.contains(window.getSelection()?.anchorNode)) {
      setFinalContent(prev => prev + htmlString);
    } else {
      setTimeout(() => {
        if (editor) {
          setFinalContent(editor.innerHTML);
        }
      }, 10);
    }
  };

  return (
    <div className="flex flex-col flex-1 gap-8 w-full max-w-full">
      {/* Header Controls */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden group flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Selecionar Modelo Base</label>
            <select 
              className="bg-[#050505] border border-[#222222] rounded-lg text-sm p-3 w-full w-72 focus:border-[#39FF14] transition-all outline-none"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setVars({});
              }}
            >
              {store.templates.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
              {unsavedTemplate && (
                <option key={unsavedTemplate.id} value={unsavedTemplate.id}>
                  {unsavedTemplate.name} (Não Salvo)
                </option>
              )}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Formato (Editor e IA)</label>
            <select 
              className="bg-[#050505] border border-[#222222] rounded-lg text-sm p-3 w-40 focus:border-[#39FF14] transition-all outline-none text-white"
              value={localFormat}
              onChange={(e) => setLocalFormat(e.target.value as any)}
            >
              <option value="text">Texto Puro</option>
              <option value="html">HTML Dynamic</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => {
               const editedContent = document.getElementById('editable-document-body')?.innerHTML || finalContent;
               const name = prompt("Digite o nome para o novo template (Modelo):", template ? `${template.name} - Editado` : "Novo Modelo");
               if (name) {
                  const newTmpl = {
                    id: generateId(),
                    name: name,
                    type: template?.type || 'documento',
                    format: localFormat,
                    content: editedContent || 'Escreva seu modelo aqui...',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  store.addTemplate(newTmpl);
                  setUnsavedTemplate(null);
                  setSelectedId(newTmpl.id);
                  alert("🎉 Modelo Salvo com Sucesso! \nEle já está selecionado e disponível na aba Meus Modelos.");
               }
             }}
             className="px-5 py-3 bg-[#39FF14] text-black font-bold rounded-xl hover:bg-[#7FFF00] transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#39FF14]/20"
           >
             <Save className="h-4 w-4" /> Salvar como Modelo
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 flex-1 gap-8 min-h-0">
        {/* Variables Editor */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 flex flex-col relative h-full overflow-y-auto">
          {/* Segmented Tab Selector */}
          <div className="flex bg-[#050505] p-1 rounded-xl border border-[#1a1a1a] mb-6 flex-shrink-0">
            <button
              onClick={() => setLeftTab('fill')}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2",
                leftTab === 'fill' 
                  ? "bg-[#39FF14] text-black shadow-lg" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Send className="h-4 w-4" /> Preenchimento Manual
            </button>
            <button
              onClick={() => setLeftTab('ai')}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2",
                leftTab === 'ai' 
                  ? "bg-[#39FF14] text-black shadow-lg" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Sparkles className="h-4 w-4" /> Assistente de IA
            </button>
          </div>

          {leftTab === 'fill' ? (
            <>
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Send className="h-4 w-4 text-[#39FF14]" /> Campos de Variáveis
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono italic">Vars Detectadas:</span>
                  <span className="px-2 py-0.5 bg-[#1a1a1a] rounded text-[10px] font-bold text-[#39FF14]">{detected.length}</span>
                </div>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                {detected.map((v: string) => (
                  <div key={v} className="relative">
                    <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 px-1">
                      {v.replace(/_/g, ' ')}
                    </label>
                    {v.toLowerCase().includes('desc') || v.toLowerCase().includes('text') ? (
                       <textarea
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-4 text-sm focus:border-[#39FF14] transition-all outline-none min-h-[100px]"
                        placeholder={`Entre com ${v}...`}
                        value={vars[v] || ''}
                        onChange={(e) => setVars(prev => ({ ...prev, [v]: e.target.value }))}
                      />
                    ) : (
                      <input
                        type="text"
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-4 text-sm focus:border-[#39FF14] transition-all outline-none"
                        placeholder={`Entre com ${v}...`}
                        value={vars[v] || ''}
                        onChange={(e) => setVars(prev => ({ ...prev, [v]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
                {detected.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 italic">
                    Nenhuma variável detectada no template selecionado.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Action 1: Spellcheck */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
                  <Sparkles className="h-4 w-4" /> 1. Correção Ortográfica
                </div>
                <p className="text-xs text-gray-400">
                  Faz uma correção ortográfica e gramatical avançada em todo o documento atual.
                </p>
                <button
                  onClick={() => handleAiRequest('/api/ai/spellcheck', 'isSpellchecking')}
                  disabled={activeActions['isSpellchecking']}
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-450 text-black font-bold rounded-lg disabled:bg-gray-800 disabled:text-gray-400 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {activeActions['isSpellchecking'] ? (
                    <><Clock className="animate-spin h-3.5 w-3.5" /> Corrigindo...</>
                  ) : (
                    <><Sparkles className="h-3.5 w-3.5" /> Aplicar Correção Ortográfica</>
                  )}
                </button>
              </div>

              {/* Action 2: Spacing Correct */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-teal-400">
                  <AlignLeft className="h-4 w-4" /> 2. Corrigir Espaçamentos
                </div>
                <p className="text-xs text-gray-400">
                  Arruma quebras de linha e estrutura visual de espaçamentos para um formato mais elegante e organizado.
                </p>
                <button
                  onClick={() => handleAiRequest('/api/ai/spacing', 'isSpacing')}
                  disabled={activeActions['isSpacing']}
                  className="w-full py-2.5 bg-teal-500 hover:bg-teal-450 text-black font-bold rounded-lg disabled:bg-gray-800 disabled:text-gray-400 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {activeActions['isSpacing'] ? (
                    <><Clock className="animate-spin h-3.5 w-3.5" /> Organizando...</>
                  ) : (
                    <><AlignLeft className="h-3.5 w-3.5" /> Corrigir Espaçamentos</>
                  )}
                </button>
              </div>

              {/* Action 3: Auto-Templatize */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-orange-400">
                  <Code className="h-4 w-4" /> 3. Transformar em Vars Dínâmicas
                </div>
                <p className="text-xs text-gray-400">
                  A IA lerá os dados atuais do documento (como nomes, valores e datas) e os substituirá por marcações dinâmicas (ex.: {'{{nome}}'}).
                </p>
                <button
                  onClick={() => handleAiRequest('/api/ai/templatize', 'isTemplatizing')}
                  disabled={activeActions['isTemplatizing']}
                  className="w-full py-2.5 bg-orange-400 hover:bg-orange-350 text-black font-bold rounded-lg disabled:bg-gray-800 disabled:text-gray-400 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {activeActions['isTemplatizing'] ? (
                    <><Clock className="animate-spin h-3.5 w-3.5" /> Extraindo...</>
                  ) : (
                    <><Code className="h-3.5 w-3.5" /> Criar Variáveis {'{{ ... }}'}</>
                  )}
                </button>
              </div>

              {/* Action 4: Create HTML Document from prompt */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#39FF14]">
                  <Sparkles className="h-4 w-4" /> 4. Gerador de Email/Documento HTML
                </div>
                <p className="text-xs text-gray-400">
                  Crie um template decorado HTML usando instruções (ex: "Criar email estiloso para festa da igreja").
                </p>
                <textarea
                  placeholder="Exemplo: Crie email verde claro para festa na Igreja com as variáveis..."
                  className="w-full bg-black border border-[#1a1a1a] rounded-lg p-3 text-xs text-white focus:border-[#39FF14] outline-none min-h-[85px] resize-none"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                <button
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full py-2.5 bg-[#39FF14] text-black font-bold rounded-lg hover:bg-[#7FFF00] disabled:bg-gray-800 disabled:text-gray-400 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="animate-spin h-3.5 w-3.5" /> Gerando Documento HTML...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Criar Documento
                    </>
                  )}
                </button>
              </div>

              {/* Action 5: Reproduce from File */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <input type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <div className="flex items-center gap-2 text-sm font-bold text-fuchsia-400">
                  <UploadCloud className="h-4 w-4" /> 5. Reproduzir de Arquivo (Imagem/PDF)
                </div>
                <p className="text-xs text-gray-400">
                  Envie uma foto, JPG, PNG ou PDF do documento. A IA transcreverá as informações e retornará o documento fiel já como HTML editável e dinâmico.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={activeActions['isReproducing']}
                  className="w-full py-2.5 bg-fuchsia-500 hover:bg-fuchsia-450 text-black font-bold rounded-lg disabled:bg-gray-800 disabled:text-gray-400 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {activeActions['isReproducing'] ? (
                    <><Clock className="animate-spin h-3.5 w-3.5" /> Lendo Arquivo...</>
                  ) : (
                    <><UploadCloud className="h-3.5 w-3.5" /> Fazer Upload (Foto/PDF)</>
                  )}
                </button>
              </div>

              {/* Action 6: Batch Generation */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-yellow-400">
                  <ListOrdered className="h-4 w-4" /> 6. Preenchimento Automático
                </div>
                <p className="text-xs text-gray-400">
                  Preencha automaticamente múltiplas cópias deste modelo enviando uma lista de dados (Copie e cole do Excel ou CSV).
                </p>
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg disabled:bg-gray-800 disabled:text-gray-400 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)]"
                >
                  <ListOrdered className="h-3.5 w-3.5" /> Enviar Planilha de Lote
                </button>
              </div>
            </div>
          )}

          {/* AI Tools Bar e Acoes */}
          <div className="mt-8 pt-8 border-t border-[#1a1a1a]">
             <h3 className="text-xs font-mono text-gray-500 uppercase mb-3 flex items-center gap-2">
               <Printer className="h-3 w-3 text-[#39FF14]" /> Exportação e Ações
             </h3>
             <div className="flex flex-wrap items-center gap-2">
               <button 
                 onClick={() => setShowSignatureModal(true)}
                 className="flex-1 min-w-[120px] px-3 py-2 bg-[#1a1a1a] border border-[#222222] text-white font-bold rounded-xl hover:bg-[#222222] transition flex items-center justify-center gap-2 text-xs"
               >
                  <Plus className="h-3 w-3" /> Assinaturas
               </button>
               

               <button 
                 onClick={() => {
                   const currentContent = document.getElementById('editable-document-body')?.innerHTML || finalContent;
                   handleSendViaWebmail('gmail', currentContent);
                 }}
                 className="flex-1 min-w-[120px] px-3 py-2 bg-[#1a1a1a] border border-[#222222] hover:border-red-500/40 text-white font-bold rounded-xl hover:bg-[#222222] transition flex items-center justify-center gap-2 text-xs"
                 title="Copia o design formatado do e-mail e abre o Gmail para colar"
               >
                  <Mail className="h-3 w-3 text-red-500" /> Enviar c/ Gmail
               </button>

               <button 
                 onClick={() => {
                   const currentContent = document.getElementById('editable-document-body')?.innerHTML || finalContent;
                   handleSendViaWebmail('yahoo', currentContent);
                 }}
                 className="flex-1 min-w-[120px] px-3 py-2 bg-[#1a1a1a] border border-[#222222] hover:border-purple-500/40 text-white font-bold rounded-xl hover:bg-[#222222] transition flex items-center justify-center gap-2 text-xs"
                 title="Copia o design formatado do e-mail e abre o Yahoo Mail para colar"
               >
                  <Mail className="h-3 w-3 text-purple-400" /> Enviar c/ Yahoo
               </button>
     
                <button 
                  onClick={() => {
                    const iframe = document.createElement('iframe');
                    iframe.style.position = 'fixed';
                    iframe.style.right = '0';
                    iframe.style.bottom = '0';
                    iframe.style.width = '0';
                    iframe.style.height = '0';
                    iframe.style.border = '0';
                    document.body.appendChild(iframe);
                    
                    const doc = iframe.contentWindow?.document;
                    if (doc) {
                      const printContent = document.getElementById('editable-document-body')?.innerHTML || finalContent;
                      const isHtml = localFormat === 'html';
                      
                      doc.write(`
                        <html>
                          <head>
                            <title>${template?.name || 'Documento'}</title>
                            <style>
                              @page { margin: 15mm; }
                              body { 
                                background: white !important; 
                                color: black !important; 
                                -webkit-print-color-adjust: exact; 
                                print-color-adjust: exact; 
                              }
                            </style>
                          </head>
                          <body class="bg-white text-black">
                            <div class="${isHtml ? "max-w-none" : "font-serif text-sm leading-8 whitespace-pre-wrap antialiased"}">
                              ${printContent}
                            </div>
                          </body>
                        </html>
                      `);
                      
                      // Copia todos os estilos do projeto para dentro do iframe para printar igualzinho
                      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
                      styles.forEach(style => {
                        doc.head.appendChild(style.cloneNode(true));
                      });
                      
                      doc.close();
                      
                      setTimeout(() => {
                        iframe.contentWindow?.focus();
                        iframe.contentWindow?.print();
                        setTimeout(() => document.body.removeChild(iframe), 1000);
                      }, 500);
                    }
                  }}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-[#1a1a1a] border border-[#222222] text-white font-bold rounded-xl hover:bg-[#222222] transition flex items-center justify-center gap-2 text-xs"
                >
                  <Printer className="h-3 w-3 text-green-400" /> Imprimir Documento
                </button>
     
               <button 
                 onClick={handleSaveToHistory}
                 className="flex-1 min-w-[120px] px-3 py-2 bg-[#39FF14] text-black font-bold rounded-xl hover:bg-[#7FFF00] transition flex items-center justify-center gap-2 text-xs"
               >
                 <Save className="h-3 w-3" /> Salvar Histórico
               </button>
             </div>
          </div>
        </div>

        {/* Live Preview Console */}
        <div className="bg-white rounded-2xl flex flex-col h-full min-h-0 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-gray-200 group relative">
          <div className="h-14 bg-[#0a0a0a] border-b border-[#1a1a1a] px-6 flex items-center justify-between flex-shrink-0">
             <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
             </div>
             <div className="flex gap-1 bg-[#1a1a1a] py-1 px-2 rounded-lg border border-[#333] items-center">
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('bold')} className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors" title="Negrito"><Bold className="w-4 h-4" /></button>
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('italic')} className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors" title="Itálico"><Italic className="w-4 h-4" /></button>
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('underline')} className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors" title="Sublinhado"><Underline className="w-4 h-4" /></button>
               <div className="w-px h-4 bg-[#333] self-center mx-1"></div>
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyLeft')} className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors" title="Alinhar à Esquerda"><AlignLeft className="w-4 h-4" /></button>
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyCenter')} className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors" title="Centralizar"><AlignCenter className="w-4 h-4" /></button>
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyRight')} className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors" title="Alinhar à Direita"><AlignRight className="w-4 h-4" /></button>
               
               <div className="w-px h-4 bg-[#333] self-center mx-1"></div>
               <button 
                 onMouseDown={insertDraggableImageBlock} 
                 className="px-2 py-1 bg-[#222]/50 hover:bg-[#222] hover:border-[#39FF14]/40 border border-[#222] rounded text-gray-400 hover:text-[#39FF14] transition-all flex items-center gap-1" 
                 title="Inserir Imagem Ajustável (Foto/Logo)"
               >
                 <Image className="w-3.5 h-3.5 text-[#39FF14]" />
                 <span className="text-[10px] font-bold hidden sm:inline">Imagem Ajustável</span>
               </button>
             </div>
             <div className="text-[10px] font-mono text-gray-500 flex items-center gap-2">
                <Printer className="h-3 w-3" /> PRINT_PREVIEW_A4
             </div>
          </div>

          <div id="pdf-container" className="flex-1 overflow-y-auto p-12 bg-white text-black min-h-0 select-text selection:bg-[#39FF14] selection:text-black">
             <div 
               id="editable-document-body"
               className={cn("outline-none transition-all min-h-full relative text-black bg-white", localFormat === 'html' ? "" : "font-serif text-sm leading-8 whitespace-pre-wrap antialiased")}
               contentEditable 
               suppressContentEditableWarning
               onBlur={(e) => setFinalContent(e.currentTarget.innerHTML)}
               dangerouslySetInnerHTML={{ __html: finalContent }}
             />
          </div>

          {/* Floating UI Hints */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
             <div className="bg-[#0a0a0a]/90 backdrop-blur border border-[#39FF14]/30 px-4 py-2 rounded-full text-[10px] text-white font-mono flex items-center gap-2 shadow-2xl">
               <CheckCircle2 className="h-3 w-3 text-[#39FF14]" /> DOCUMENTO EM CONFORMIDADE COM TEMPLATE
             </div>
          </div>
        </div>
      </div>

      {showBatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">Preenchimento Automático em Lote</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Cole abaixo uma lista de dados (Copie do Excel, CSV ou envie um texto simples).
              A IA tentará identificar os dados e gerar múltiplas cópias do modelo atual ({template?.name}), uma para cada linha/registro.
            </p>
            <div className="mb-4">
              <label className="text-[10px] font-bold text-[#39FF14] mb-2 block uppercase tracking-wide">
                Campos detectados no modelo atual para preencher:
              </label>
              <div className="flex flex-wrap gap-2">
                {detected.map(vr => (
                  <span key={vr} className="px-2 py-1 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 rounded text-xs font-mono">
                    {vr}
                  </span>
                ))}
              </div>
            </div>
            <textarea
              className="w-full h-40 bg-[#0a0a0a] border border-[#222] rounded-xl text-xs font-mono text-gray-300 p-3 focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] outline-none resize-none mb-4"
              placeholder={`Exemplo de conteúdo:\nJoão Silva, 111.222.333-44, 10/10/2023\nMaria Souza, 555.666.777-88, 11/10/2023\nOU copie e cole direto de uma planilha...`}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 border border-[#333] hover:bg-[#111] text-gray-400 rounded-lg text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleBatchGenerate}
                disabled={activeActions['isBatching'] || !batchText.trim()}
                className="px-4 py-2 bg-[#39FF14] text-black rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#32e612] disabled:opacity-50 transition-colors"
                title="A IA usará seus dados para gerar novos documentos baseados no modelo atual e os salvará automaticamente."
              >
                {activeActions['isBatching'] ? (
                  <><Clock className="animate-spin h-4 w-4" /> Gerando Documentos...</>
                ) : (
                  <><Wand2 className="h-4 w-4" /> Gerar Lote Agora</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-2xl w-full max-w-md p-6">
            <h3 className="text-white font-bold text-lg mb-4">Adicionar Assinaturas</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
               {signatures.map((sig, i) => (
                  <div key={i} className="p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] space-y-3 relative group">
                     <div className="flex justify-between items-center mb-1">
                       <label className="text-xs font-bold text-gray-400 uppercase">Assinatura {i + 1}</label>
                       {signatures.length > 1 && (
                         <button onClick={() => setSignatures(s => s.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-500 transition-colors">
                           <Trash2 className="h-4 w-4" />
                         </button>
                       )}
                     </div>
                     <input 
                       placeholder="Nome (Ex: Assinatura Editável)" 
                       value={sig.name} 
                       onChange={e => { const s = [...signatures]; s[i].name = e.target.value; setSignatures(s); }} 
                       className="w-full bg-black border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none" 
                     />
                     <input 
                       placeholder="Cargo / Documento (Ex: Nome/Cargo)" 
                       value={sig.role} 
                       onChange={e => { const s = [...signatures]; s[i].role = e.target.value; setSignatures(s); }} 
                       className="w-full bg-black border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none" 
                     />
                  </div>
               ))}
            </div>
            <button 
              onClick={() => setSignatures(s => [...s, {name:'', role:''}])} 
              className="w-full py-3 mt-4 border border-dashed border-[#1a1a1a] rounded-xl text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-colors text-sm font-bold flex items-center justify-center gap-2"
            >
               <Plus className="h-4 w-4" /> Adicionar Mais Uma
            </button>

            <div className="flex gap-3 mt-6">
               <button 
                 onClick={() => setShowSignatureModal(false)} 
                 className="flex-1 py-3 bg-[#1a1a1a] rounded-xl text-white text-sm font-bold hover:bg-[#222] transition-colors"
               >
                 Cancelar
               </button>
                <button 
                  onClick={() => {
                    let sigsText = "";
                    if (template?.format === 'html') {
                       const numSigs = signatures.length;
                       const sigNodes = signatures.map(sig => `
                         <div style="flex: 1; min-width: 250px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; margin-bottom: 20px;">
                            <div style="width: 100%; max-width: 300px; border-bottom: 1px solid #000; margin-bottom: 8px;"></div>
                            <div style="font-family: sans-serif; font-size: 14px; font-weight: bold; text-align: center; width: 100%; margin: 0;">${sig.name || 'Assinatura'}</div>
                            ${sig.role ? `<div style="font-family: sans-serif; font-size: 12px; color: #555; text-align: center; width: 100%; margin: 4px 0 0 0;">${sig.role}</div>` : ''}
                         </div>
                       `).join('');
                       sigsText = `\n<div style="margin-top: 60px; display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; width: 100%;">${sigNodes}</div>\n<p><br></p>\n`;
                    } else {
                       const centerText = (text: string, width: number) => {
                          if (text.length >= width) return text;
                          const pad = Math.floor((width - text.length) / 2);
                          return ' '.repeat(pad) + text;
                       };
                       const sigNodes = signatures.map(sig => {
                         const line = "_____________________________________________";
                         const name = centerText(sig.name || 'Assinatura', line.length);
                         const role = sig.role ? '\n' + centerText(sig.role, line.length) : '';
                         return `\n\n\n${line}\n${name}${role}`;
                       }).join('');
                       sigsText = `\n\n${sigNodes}\n`;
                    }
                    setFinalContent(prev => prev + sigsText);
                    setShowSignatureModal(false);
                    setSignatures([{name:'', role:''}]);
                  }} 
                  className="flex-1 py-3 bg-[#39FF14] text-black rounded-xl text-sm font-bold hover:bg-[#7FFF00] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Inserir
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplatesView({ store }: { store: any }) {
  const [editing, setEditing] = useState<Template | null>(null);

  const handleNew = () => {
    setEditing({
      id: generateId(),
      name: 'Novo Documento',
      type: 'documento',
      format: 'html',
      content: '<div style="font-family: sans-serif; padding: 40px;">\n  <h1>Título</h1>\n  <p>Conteúdo com {{variavel}}</p>\n</div>',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
  };

  return (
    <div className="flex flex-row h-full gap-8">
      <div className={cn(
        "w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col shrink-0",
        
      )}>
        <div className="p-6 border-b border-[#1a1a1a]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#718096] mb-4">Gerenciar Projetos</h2>
          <button 
            onClick={handleNew}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 rounded-xl hover:bg-[#39FF14]/20 transition-all font-bold text-xs uppercase"
          >
            <Plus className="h-3 w-3" /> Novo Template
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 ">
          {store.templates.map((t: any) => (
            <div 
              key={t.id} 
              onClick={() => { setEditing({...t});  }}
              className={cn(
                "p-4 rounded-xl cursor-pointer transition-all border group",
                editing?.id === t.id ? "bg-[#1a1a1a] border-[#39FF14]/30 shadow-lg shadow-[#39FF14]/5" : "bg-[#050505] border-[#1a1a1a] hover:border-[#222222]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-200 truncate pr-2">{t.name}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); store.deleteTemplate(t.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-tight">{t.type} • {t.format}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col p-8 overflow-y-auto min-h-[500px]">
        {editing ? (
          <div className="flex flex-col h-full">
            <div className="flex flex-row items-center justify-between mb-8 gap-4">
               <h2 className="text-xl font-bold">Configurando Modelo</h2>
               <div className="flex items-center gap-3">
                 <button 
                  onClick={() => {
                    store.templates.some((t: any) => t.id === editing.id) ? store.updateTemplate(editing.id, editing) : store.addTemplate(editing);
                    setEditing(null);
                  }}
                  className="flex-1 flex-none px-6 py-2.5 bg-[#39FF14] text-black font-bold rounded-xl hover:bg-[#7FFF00] transition-colors text-sm"
                 >
                   Salvar
                 </button>
                 <button onClick={() => setEditing(null)} className="flex-1 flex-none px-6 py-2.5 bg-[#1a1a1a] rounded-xl text-gray-400 text-sm hover:text-white border border-[#222222]">Voltar</button>
               </div>
            </div>

            <div className="grid grid-cols-1 grid-cols-3 gap-4 gap-6 mb-8">
              <div className="col-span-1">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Nome</label>
                <input 
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm focus:border-[#39FF14] outline-none"
                  value={editing.name}
                  onChange={e => setEditing({...editing, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Tipo</label>
                <select 
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm focus:border-[#39FF14] outline-none"
                  value={editing.type}
                  onChange={e => setEditing({...editing, type: e.target.value as any})}
                >
                  <option value="documento">Relatório Profissional</option>
                  <option value="contrato">Contrato Legal</option>
                  <option value="nota">Nota de Auditoria</option>
                  <option value="recibo">Certificado</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Motor</label>
                <select 
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm focus:border-[#39FF14] outline-none"
                  value={editing.format}
                  onChange={e => setEditing({...editing, format: e.target.value as any})}
                >
                  <option value="text">Texto Puro</option>
                  <option value="html">HTML Dynamic</option>
                </select>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
               <div className="flex flex-col h-auto overflow-hidden">
                 <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block flex-shrink-0">Editor</label>
                 <textarea 
                  className="flex-1 w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl p-6 font-mono text-[13px] text-gray-300 focus:border-[#39FF14] outline-none resize-none leading-relaxed shadow-inner"
                  value={editing.content}
                  onChange={e => setEditing({...editing, content: e.target.value})}
                 />
               </div>
               <div className="flex flex-col h-auto overflow-hidden">
                 <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block flex-shrink-0">Preview</label>
                 <div className="flex-1 w-full bg-white rounded-2xl p-8 overflow-y-auto border border-gray-200">
                    {editing.format === 'html' ? (
                       <div dangerouslySetInnerHTML={{ __html: editing.content }} className="max-w-none text-black" />
                    ) : (
                      <pre className="text-black font-serif text-sm leading-7 whitespace-pre-wrap">{editing.content}</pre>
                    )}
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-4 py-20">
             <Code className="h-16 w-16 opacity-10" />
             <p className="font-mono text-sm tracking-widest uppercase">Console de Desenvolvimento</p>
             <button onClick={handleNew} className="text-[#39FF14] hover:underline text-xs">Começar novo projeto</button>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryView({ store }: { store: any }) {
  const [selected, setSelected] = useState<GeneratedDocument | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportAllZip = async () => {
    if (store.documents.length === 0) return alert("Nenhum documento para exportar.");
    setIsExporting(true);
    try {
      const JSZip = (await import('jszip')).default;
      const { toJpeg } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');
      const zip = new JSZip();
      
      for (let i = 0; i < store.documents.length; i++) {
        const d = store.documents[i];
        const safeName = d.templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        const container = document.createElement('div');
        container.style.backgroundColor = "#ffffff";
        container.style.color = "#000000";
        container.style.width = "794px"; // A4 width at 96 DPI
        container.style.minHeight = "1123px"; // A4 height at 96 DPI
        container.style.padding = "48px 48px";
        container.style.boxSizing = "border-box";
        container.style.position = "fixed"; 
        container.style.top = "0px";
        container.style.left = "0px";
        container.style.zIndex = "-9999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "flex-start";
        container.style.justifyContent = "flex-start";
        
        const extraClasses = d.format === 'html' ? '' : 'font-serif text-[15px] leading-8 whitespace-pre-wrap antialiased';
        container.innerHTML = `<div class="${extraClasses}" style="color: black; background-color: transparent; width: 100%; text-align: justify; margin: 0; padding: 0;">${d.finalContent}</div>`;
        document.body.appendChild(container);

        try {
          await new Promise(r => setTimeout(r, 200));
          
          // Workaround for blank images - render twice
          await toJpeg(container, { quality: 0.1, backgroundColor: '#ffffff' }).catch(() => {});
          
          const dataUrl = await toJpeg(container, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' });
          const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (container.offsetHeight * pdfWidth) / container.offsetWidth;

          pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          const pdfBlob = pdf.output('blob');
          zip.file(`${String(i + 1).padStart(3, '0')}_${safeName}.pdf`, pdfBlob);
        } catch(e) {
          console.error("Erro gerando PDF:", e);
        } finally {
          document.body.removeChild(container);
        }
      }

      const filename = `Lote_Documentos_${new Date().toISOString().split('T')[0]}.zip`;

      if ((window as any).pywebview && (window as any).pywebview.api) {
        const zipBase64 = await zip.generateAsync({ type: 'base64' });
        const res = await (window as any).pywebview.api.save_zip(zipBase64, filename);
        if (res && res.error && res.error !== "Cancelado") {
           alert("Erro ao salvar usando sistema nativo: " + res.error);
        }
      } else {
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (err) {
      alert("Erro ao exportar ZIP: " + err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-row h-full gap-8">
       <div className={cn(
         "w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col overflow-hidden shrink-0",
         
       )}>
          <div className="p-6 border-b border-[#1a1a1a] flex flex-col gap-3">
             <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Documentos Gerados</h2>
             {store.documents.length > 0 && (
               <button 
                 onClick={handleExportAllZip}
                 disabled={isExporting}
                 className="w-full py-2 bg-[#1a1a1a] border border-[#333] hover:bg-[#222] disabled:opacity-50 text-[#39FF14] text-[10px] font-bold uppercase rounded-lg transition-colors flex justify-center items-center gap-2 tracking-widest"
               >
                 {isExporting ? (
                   <><Clock className="animate-spin h-3.5 w-3.5" /> Gerando PDFs...</>
                 ) : (
                   <><DownloadCloud className="h-3.5 w-3.5" /> Baixar Lote em PDF (ZIP)</>
                 )}
               </button>
             )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 ">
             {store.documents.map((d: any) => (
                <div 
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all",
                    selected?.id === d.id ? "bg-[#1a1a1a] border-[#39FF14]/30" : "bg-[#050505] border-[#1a1a1a] hover:border-[#222222]"
                  )}
                >
                   <p className="font-medium text-sm text-white truncate">{d.templateName}</p>
                   <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">{new Date(d.createdAt).toLocaleString()}</p>
                </div>
             ))}
             {store.documents.length === 0 && (
                <div className="text-center py-12 text-gray-700 font-mono text-xs italic">Sem registros no banco.</div>
             )}
          </div>
       </div>

       <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
         {selected ? (
           <div className="flex flex-col h-full">
              <div className="bg-[#0a0a0a] p-6 border-b border-[#1a1a1a] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setSelected(null)} className="hidden p-2 text-gray-400 hover:text-white">
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                    <div>
                       <h2 className="text-white font-bold text-sm text-base truncate max-w-[150px] max-w-none">{selected.templateName}</h2>
                       <p className="text-[8px] text-[10px] text-gray-500 font-mono uppercase mt-1 tracking-widest">ID: {selected.id.slice(0,8)}...</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => {
                        const iframe = document.createElement('iframe');
                        iframe.style.position = 'fixed';
                        iframe.style.right = '0';
                        iframe.style.bottom = '0';
                        iframe.style.width = '0';
                        iframe.style.height = '0';
                        iframe.style.border = '0';
                        document.body.appendChild(iframe);
                        
                        const doc = iframe.contentWindow?.document;
                        if (doc) {
                          const isHtml = selected.format === 'html';
                          doc.write(`
                            <html>
                              <head>
                                <title>${selected.templateName || 'Documento'}</title>
                                <style>
                                  @page { margin: 15mm; }
                                  body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                </style>
                              </head>
                              <body class="bg-white text-black">
                                <div class="${isHtml ? "max-w-none" : "font-serif text-sm leading-8 whitespace-pre-wrap antialiased"}">
                                  ${selected.finalContent}
                                </div>
                              </body>
                            </html>
                          `);
                          
                          const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
                          styles.forEach(style => doc.head.appendChild(style.cloneNode(true)));
                          
                          doc.close();
                          
                          setTimeout(() => {
                            iframe.contentWindow?.focus();
                            iframe.contentWindow?.print();
                            setTimeout(() => document.body.removeChild(iframe), 1000);
                          }, 500);
                        }
                    }} className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-[#39FF14] transition-colors"><Printer className="h-4 w-4 h-5 w-5" /></button>
                    <button onClick={() => { store.deleteDocument(selected.id); setSelected(null); }} className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4 h-5 w-5" /></button>
                     <button 
                       onClick={() => handleSendViaWebmail('gmail', selected.finalContent)} 
                       className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-bold"
                       title="Enviar via Gmail (Copiar Design)"
                     >
                       <Mail className="h-4 w-4 h-5 w-5 text-red-500" /> <span className="hidden sm:inline">Gmail</span>
                     </button>
                     <button 
                       onClick={() => handleSendViaWebmail('yahoo', selected.finalContent)} 
                       className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1 text-xs font-bold"
                       title="Enviar via Yahoo Mail (Copiar Design)"
                     >
                       <Mail className="h-4 w-4 h-5 w-5 text-purple-400" /> <span className="hidden sm:inline">Yahoo</span>
                     </button>
                 </div>
              </div>
              <div className="flex-1 p-6 p-16 overflow-y-auto text-black select-text">
                <div className="max-w-2xl mx-auto">
                    {selected.format === 'html' ? (
                       <div dangerouslySetInnerHTML={{ __html: selected.finalContent }} className="max-w-none text-black" />
                    ) : (
                      <pre className="font-serif text-sm text-base leading-relaxed leading-8 whitespace-pre-wrap">{selected.finalContent}</pre>
                    )}
                </div>
              </div>
           </div>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-[#0a0a0a] py-20">
              <History className="h-12 w-12 opacity-10 mb-4" />
              <p className="font-mono text-sm tracking-widest uppercase">Aguardando Seleção</p>
           </div>
         )}
       </div>
    </div>
  );
}

function SettingsView({ store }: { store: any }) {

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Preferências Hack Document</h1>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Security & API Infrastructure</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          <section className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" /> Google Gen AI (LLM)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Gemini API Key</label>
                <div className="flex gap-2">
                  <input 
                    type="password"
                    className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-4 text-sm focus:border-purple-400 outline-none transition-all"
                    placeholder="AIzaSy..."
                    value={store.geminiKey}
                    onChange={e => store.setGeminiKey(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                        window.alert('Chave API salva! O assistente de IA Gemini já está ativo para uso.');
                    }}
                    className="px-4 bg-purple-500 text-black font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-purple-400 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Salvar API
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between px-1">
                  <p className="text-[10px] text-gray-600 italic">Necessário para gerar documentos e preenchimento dinâmico com IA.</p>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-400 font-bold hover:underline tracking-wider uppercase flex items-center gap-1">
                    Pegar Chave <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// --- Utils & Subcomponents ---

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl transition-all font-medium text-xs md:text-sm border whitespace-nowrap",
        active 
          ? "bg-[#39FF14] text-black border-[#39FF14] shadow-[0_0_15px_-3px_rgba(57,255,20,0.4)]" 
          : "text-gray-400 hover:text-white border-transparent hover:bg-[#1a1a1a]/50"
      )}
    >
      <div className={cn(
        "transition-colors flex items-center justify-center shrink-0",
        active ? "text-black" : "text-gray-500 hover:text-white"
      )}>
        {icon}
      </div>
      <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px] md:text-xs">{label}</span>
    </motion.button>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  const colors: Record<string, string> = {
    green: "group-hover:border-[#39FF14]/50 group-hover:shadow-[#39FF14]/10",
    blue: "group-hover:border-blue-400/50 group-hover:shadow-blue-400/10",
    purple: "group-hover:border-purple-400/50 group-hover:shadow-purple-400/10",
    orange: "group-hover:border-orange-400/50 group-hover:shadow-orange-400/10"
  };

  return (
    <div className={cn(
      "bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 transition-all group hover:-translate-y-1",
      colors[color]
    )}>
      <div className="flex items-center justify-between mb-4">
         <div className="p-2 bg-[#1a1a1a] rounded-lg">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function CreationView({ store }: { store: any }) {
  const [tema, setTema] = useState('');
  const [cor1, setCor1] = useState('');
  const [cor2, setCor2] = useState('');
  const [estilo, setEstilo] = useState('clássico');
  const [cabecalho, setCabecalho] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [rodape, setRodape] = useState('');
  const [botao, setBotao] = useState('');
  const [link, setLink] = useState('');

  const [generatedHtml, setGeneratedHtml] = useState('');
  const [templateName, setTemplateName] = useState('');

  const generatePrompt = () => {
    return `crie um email decorado profissional com imagens, detalhes, como uma corporação merece, esse email tera o tema "${tema}" que eu quero nas cores "${cor1}" e "${cor2}" esse email tambem no estilo "${estilo}" e como os seguintes dados no cabeçalho "${cabecalho}" e os seguintes dados no rodape "${rodape}" que terá apenas um botao escrito "${botao}" direcionando para o link "${link}" e esse email no código sera criado assim <a href="${link}">${botao}</a> ou <p>${mensagem}</p>. Retorne apenas o código do e-mail em HTML.`;
  };

  const currentPrompt = generatePrompt();

  const handleCopyAndGo = (url: string) => {
    navigator.clipboard.writeText(currentPrompt);
    alert("Prompt copiado para a área de transferência! Cole na janela da inteligência artificial.");
    window.open(url, '_blank');
  };

  const saveAsTemplate = () => {
    if (!generatedHtml) {
      alert("Cole o HTML retornado pela IA antes de salvar!");
      return;
    }
    const name = templateName || `Email - ${tema || 'Novo'}`;
    store.addTemplate({
      id: generateId(),
      name,
      content: generatedHtml,
      format: 'html',
      type: 'email'
    });
    setTemplateName('');
    setGeneratedHtml('');
    alert("Salvo como template!");
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12 h-screen overflow-y-auto pr-2 no-scrollbar">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Brush className="text-[#39FF14]" /> Ferramentas de Criação
        </h2>
        <p className="text-sm text-gray-500 max-w-2xl">
          Preencha as variáveis abaixo para gerar um prompt mestre de criação de e-mail incrível. 
          Use os botões para abri-lo em uma Inteligência Artificial, depois cole o resultado aqui e salve no sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form */}
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-[#222] pb-3 mb-4 uppercase tracking-wider">
            Variáveis do Email
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Tema do email</label>
              <input type="text" className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex: Divulgação de Lançamento" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Cor 1 (Principal)</label>
                <input type="text" className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition" value={cor1} onChange={(e) => setCor1(e.target.value)} placeholder="Ex: Preto / Azul Marinho" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Cor 2 (Secundária)</label>
                <input type="text" className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition" value={cor2} onChange={(e) => setCor2(e.target.value)} placeholder="Ex: Dourado / Verde Neon" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Estilo</label>
              <select className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition" value={estilo} onChange={(e) => setEstilo(e.target.value)}>
                <option value="clássico">Clássico</option>
                <option value="casual">Casual</option>
                <option value="elegante">Elegante</option>
                <option value="futurista">Futurista</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Dados do Cabeçalho</label>
              <input type="text" className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition" value={cabecalho} onChange={(e) => setCabecalho(e.target.value)} placeholder="Ex: Logo da Empresa, Título Principal" />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Mensagem (Corpo)</label>
              <textarea className="w-full h-16 bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition resize-none" value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Ex: Estamos lançando o nosso novo produto..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Texto do Botão</label>
                <input type="text" className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition" value={botao} onChange={(e) => setBotao(e.target.value)} placeholder="Ex: Clique Aqui" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">URL (Link)</label>
                <input type="text" className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Ex: https://..." />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Dados do Rodapé</label>
              <input type="text" className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition" value={rodape} onChange={(e) => setRodape(e.target.value)} placeholder="Ex: Todos direitos reservados, Redes Sociais" />
            </div>
          </div>
        </div>

        {/* Output area */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] p-6 shadow-xl flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-bold text-white border-b border-[#222] pb-3 mb-4 flex items-center justify-between">
              <span>Prompt Gerado</span>
              <button title="Copiar" onClick={() => { navigator.clipboard.writeText(currentPrompt); alert('Copiado!'); }} className="text-[#39FF14] hover:underline flex items-center gap-1 text-xs">
                <Copy className="h-4 w-4" /> Copiar 
              </button>
            </h3>
            
            <div className="bg-[#111] border border-[#222] rounded-lg p-3 text-xs text-gray-300 flex-1 overflow-y-auto mb-4 whitespace-pre-wrap font-mono leading-relaxed min-h-[120px]">
              {currentPrompt}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-auto">
              <button onClick={() => handleCopyAndGo('https://chat.deepseek.com')} className="py-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#333] rounded-xl text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
                DeepSeek <ExternalLink className="h-3 w-3" />
              </button>
              <button onClick={() => handleCopyAndGo('https://kimi.moonshot.cn')} className="py-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#333] rounded-xl text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
                Kimi <ExternalLink className="h-3 w-3" />
              </button>
              <button onClick={() => handleCopyAndGo('https://chatgpt.com')} className="py-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#333] rounded-xl text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
                ChatGPT <ExternalLink className="h-3 w-3" />
              </button>
              <button onClick={() => handleCopyAndGo('https://gemini.google.com')} className="py-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#333] rounded-xl text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
                Gemini <ExternalLink className="h-3 w-3" />
              </button>
              <button onClick={() => handleCopyAndGo('https://copilot.microsoft.com')} className="py-2.5 sm:col-span-2 md:col-span-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#333] rounded-xl text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
                Copilot <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] p-6 shadow-xl mt-4 w-full">
        <h3 className="text-sm font-bold text-white border-b border-[#222] pb-3 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Save className="h-4 w-4 text-[#39FF14]" /> Importar Template
        </h3>
        
        <p className="text-xs text-gray-400 mb-4">
          Após a IA criar o código do seu E-mail, cole-o aqui para salvar imediatamente como um Template do sistema.
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <textarea 
            className="w-full flex-1 h-32 bg-[#111] border border-[#222] rounded-lg p-3 text-sm text-gray-300 font-mono focus:border-[#39FF14] outline-none transition resize-none" 
            value={generatedHtml} 
            onChange={(e) => setGeneratedHtml(e.target.value)} 
            placeholder="Cole o código HTML fornecido pela inteligência artificial aqui..." 
          />
          <div className="flex flex-col gap-3 md:w-64">
            <input 
              type="text" 
              className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition" 
              value={templateName} 
              onChange={(e) => setTemplateName(e.target.value)} 
              placeholder="Nome do Template" 
            />
            <button 
              onClick={saveAsTemplate}
              className="w-full py-2.5 px-6 bg-[#222] hover:bg-[#333] border border-[#39FF14]/50 rounded-xl text-[#39FF14] font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" /> Salvar no Sistema
            </button>
            <div className="border-t border-[#222] pt-3 mt-1 flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Visualização e Teste Rápido:</span>
              <button 
                onClick={() => {
                  if (!generatedHtml) {
                    alert("Por favor, cole o código HTML criado pela IA na caixa de texto primeiro para testar!");
                    return;
                  }
                  handleSendViaWebmail('gmail', generatedHtml);
                }}
                className="w-full py-2 px-4 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-red-500/40 rounded-lg text-xs text-gray-300 hover:text-white font-bold transition flex items-center justify-center gap-2"
              >
                <Mail className="h-3.5 w-3.5 text-red-500" /> Testar no Gmail
              </button>
              <button 
                onClick={() => {
                  if (!generatedHtml) {
                    alert("Por favor, cole o código HTML criado pela IA na caixa de texto primeiro para testar!");
                    return;
                  }
                  handleSendViaWebmail('yahoo', generatedHtml);
                }}
                className="w-full py-2 px-4 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-purple-500/40 rounded-lg text-xs text-gray-300 hover:text-white font-bold transition flex items-center justify-center gap-2"
              >
                <Mail className="h-3.5 w-3.5 text-purple-400" /> Testar no Yahoo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}