import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from './store';
import { 
  Code, FileText, History, Settings, Printer, Download, Save, Plus, 
  Trash2, Mail, TerminalSquare, Menu, X, LayoutDashboard, Sparkles, 
  ChevronRight, ArrowRight, CheckCircle2, AlertCircle, FileDown, 
  Clock, Send, ShieldCheck, Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, ExternalLink, Image, Camera, UploadCloud
} from 'lucide-react';
import { generateId, extractVariables, replaceVariables, cn } from './lib/utils';
import { Template, GeneratedDocument } from './types';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'generate' | 'templates'  | 'history' | 'settings';

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
            <span className="font-bold text-base md:text-lg tracking-tight leading-none text-[#39FF14] whitespace-nowrap">HACK DOCS</span>
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
          <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="block">
            <NavItem 
              icon={<ExternalLink className="h-4 w-4 md:h-5 md:w-5" />} 
              label="Nova Guia" 
              active={false} 
              onClick={() => {}} 
            />
          </a>
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
  const template = store.templates.find((t: any) => t.id === selectedId);
  const detected = template ? extractVariables(template.content) : [];

  const [leftTab, setLeftTab] = useState<'fill' | 'ai'>('fill');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeActions, setActiveActions] = useState<Record<string, boolean>>({});

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
          await store.addTemplate(newTmpl);
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
        await store.addTemplate(newTmpl);
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
    const doc: GeneratedDocument = {
      id: generateId(),
      templateId: template.id,
      templateName: template.name,
      type: template.type,
      format: template.format,
      variables: vars,
      finalContent: finalContent,
      createdAt: new Date().toISOString()
    };
    store.saveDocument(doc);
    alert("Salvo no histórico com sucesso!");
  };

  const insertDraggableImageBlock = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    let style = "width: 140px; height: 175px; border: 2px dashed #39FF14; background-color: #fcfcfc; border-radius: 8px; position: absolute; top: 20px; right: 20px; overflow: hidden; cursor: grab; text-align: center; font-family: sans-serif; resize: both; z-index: 50;";

    const htmlString = `<div class="photo-upload-container absolute-draggable" style="${style}" contenteditable="false" ` +
      `onmousedown="` +
        `const rect = this.getBoundingClientRect(); ` +
        `if (event.clientX > rect.right - 25 && event.clientY > rect.bottom - 25) return; ` +
        `event.preventDefault(); ` +
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
          `if(!dragged && !el.dataset.loaded){ el.querySelector('input').click(); }` +
        `}; ` +
        `document.addEventListener('mousemove', mouseMoveHandler); ` +
        `document.addEventListener('mouseup', mouseUpHandler);` +
      `">` +
      `<input type="file" accept="image/*, .png, .jpg, .jpeg, .webp, .svg, .gif, .bmp" style="display: none;" onchange="` +
        `const inputEl = this;` +
        `const file = inputEl.files[0];` +
        `if (file) {` +
          `const reader = new FileReader();` +
          `reader.onload = (e) => {` +
            `const parent = inputEl.parentElement;` +
            `parent.style.border = '2px solid transparent';` +
            `parent.style.backgroundColor = 'transparent';` +
            `parent.dataset.loaded = 'true';` +
            `const img = parent.querySelector('.photo-preview-img');` +
            `img.src = e.target.result;` +
            `img.style.display = 'block';` +
            `parent.querySelector('.photo-upload-placeholder').style.display = 'none';` +
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
      }, 100);
    }
  };

  return (
    <div className="flex flex-col flex-1 gap-8 w-full max-w-full">
      {/* Header Controls */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden group flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Selecionar Modelo</label>
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
            </select>
          </div>
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
                    const email = prompt("Digite o e-mail de destino:");
                    if(email) {
                       const currentContent = document.getElementById('editable-document-body')?.innerHTML || finalContent;
                       fetch('/api/send-email', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                           to: email,
                           subject: `Documento: ${template?.name || 'Documento'}`,
                           html: currentContent,
                           smtpUser: store.smtpUser || '',
                           smtpPass: store.smtpPass || '',
                           smtpProvider: store.smtpProvider || 'gmail'
                         })
                       }).then(res => res.json()).then(data => {
                          if(data.success) alert("E-mail enviado!");
                          else alert("Erro ao enviar: " + data.error);
                       }).catch(() => alert("Erro crítico ao enviar e-mail."));
                    }
                 }}
                 className="flex-1 min-w-[120px] px-3 py-2 bg-[#1a1a1a] border border-[#222222] text-white font-bold rounded-xl hover:bg-[#222222] transition flex items-center justify-center gap-2 text-xs"
               >
                  <Mail className="h-3 w-3 text-orange-400" /> Enviar E-mail
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
                      const isHtml = template?.format === 'html';
                      const printContent = isHtml ? finalContent : `<pre style="white-space: pre-wrap; font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; text-align: justify;">${finalContent}</pre>`;
                      
                      doc.write(`
                        <html>
                          <head>
                            <title>${template?.name || 'Documento'}</title>
                            <style>
                              @page { margin: 2.5cm; }
                              body { 
                                font-family: 'Times New Roman', Times, serif; 
                                margin: 0; 
                                font-size: 12pt; 
                                line-height: 1.6; 
                                color: #000;
                                background: white;
                              }
                              h1, h2, h3 { text-align: center; }
                              pre { 
                                white-space: pre-wrap; 
                                word-wrap: break-word; 
                                font-family: inherit; 
                                margin: 0;
                              }
                              .prose { width: 100%; }
                              .prose table { width: 100%; border-collapse: collapse; }
                              .prose td, .prose th { border: 1px solid #ddd; padding: 8px; }
                              
                              /* Estilo para assinaturas na impressão */
                              .sig-container {
                                margin-top: 60px;
                                display: flex;
                                flex-wrap: wrap;
                                justify-content: space-around;
                                width: 100%;
                                page-break-inside: avoid;
                              }
                              .sig-box {
                                text-align: center;
                                padding: 20px;
                                flex: 1;
                                min-width: 250px;
                              }
                              .sig-line {
                                border: 0;
                                border-top: 1px solid #000;
                                width: 80%;
                                margin: 0 auto 10px auto;
                              }
                            </style>
                          </head>
                          <body>
                            <div class="prose">${printContent}</div>
                          </body>
                        </html>
                      `);
                      doc.close();
                      setTimeout(() => {
                        iframe.contentWindow?.focus();
                        iframe.contentWindow?.print();
                        setTimeout(() => document.body.removeChild(iframe), 1000);
                      }, 400);
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

          <div id="pdf-container" className="flex-1 overflow-y-auto p-12 bg-white text-black min-h-0 select-text selection:bg-blue-100">
             <div 
               id="editable-document-body"
               className={cn("outline-none max-w-none transition-all min-h-full relative text-black bg-white", template?.format === 'html' ? "prose prose-sm" : "font-serif text-sm leading-8 whitespace-pre-wrap antialiased")}
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
                       <div dangerouslySetInnerHTML={{ __html: editing.content }} className="prose prose-sm max-w-none text-black" />
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

  return (
    <div className="flex flex-row h-full gap-8">
       <div className={cn(
         "w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col overflow-hidden shrink-0",
         
       )}>
          <div className="p-6 border-b border-[#1a1a1a]">
             <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Documentos Gerados</h2>
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
                    <button onClick={() => window.print()} className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-[#39FF14] transition-colors"><Printer className="h-4 w-4 h-5 w-5" /></button>
                    <button onClick={() => { store.deleteDocument(selected.id); setSelected(null); }} className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4 h-5 w-5" /></button>
                 </div>
              </div>
              <div className="flex-1 p-6 p-16 overflow-y-auto text-black select-text">
                <div className="max-w-2xl mx-auto">
                    {selected.format === 'html' ? (
                       <div dangerouslySetInnerHTML={{ __html: selected.finalContent }} className="prose prose-sm prose-base max-w-none" />
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
  const [smtpLogs, setSmtpLogs] = useState<any[]>([]);
  const [isEditingPass, setIsEditingPass] = useState(false);

  useEffect(() => {
    fetch('/api/logs')
      .then(r => r.json())
      .then(data => setSmtpLogs(Array.isArray(data) ? data : []))
      .catch(() => setSmtpLogs([]));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Preferências DocuMestre</h1>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Security & API Infrastructure</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#39FF14]" /> Servidor SMTP (Outbound)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Provedor de E-mail</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gmail', label: 'Gmail', desc: 'smtp.gmail.com' },
                    { id: 'yahoo', label: 'Yahoo Mail', desc: 'smtp.mail.yahoo.com' },
                    { id: 'outlook', label: 'Outlook / Hotmail', desc: 'smtp.office365.com' },
                    { id: 'other', label: 'Outro (Personalizado)', desc: 'Reconhecimento Auto' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => store.setSmtpProvider(p.id)}
                      className={cn(
                        "p-3 rounded-xl border flex flex-col items-start transition-all text-left",
                        store.smtpProvider === p.id 
                          ? "bg-[#39FF14]/10 border-[#39FF14] text-white shadow-[0_0_10px_-3px_rgba(57,255,20,0.3)]" 
                          : "bg-[#050505] border-[#1a1a1a] hover:border-[#333] text-gray-400 hover:text-white"
                      )}
                    >
                      <span className="text-xs font-bold leading-none">{p.label}</span>
                      <span className="text-[8px] font-mono mt-1 opacity-60 uppercase tracking-tight">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">E-mail Remetente</label>
                <input 
                  type="email"
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-4 text-sm focus:border-[#39FF14] outline-none transition-all"
                  placeholder="exemplo@gmail.com"
                  value={store.smtpUser}
                  onChange={e => store.setSmtpUser(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Senha App / Token</label>
                {(isEditingPass || !store.smtpPass) ? (
                  <div className="flex gap-2">
                    <input 
                      type="password"
                      className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-4 text-sm focus:border-[#39FF14] outline-none transition-all"
                      placeholder="••••••••••••••••"
                      value={store.smtpPass}
                      onChange={e => store.setSmtpPass(e.target.value)}
                    />
                    {store.smtpPass && (
                      <button 
                        onClick={() => setIsEditingPass(false)}
                        className="px-4 bg-[#39FF14] text-black font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#32e612] transition-colors whitespace-nowrap"
                      >
                        Salvar
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="password"
                      className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-4 text-sm text-gray-500 outline-none cursor-not-allowed"
                      value="••••••••••••••••"
                      disabled
                    />
                    <button 
                      onClick={() => setIsEditingPass(true)}
                      className="px-4 bg-[#1a1a1a] text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#222] transition-colors whitespace-nowrap"
                    >
                      Trocar Senha
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-gray-600 mt-2 italic px-1">Obs: Para Gmail ou Yahoo, utilize uma "Senha de Aplicativo".</p>
              </div>

              <div className="pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
                <div>
                  <label className="block text-[10px] font-mono text-white uppercase font-bold tracking-widest mb-1">
                    Salvar na Memória (Permanente)
                  </label>
                  <p className="text-[9px] text-gray-500 leading-normal max-w-[210px]">
                    Se ativado, suas credenciais de e-mail e senha ficam guardadas no dispositivo. Se desativado, elas expiram ao final da sessão.
                  </p>
                </div>
                <button
                  onClick={() => store.setSaveSmtp(!store.saveSmtp)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none flex items-center shrink-0",
                    store.saveSmtp ? "bg-[#39FF14]" : "bg-gray-800"
                  )}
                >
                  <motion.div
                    layout
                    className={cn(
                      "w-4 h-4 rounded-full shadow-md bg-white transition-transform duration-200",
                      store.saveSmtp ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#39FF14]" /> Operação 100% Offline
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl">
                 <p className="text-[10px] text-[#39FF14] leading-relaxed uppercase tracking-tighter font-bold mb-2">
                   PRIVACIDADE GARANTIDA
                 </p>
                 <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter">
                   Nenhum dado é enviado para APIs externas. Este sistema roda em ambiente isolado 
                   usando apenas os recursos do seu computador (JSON/Local Storage). Independente e Seguro.
                 </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 h-full flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-400" /> Logs de Comunicação
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {(smtpLogs || []).map(log => (
                <div key={log.id} className="p-4 bg-[#050505] border border-[#1a1a1a] rounded-xl flex flex-col gap-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-gray-200 truncate pr-4">{log.to}</span>
                     <span className={cn(
                       "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
                       log.status === 'Sucesso' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                     )}>
                       {log.status === 'Sucesso' ? 'OK' : 'FAIL'}
                     </span>
                   </div>
                   <p className="text-[9px] text-gray-500 font-mono italic">{log.subject}</p>
                   <p className="text-[8px] text-gray-600 mt-1 uppercase tracking-widest">{log.timestamp}</p>
                </div>
              ))}
              {(!smtpLogs || smtpLogs.length === 0) && (
                <div className="text-center py-12 text-gray-700 font-mono text-xs">Sem logs disponíveis.</div>
              )}
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



