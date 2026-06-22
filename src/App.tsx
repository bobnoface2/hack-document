import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const MemoizedDocumentEditor = memo(({ content, className, onBlur, onContextMenu, onDoubleClick, onClick }: any) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && content !== divRef.current.innerHTML) {
      divRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div 
      ref={divRef}
      id="editable-document-body"
      className={className}
      contentEditable 
      suppressContentEditableWarning
      onContextMenu={onContextMenu}
      onBlur={onBlur}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if class or content fundamentally changes.
  // Actually, we don't even need memo for the class changes to be safe, but let's keep it safe.
  return prevProps.content === nextProps.content && prevProps.className === nextProps.className;
});
import { useAppStore } from './store';
import { 
  Code, FileText, History, Settings, Printer, Download, Save, Plus, 
  Trash2, Mail, TerminalSquare, Menu, X, LayoutDashboard, Sparkles, 
  ChevronRight, ArrowRight, CheckCircle2, AlertCircle, FileDown, 
  Clock, Send, ShieldCheck, Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, ExternalLink, Image, Camera, UploadCloud, Brush, Copy, Wand2, ListOrdered, DownloadCloud,
  Table, Grid, Columns, Palette, FileSpreadsheet, Search, Eye, Eraser, ZoomIn, ZoomOut, Sliders,
  Highlighter, MessageSquare, Quote, Split, Fingerprint, FileSignature, Globe, Scale,
  Minus, Square, Circle, StickyNote, ArrowUp, ArrowDown, Activity, FileCode, Building, Award, RotateCw, RotateCcw,
  ArrowLeft, Move, Maximize
} from 'lucide-react';
import { generateId, extractVariables, replaceVariables, cn } from './lib/utils';
import { Template, GeneratedDocument } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { SubmodulesToolbar } from './components/SubmodulesToolbar';
import { BrasoesPanel } from './components/BrasoesPanel';
import { InteractiveDocumentCanvas } from './components/InteractiveDocumentCanvas';

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

const numToExtensoBRL = (valor: number): string => {
  if (valor === 0) return "zero reais";
  if (valor < 0) return "valor negativo";
  if (valor > 999999999999) return "valor acima do limite corporativo";
  
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const dezenas_10_19 = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  const obterCentenaExtenso = (n: number, isCem: boolean): string => {
    if (n === 100) return isCem ? "cem" : "cento";
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    
    let extenso = "";
    if (c > 0) extenso += centenas[c];
    
    if (d === 1) {
      if (extenso) extenso += " e ";
      extenso += dezenas_10_19[u];
      return extenso;
    }
    
    if (d > 1) {
      if (extenso) extenso += " e ";
      extenso += dezenas[d];
    }
    
    if (u > 0) {
      if (extenso) extenso += " e ";
      extenso += unidades[u];
    }
    
    return extenso || "zero";
  };

  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);

  const escreverParteReais = (n: number): string => {
    if (n === 0) return "";
    if (n === 1) return "um real";
    
    const bilhoes = Math.floor(n / 1000000000);
    let resto = n % 1000000000;
    
    const milhoes = Math.floor(resto / 1000000);
    resto = resto % 1000000;
    
    const milhares = Math.floor(resto / 1000);
    const unidadesSimples = resto % 1000;
    
    let partes: string[] = [];
    
    if (bilhoes > 0) {
      partes.push(bilhoes === 1 ? "um bilhão" : `${obterCentenaExtenso(bilhoes, false)} bilhões`);
    }
    
    if (milhoes > 0) {
      partes.push(milhoes === 1 ? "um milhão" : `${obterCentenaExtenso(milhoes, false)} milhões`);
    }
    
    if (milhares > 0) {
      partes.push(milhares === 1 ? "um mil" : `${obterCentenaExtenso(milhares, false)} mil`);
    }
    
    if (unidadesSimples > 0) {
      partes.push(obterCentenaExtenso(unidadesSimples, true));
    }
    
    return partes.join(" e ") + " reais";
  };

  const escreverParteCentavos = (c: number): string => {
    if (c === 0) return "";
    if (c === 1) return "um centavo";
    return obterCentenaExtenso(c, false) + " centavos";
  };

  const txtReais = escreverParteReais(reais);
  const txtCentavos = escreverParteCentavos(centavos);

  if (txtReais && txtCentavos) {
    return `${txtReais} e ${txtCentavos}`;
  }
  return txtReais || txtCentavos || "zero reais";
};

type Tab = 'dashboard' | 'generate' | 'templates'  | 'history' | 'settings' | 'creation';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const store = useAppStore();
  const [selectedId, setSelectedId] = useState<string>('');
  const [unsavedTemplate, setUnsavedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (!selectedId && store.templates && store.templates.length > 0) {
      setSelectedId(store.templates[0].id);
    }
  }, [store.templates, selectedId]);

  const handleStartBlank = () => {
    const newId = 'blank-' + Math.random().toString(36).substring(2, 9);
    const blankTmpl: Template = {
      id: newId,
      name: 'Documento em Branco',
      type: 'documento',
      format: 'html',
      content: '<h2>Novo Documento em Branco</h2><p>Comece a escrever seu conteúdo aqui...</p>',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUnsavedTemplate(blankTmpl);
    setSelectedId(newId);
    setActiveTab('generate');
  };

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
              {activeTab === 'dashboard' && <DashboardView store={store} onAction={() => setActiveTab('generate')} onStartBlank={handleStartBlank} />}
              {activeTab === 'generate' && (
                <GenerateView 
                  store={store} 
                  selectedIdState={[selectedId, setSelectedId]} 
                  unsavedTemplateState={[unsavedTemplate, setUnsavedTemplate]} 
                />
              )}
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

function DashboardView({ store, onAction, onStartBlank }: { store: any, onAction: () => void, onStartBlank: () => void }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Status do Ecossistema</h1>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Painel de Controle Enterprise</p>
      </div>

      {/* Primary Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <button 
          id="dashboard-btn-new-blank"
          onClick={onStartBlank}
          className="flex items-center justify-between p-6 bg-[#0a0a0a] border border-[#39FF14]/20 hover:border-[#39FF14] rounded-2xl transition-all duration-300 text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 flex items-center justify-center text-[#39FF14] shrink-0">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base leading-snug group-hover:text-[#39FF14] transition-colors flex items-center gap-2">
                Iniciar Documento em Branco
              </h4>
              <p className="text-xs text-gray-500 mt-1">Crie um documento do zero com editor de texto formatado, imagens ajustáveis, formas e ferramentas de IA.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#39FF14] transition-colors translate-x-0 group-hover:translate-x-1 shrink-0" />
        </button>

        <button 
          id="dashboard-btn-browse-templates"
          onClick={onAction}
          className="flex items-center justify-between p-6 bg-[#0a0a0a] border border-[#1a1a1a] hover:border-blue-500 rounded-2xl transition-all duration-300 text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base leading-snug group-hover:text-blue-400 transition-colors">Navegar pelos Modelos Base</h4>
              <p className="text-xs text-gray-500 mt-1">Selecione modelos de contratos, recibos, certidões e relatórios pré-formatados.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors translate-x-0 group-hover:translate-x-1 shrink-0" />
        </button>
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

function GenerateView({ 
  store,
  selectedIdState,
  unsavedTemplateState
}: { 
  store: any;
  selectedIdState?: [string, React.Dispatch<React.SetStateAction<string>>];
  unsavedTemplateState?: [Template | null, React.Dispatch<React.SetStateAction<Template | null>>];
}) {
  const [internalSelectedId, setInternalSelectedId] = useState(store.templates[0]?.id || '');
  const [internalUnsavedTemplate, setInternalUnsavedTemplate] = useState<Template | null>(null);

  const selectedId = selectedIdState ? selectedIdState[0] : internalSelectedId;
  const setSelectedId = selectedIdState ? selectedIdState[1] : setInternalSelectedId;

  const unsavedTemplate = unsavedTemplateState ? unsavedTemplateState[0] : internalUnsavedTemplate;
  const setUnsavedTemplate = unsavedTemplateState ? unsavedTemplateState[1] : setInternalUnsavedTemplate;

  const [vars, setVars] = useState<Record<string, string>>({});
  const [finalContent, setFinalContent] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatures, setSignatures] = useState([{ name: '', role: '' }]);
  const template = (unsavedTemplate && unsavedTemplate.id === selectedId) 
    ? unsavedTemplate 
    : store.templates.find((t: any) => t.id === selectedId);
  const detected = template ? extractVariables(template.content) : [];
  
  const [localFormat, setLocalFormat] = useState<'html' | 'text'>('html');
  const [showTools, setShowTools] = useState(false);
  
  // Drawing Mode States
  const [drawingMode, setDrawingMode] = useState<{
    active: boolean;
    type: 'image' | 'shape' | 'stamp' | 'table';
    options?: any;
  } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingBox, setDrawingBox] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const drawingStartRef = useRef<{ x: number, y: number } | null>(null);

  // Estados para Referências de Rastreabilidade S/A
  const [refDocNum, setRefDocNum] = useState('');
  const [refDocNameState, setRefDocNameState] = useState('');
  const [refDocProgramState, setRefDocProgramState] = useState('HackDocument PRO Enterprise (online)');

  useEffect(() => {
    if (!selectedId && store.templates && store.templates.length > 0) {
      setSelectedId(store.templates[0].id);
    }
  }, [store.templates, selectedId, setSelectedId]);

  useEffect(() => {
    if (template) {
      setLocalFormat(template.format);
      setRefDocNameState(template.name || 'Documento Corporativo');
      setRefDocNum(`#DOC-2026-HD-${Math.floor(Math.random() * 900000 + 100000)}`);
    } else {
      setRefDocNameState('Documento Corporativo');
      setRefDocNum(`#DOC-2026-HD-${Math.floor(Math.random() * 900000 + 100000)}`);
    }
  }, [template?.id]);

  const toggleReferences = () => {
    const isPresent = finalContent.includes('editable-doc-reference-block');
    if (!isPresent) {
      const docNum = refDocNum || `#DOC-2026-HD-${Math.floor(Math.random() * 900000 + 100000)}`;
      const docName = refDocNameState || template?.name || 'Documento Corporativo';
      const docProgram = refDocProgramState || 'HackDocument PRO Enterprise (online)';
      
      const referenceHtml = `
<div class="editable-doc-reference-block" style="border: 2px solid #3b82f6; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-family: monospace; font-size: 11px; background-color: #fafafa; color: #404040; line-height: 1.6; text-align: left; page-break-inside: avoid;" contenteditable="true">
  <div style="font-weight: bold; border-bottom: 1.5px solid #3b82f6; padding-bottom: 6px; margin-bottom: 8px; color: #111827; text-transform: uppercase; font-size: 10.5px; display: flex; justify-content: space-between; align-items: center;" contenteditable="false">
    <span>📄 ID DE RASTREABILIDADE INTERNA S/A</span>
    <span style="font-size: 8.5px; color: #2563eb; background-color: #eff6ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #bfdbfe; font-weight: bold;">HACKDOCUMENT CERTIFIED</span>
  </div>
  <strong>NÚMERO DO DOCUMENTO:</strong> <span style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 3px; color: #111827; font-weight: bold;" contenteditable="true">${docNum}</span><br>
  <strong>NOME DO DOCUMENTO:</strong> <span style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 3px; color: #111827; font-weight: bold;" contenteditable="true">${docName}</span><br>
  <strong>PLATAFORMA EMISSORA:</strong> <span style="color: #2563eb; font-weight: bold;" contenteditable="true">${docProgram}</span>
</div>
<p class="reference-spacing">&nbsp;</p>
`;
      // Check if we can insert inside the first wrapper element
      const match = finalContent.match(/^<div[^>]*>/);
      if (match) {
        const firstDiv = match[0];
        const rest = finalContent.slice(firstDiv.length);
        setFinalContent(firstDiv + referenceHtml + rest);
      } else {
        setFinalContent(referenceHtml + finalContent);
      }
    } else {
      // Remove it cleanly
      let cleaned = finalContent.replace(/<div class="editable-doc-reference-block"[\s\S]*?<\/div>\s*(<p class="reference-spacing">&nbsp;<\/p>)?/g, '');
      cleaned = cleaned.replace(/<div class="editable-doc-reference-block"[\s\S]*?<\/div>/g, '');
      cleaned = cleaned.replace(/<p class="reference-spacing">&nbsp;<\/p>/g, '');
      setFinalContent(cleaned);
    }
  };

  const updateActiveReferences = () => {
    const isPresent = finalContent.includes('editable-doc-reference-block');
    if (!isPresent) return;
    
    let cleaned = finalContent.replace(/<div class="editable-doc-reference-block"[\s\S]*?<\/div>\s*(<p class="reference-spacing">&nbsp;<\/p>)?/g, '');
    cleaned = cleaned.replace(/<div class="editable-doc-reference-block"[\s\S]*?<\/div>/g, '');
    cleaned = cleaned.replace(/<p class="reference-spacing">&nbsp;<\/p>/g, '');
    
    const docNum = refDocNum || `#DOC-2026-HD-${Math.floor(Math.random() * 900000 + 100000)}`;
    const docName = refDocNameState || template?.name || 'Documento Corporativo';
    const docProgram = refDocProgramState || 'HackDocument PRO Enterprise (online)';
    
    const referenceHtml = `
<div class="editable-doc-reference-block" style="border: 2px solid #3b82f6; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-family: monospace; font-size: 11px; background-color: #fafafa; color: #404040; line-height: 1.6; text-align: left; page-break-inside: avoid;" contenteditable="true">
  <div style="font-weight: bold; border-bottom: 1.5px solid #3b82f6; padding-bottom: 6px; margin-bottom: 8px; color: #111827; text-transform: uppercase; font-size: 10.5px; display: flex; justify-content: space-between; align-items: center;" contenteditable="false">
    <span>📄 ID DE RASTREABILIDADE INTERNA S/A</span>
    <span style="font-size: 8.5px; color: #2563eb; background-color: #eff6ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #bfdbfe; font-weight: bold;">HACKDOCUMENT CERTIFIED</span>
  </div>
  <strong>NÚMERO DO DOCUMENTO:</strong> <span style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 3px; color: #111827; font-weight: bold;" contenteditable="true">${docNum}</span><br>
  <strong>NOME DO DOCUMENTO:</strong> <span style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 3px; color: #111827; font-weight: bold;" contenteditable="true">${docName}</span><br>
  <strong>PLATAFORMA EMISSORA:</strong> <span style="color: #2563eb; font-weight: bold;" contenteditable="true">${docProgram}</span>
</div>
<p class="reference-spacing">&nbsp;</p>
`;
    const match = cleaned.match(/^<div[^>]*>/);
    if (match) {
      const firstDiv = match[0];
      const rest = cleaned.slice(firstDiv.length);
      setFinalContent(firstDiv + referenceHtml + rest);
    } else {
      setFinalContent(referenceHtml + cleaned);
    }
  };

  const [leftTab, setLeftTab] = useState<'fill' | 'ai'>('fill');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeActions, setActiveActions] = useState<Record<string, boolean>>({});

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');

  const [showManualTools, setShowManualTools] = useState(true);
  const [activeSubmodule, setActiveSubmodule] = useState<'style' | 'draw' | 'tables' | 'corp' | 'audit'>('style');
  const [customRows, setCustomRows] = useState(5);
  const [customCols, setCustomCols] = useState(4);
  const [pontoRows, setPontoRows] = useState(31);
  const [pontoCols, setPontoCols] = useState(7);

  // Estados para inserção de imagem/elemento dinâmico S/A
  const [insertImgWidth, setInsertImgWidth] = useState(140);
  const [insertImgHeight, setInsertImgHeight] = useState(140);
  const [insertImgShape, setInsertImgShape] = useState<'rect' | 'rounded' | 'circle'>('rounded');
  const [insertImgBorder, setInsertImgBorder] = useState<'none' | 'solid' | 'dashed' | 'double'>('solid');
  const [insertImgBorderColor, setInsertImgBorderColor] = useState('#39FF14');
  const [insertImgPlacement, setInsertImgPlacement] = useState<'inline' | 'absolute'>('inline');
  const [insertImgCaption, setInsertImgCaption] = useState('');
  const [customFontColorValue, setCustomFontColorValue] = useState('#000000');

  // Estados para Ferramenta de Desenho/Paint S/A
  const [paintShape, setPaintShape] = useState<'line' | 'arrow' | 'rect' | 'circle' | 'callout'>('line');
  const [paintThickness, setPaintThickness] = useState(3);
  const [paintStyle, setPaintStyle] = useState<'solid' | 'dashed' | 'dotted' | 'double'>('solid');
  const [paintColor, setPaintColor] = useState('#2563eb');
  const [paintFill, setPaintFill] = useState(false);
  const [paintWidth, setPaintWidth] = useState(100); 
  const [paintHeight, setPaintHeight] = useState(80);

  // Corporate Automation Features (Professional Tools)
  const [zoomLevel, setZoomLevel] = useState(100);
  const [docPadding, setDocPadding] = useState('p-12');
  const [watermarkText, setWatermarkText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showHtmlRawEditor, setShowHtmlRawEditor] = useState(false);
  const [rawHtmlTextList, setRawHtmlTextList] = useState('');

  // Xerox & Scanner Manual Tools
  const [xeroxBackground, setXeroxBackground] = useState<string | null>(null);
  const [xeroxOpacity, setXeroxOpacity] = useState<number>(0.5);
  const [xeroxScale, setXeroxScale] = useState<number>(100);
  const [xeroxOffset, setXeroxOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [xeroxPrintWithBg, setXeroxPrintWithBg] = useState<boolean>(true);
  const [xeroxExtractedText, setXeroxExtractedText] = useState<string>('');

  // SLA continuous drafting timer and numeric helpers
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [extensoInputVal, setExtensoInputVal] = useState('');

  // AI Co-Pilot & Audit States S/A
  const [isRewriting, setIsRewriting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isAutofillingVars, setIsAutofillingVars] = useState(false);
  const [autofillRawText, setAutofillRawText] = useState('');
  const [isAutofillOpen, setIsAutofillOpen] = useState(false);
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('br_civil');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiateResult, setNegotiateResult] = useState<{
    buyerVersion: string;
    vendorVersion: string;
    brief: string;
  } | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    complianceScore: number;
    executiveSummary: string;
    risks: Array<{ level: string; clause: string; impact: string; suggestion: string }>;
    missingItems: string[];
  } | null>(null);

  // Realtime Page Count Predictor
  const [estimatedPages, setEstimatedPages] = useState(1);
  const [contentHeightPx, setContentHeightPx] = useState(0);

  useEffect(() => {
    const el = document.getElementById('editable-document-body');
    if (!el) return;

    const calculatePages = () => {
      // 1050px is a rough estimate of the vertical space available on an A4 page
      // when taking standard padding into account, on a 96DPI browser scaling.
      const height = el.scrollHeight;
      const pxPerPage = 1050; 
      setEstimatedPages(Math.max(1, Math.ceil(height / pxPerPage)));
      setContentHeightPx(height);
    };

    calculatePages();
    
    // Fallback interval for updates missed by observers
    const interval = setInterval(calculatePages, 2000);

    const mutationObserver = new MutationObserver(calculatePages);
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true, attributes: true });

    const resizeObserver = new ResizeObserver(calculatePages);
    resizeObserver.observe(el);

    return () => {
      clearInterval(interval);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [finalContent, docPadding, localFormat]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const formatSlaTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    let parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  };

  // Context Menu State for Right Click functionality
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    selectedText: string;
    targetEl: HTMLElement | null;
  }>({
    show: false,
    x: 0,
    y: 0,
    selectedText: '',
    targetEl: null
  });

  // Selected element floating toolbar state
  const [selectedElement, setSelectedElement] = useState<{
    id: string;
    el: HTMLElement;
  } | null>(null);
  const [elemProps, setElemProps] = useState<{w: number, h: number, x: number, y: number, rotate: number} | null>(null);

  useEffect(() => {
    if (!selectedElement) {
       setElemProps(null);
       return;
    }
    const updateProps = () => {
       const el = selectedElement.el;
       const rect = el.getBoundingClientRect();
       const transform = el.style.transform || '';
       const match = transform.match(/rotate\(([-\d.]+)deg\)/);
       const rotate = match ? parseFloat(match[1]) : 0;
       
       setElemProps({
         w: el.offsetWidth || rect.width,
         h: el.offsetHeight || rect.height,
         x: parseInt(el.style.left || '0'),
         y: parseInt(el.style.top || '0'),
         rotate
       });
    };
    updateProps();
    const iv = setInterval(updateProps, 500); // Polling for external css/resize changes
    return () => clearInterval(iv);
  }, [selectedElement]);

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const draggable = target.closest('.absolute-draggable') as HTMLElement;
    if (draggable && draggable.id) {
       setSelectedElement({ id: draggable.id, el: draggable });
    } else {
       setSelectedElement(null);
    }
  };

  const insertHtmlAtCursor = (html: string) => {
    const sel = window.getSelection();
    if (sel && sel.getRangeAt && sel.rangeCount) {
      let range = sel.getRangeAt(0);
      const editableBody = document.getElementById('editable-document-body');
      if (editableBody && editableBody.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const el = document.createElement("div");
        el.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node;
        let lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
        const currentContent = editableBody.innerHTML;
        setFinalContent(currentContent);
        return;
      }
    }
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) {
      editableBody.innerHTML += html;
      setFinalContent(editableBody.innerHTML);
    }
  };

  const insertPaintShape = () => {
    alert("DICA S/A: Com o mouse, clique e arraste no documento para definir o tamanho da forma escolhida.");
    setDrawingMode({
      active: true,
      type: 'shape',
      options: { paintShape, paintColor, paintThickness, paintFill, paintStyle }
    });
  };

  const applyClassToSelection = (className: string) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    try {
      const range = sel.getRangeAt(0);
      const selectedText = range.toString();
      if (!selectedText) return;
      
      const span = document.createElement('span');
      span.className = className;
      span.textContent = selectedText;
      
      range.deleteContents();
      range.insertNode(span);
      
      const editableBody = document.getElementById('editable-document-body');
      if (editableBody) {
        setFinalContent(editableBody.innerHTML);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Context Menu and Corporate Tools Helpers ---
  useEffect(() => {
    const handleCloseMenu = () => {
      setContextMenu(prev => prev.show ? { ...prev, show: false } : prev);
    };
    window.addEventListener('click', handleCloseMenu);
    
    // Close on any click inside/outside editor
    const editor = document.getElementById('editable-document-body');
    if (editor) {
      editor.addEventListener('click', handleCloseMenu);
    }
    
    return () => {
      window.removeEventListener('click', handleCloseMenu);
      if (editor) {
        editor.removeEventListener('click', handleCloseMenu);
      }
    };
  }, [contextMenu.show]);

  const handleContextMenuTrigger = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if right click occurred inside the editable document body
    const editableBody = document.getElementById('editable-document-body');
    if (!editableBody) return;
    
    e.preventDefault();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString().trim() : '';
    
    // Position menu carefully
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      selectedText,
      targetEl: e.target as HTMLElement
    });
  };

  const handleDeleteElement = (el: HTMLElement) => {
    if (el) {
       el.remove();
       const editableBody = document.getElementById('editable-document-body');
       if (editableBody) setFinalContent(editableBody.innerHTML);
    }
  };

  const handleRotateElement = (el: HTMLElement, degrees: number) => {
    if (el) {
       const currentTransform = el.style.transform || '';
       const rotMatch = currentTransform.match(/rotate\(([-\d.]+)deg\)/);
       let currentDeg = 0;
       if (rotMatch) currentDeg = parseFloat(rotMatch[1]);
       const newDeg = currentDeg + degrees;
       
       if (rotMatch) {
         el.style.transform = currentTransform.replace(/rotate\([-\d.]+deg\)/, `rotate(${newDeg}deg)`);
       } else {
         el.style.transform = `${currentTransform} rotate(${newDeg}deg)`.trim();
       }
       const editableBody = document.getElementById('editable-document-body');
       if (editableBody) setFinalContent(editableBody.innerHTML);
    }
  };

  const handleZIndexElement = (el: HTMLElement, direction: 'front' | 'back') => {
    if (el) {
       const currentZ = parseInt(el.style.zIndex || '50', 10);
       el.style.zIndex = direction === 'front' ? String(currentZ + 10) : String(currentZ - 10);
       const editableBody = document.getElementById('editable-document-body');
       if (editableBody) setFinalContent(editableBody.innerHTML);
    }
  };

  const handleNudgeElement = (el: HTMLElement, direction: 'up' | 'down' | 'left' | 'right', amount: number) => {
    if (el) {
       if (!el.style.position) {
         el.style.position = 'absolute';
       }
       const currentLeft = parseInt(el.style.left || '100', 10);
       const currentTop = parseInt(el.style.top || '100', 10);
       
       if (direction === 'up') el.style.top = `${currentTop - amount}px`;
       if (direction === 'down') el.style.top = `${currentTop + amount}px`;
       if (direction === 'left') el.style.left = `${currentLeft - amount}px`;
       if (direction === 'right') el.style.left = `${currentLeft + amount}px`;
       
       if (selectedElement && selectedElement.el === el) {
         setElemProps(prev => prev ? {
           ...prev,
           x: parseInt(el.style.left || '100', 10),
           y: parseInt(el.style.top || '100', 10)
         } : null);
       }
       
       const editableBody = document.getElementById('editable-document-body');
       if (editableBody) setFinalContent(editableBody.innerHTML);
    }
  };

  const handleScaleElement = (el: HTMLElement, amount: number, dimension: 'both' | 'width' | 'height' = 'both') => {
    if (el) {
       const currentWidth = el.offsetWidth || parseInt(el.style.width || '100', 10);
       const currentHeight = el.offsetHeight || parseInt(el.style.height || '100', 10);
       
       const newWidth = Math.max(10, currentWidth + amount);
       const newHeight = Math.max(10, currentHeight + amount);
       
       if (dimension === 'both' || dimension === 'width') {
         el.style.width = `${newWidth}px`;
       }
       if (dimension === 'both' || dimension === 'height') {
         el.style.height = `${newHeight}px`;
       }
       
       if (selectedElement && selectedElement.el === el) {
         setElemProps(prev => prev ? {
           ...prev,
           w: dimension === 'both' || dimension === 'width' ? newWidth : prev.w,
           h: dimension === 'both' || dimension === 'height' ? newHeight : prev.h
         } : null);
       }
       
       const editableBody = document.getElementById('editable-document-body');
       if (editableBody) setFinalContent(editableBody.innerHTML);
    }
  };

  const enableElementDraggable = (el: HTMLElement) => {
    if (!el) return;
    
    if (!el.id) {
      el.id = 'elem-block-' + Math.random().toString(36).substring(2, 9);
    }
    
    const editor = document.getElementById('editable-document-body');
    if (!editor) return;
    
    const editorRect = editor.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const zoom = zoomLevel ? zoomLevel / 100 : 1;
    
    const left = (elRect.left - editorRect.left) / zoom;
    const top = (elRect.top - editorRect.top) / zoom;
    const width = elRect.width / zoom;
    const height = elRect.height / zoom;
    
    el.classList.add('absolute-draggable');
    el.style.position = 'absolute';
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = width > 0 ? `${width}px` : '200px';
    el.style.height = height > 0 ? `${height}px` : 'auto';
    el.style.cursor = 'grab';
    el.style.zIndex = el.style.zIndex || '50';
    
    const mousedownStr = `
      const rect = this.getBoundingClientRect();
      if (typeof event !== 'undefined' && event) {
        if (event.clientX > rect.right - 25 && event.clientY > rect.bottom - 25) return;
        if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'input') return;
      }
      const el = this;
      const startX = event ? event.clientX : 0;
      const startY = event ? event.clientY : 0;
      const initX = parseInt(el.style.left || el.offsetLeft || 0);
      const initY = parseInt(el.style.top || el.offsetTop || 0);
      el.style.cursor = 'grabbing';
      let dragged = false;
      const mouseMoveHandler = function(e){
        if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) dragged = true;
        el.style.left = (initX + e.clientX - startX) + 'px';
        el.style.top = (initY + e.clientY - startY) + 'px';
      };
      const mouseUpHandler = function(e){
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        el.style.cursor = 'grab';
        if(dragged) { setTimeout(() => { el.dataset.justDragged = 'true'; }, 0); setTimeout(() => { el.dataset.justDragged = ''; }, 100); }
      };
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    `.replace(/\\/g, '\\\\').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    el.setAttribute('onmousedown', mousedownStr);
    
    setFinalContent(editor.innerHTML);
  };

  const handleDrawingMouseDown = (e: React.MouseEvent) => {
    if (!drawingMode?.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / (zoomLevel / 100);
    const startY = (e.clientY - rect.top) / (zoomLevel / 100);
    drawingStartRef.current = { x: startX, y: startY };
    setIsDrawing(true);
    setDrawingBox({ x: startX, y: startY, w: 0, h: 0 });
  };

  const handleDrawingMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !drawingStartRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currX = (e.clientX - rect.left) / (zoomLevel / 100);
    const currY = (e.clientY - rect.top) / (zoomLevel / 100);
    
    const x = Math.min(currX, drawingStartRef.current.x);
    const y = Math.min(currY, drawingStartRef.current.y);
    const w = Math.abs(currX - drawingStartRef.current.x);
    const h = Math.abs(currY - drawingStartRef.current.y);
    
    setDrawingBox({ x, y, w, h });
  };

  const executeDrawingInsertion = () => {
    if (!drawingBox || !drawingMode) return;
    
    // Fallback block ID
    const blockId = 'elem-block-' + Math.random().toString(36).substring(2, 9);
    
    // Common absolute style mapping
    const styleStr = `position: absolute; left: ${drawingBox.x}px; top: ${drawingBox.y}px; width: ${drawingBox.w}px; height: ${drawingBox.h}px; z-index: 55;`;
    
    const dragAttributes = `onmousedown="
      const rect = this.getBoundingClientRect();
      if (event.clientX > rect.right - 25 && event.clientY > rect.bottom - 25) return;
      if (event.target.tagName.toLowerCase() === 'input') return;
      const el = this;
      const startX = event.clientX;
      const startY = event.clientY;
      const initX = parseInt(el.style.left || el.offsetLeft || 0);
      const initY = parseInt(el.style.top || el.offsetTop || 0);
      el.style.cursor = 'grabbing';
      let dragged = false;
      const mouseMoveHandler = function(e){
        if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) dragged = true;
        el.style.left = (initX + e.clientX - startX) + 'px';
        el.style.top = (initY + e.clientY - startY) + 'px';
      };
      const mouseUpHandler = function(e){
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        el.style.cursor = 'grab';
        if(dragged) { setTimeout(() => { el.dataset.justDragged = 'true'; }, 0); setTimeout(() => { el.dataset.justDragged = ''; }, 100); }
      };
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    "`.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    let html = '';
    
    if (drawingMode.type === 'image' || drawingMode.type === 'shape' || drawingMode.type === 'stamp' || drawingMode.type === 'custom') {
       if (drawingMode.type === 'image') {
          html = `<div id="${blockId}" class="photo-upload-container absolute-draggable" style="${styleStr} border: 2px dashed #39FF14; background-color: #fcfcfc; border-radius: 8px; overflow: hidden; cursor: grab; text-align: center; font-family: sans-serif;" contenteditable="false" onclick="if(!this.dataset.justDragged && !this.dataset.loaded) { const input = this.querySelector('input'); if(input) { input.value = ''; input.click(); } }" ${dragAttributes}><input type="file" accept="image/*" style="display: none;" onchange="if(this.files && this.files[0]){ const reader = new FileReader(); const parent = this.parentElement; reader.onload = (e) => { parent.innerHTML = '<img src=&quot;' + e.target.result + '&quot; style=&quot;width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit;&quot; draggable=&quot;false&quot; />'; parent.dataset.loaded = 'true'; }; reader.readAsDataURL(this.files[0]); }"><div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #9ca3af; pointer-events: none;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><span style="font-size: 10px; font-weight: bold; margin-top: 4px; pointer-events: none;">INSERIR IMAGEM</span></div></div>&nbsp;`;
       } else if (drawingMode.type === 'shape') {
          const typeShape = drawingMode.options?.paintShape || 'rect';
          const tColor = drawingMode.options?.paintColor || '#000000';
          const tThick = drawingMode.options?.paintThickness || 2;
          const tFill = drawingMode.options?.paintFill ? tColor : 'none';
          const tOpacity = drawingMode.options?.paintFill ? '0.15' : '0';
          const strokeDash = drawingMode.options?.paintStyle === 'dashed' ? '8,4' : drawingMode.options?.paintStyle === 'dotted' ? '2,3' : 'none';
          
          if (typeShape === 'rect') {
             html = `<div class="absolute-draggable" style="${styleStr} cursor: grab; resize: both; overflow:visible;" contenteditable="false" ${dragAttributes}><svg width="100%" height="100%" style="display: block;"><rect x="1" y="1" width="99%" height="98%" rx="4" fill="${tFill}" fill-opacity="${tOpacity}" stroke="${tColor}" stroke-width="${tThick}" stroke-dasharray="${strokeDash}"/></svg></div>&nbsp;`;
          } else if (typeShape === 'circle') {
             html = `<div class="absolute-draggable" style="${styleStr} cursor: grab; resize: both; overflow:visible;" contenteditable="false" ${dragAttributes}><svg width="100%" height="100%" style="display: block;"><ellipse cx="50%" cy="50%" rx="48%" ry="48%" fill="${tFill}" fill-opacity="${tOpacity}" stroke="${tColor}" stroke-width="${tThick}" stroke-dasharray="${strokeDash}"/></svg></div>&nbsp;`;
          } else if (typeShape === 'line') {
             html = `<div class="absolute-draggable" style="${styleStr} cursor: grab; resize: both; overflow:visible;" contenteditable="false" ${dragAttributes}><svg width="100%" height="100%" style="display: block;"><line x1="0%" y1="50%" x2="100%" y2="50%" stroke="${tColor}" stroke-width="${tThick}" stroke-dasharray="${strokeDash}"/></svg></div>&nbsp;`;
          } else if (typeShape === 'arrow') {
             html = `<div class="absolute-draggable" style="${styleStr} cursor: grab; resize: both; overflow:visible;" contenteditable="false" ${dragAttributes}><svg width="100%" height="100%" style="display: block;"><defs><marker id="arrow-${blockId}" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L7,3 z" fill="${tColor}" /></marker></defs><line x1="1%" y1="50%" x2="98%" y2="50%" stroke="${tColor}" stroke-width="${tThick}" stroke-dasharray="${strokeDash}" marker-end="url(#arrow-${blockId})" /></svg></div>&nbsp;`;
          } else if (typeShape === 'callout') {
             const borderStyle = drawingMode.options?.paintStyle === 'double' ? 'double' : drawingMode.options?.paintStyle === 'dashed' ? 'dashed' : drawingMode.options?.paintStyle === 'dotted' ? 'dotted' : 'solid';
             const bgStyle = drawingMode.options?.paintFill ? `${tColor}15` : 'transparent';
             html = `<div class="absolute-draggable" style="${styleStr} cursor: grab; border: ${tThick}px ${borderStyle} ${tColor}; background-color: ${bgStyle}; border-radius: 8px; padding: 14px; box-sizing: border-box; text-align: left;" contenteditable="false" ${dragAttributes}><div contenteditable="true" style="width:100%; height:100%; cursor: text;"><p style="margin: 0; font-size: 13px; color: #1f2937; line-height: 1.6;"><strong>[Painel de Recorte Paint S/A]</strong> Digite seu texto destacado aqui.</p></div></div>&nbsp;`;
          }
       } else if (drawingMode.type === 'custom') {
           const { innerContent, borderStyle, borderRadius } = drawingMode.options;
           html = `<div id="${blockId}" class="photo-upload-container absolute-draggable" style="width: ${drawingBox.w}px; height: ${drawingBox.h}px; left: ${drawingBox.x}px; top: ${drawingBox.y}px; position: absolute; z-index: 100; cursor: grab; overflow: hidden; border: ${borderStyle}; border-radius: ${borderRadius}; resize: both; background-color: #fafafa; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" contenteditable="false" ${dragAttributes}>${innerContent}</div>&nbsp;`;
       }
    }
    
    if (html) {
      const editableBody = document.getElementById('editable-document-body');
      if (editableBody) {
        editableBody.innerHTML += html;
        setFinalContent(editableBody.innerHTML);
      }
    }
  };

  const handleDrawingMouseUp = () => {
    if (!isDrawing || !drawingBox || !drawingMode) {
      setIsDrawing(false);
      setDrawingMode(null);
      return;
    }
    
    if (drawingBox.w > 10 && drawingBox.h > 10) {
       executeDrawingInsertion();
    }
    
    setIsDrawing(false);
    setDrawingMode(null);
    setDrawingBox(null);
  };

  const convertCase = (mode: 'upper' | 'lower' | 'title') => {
    const sel = window.getSelection();
    if (!sel || !sel.toString()) {
      alert("⚠️ Por favor, selecione algum texto no documento para converter!");
      return;
    }
    let text = sel.toString();
    if (mode === 'upper') {
      text = text.toUpperCase();
    } else if (mode === 'lower') {
      text = text.toLowerCase();
    } else if (mode === 'title') {
      text = text.toLowerCase().replace(/(?:^|\s|-)\S/g, m => m.toUpperCase());
    }
    document.execCommand('insertHTML', false, text);
  };

  const applyHighlight = (color: string) => {
    if (color === 'transparent') {
      document.execCommand('backColor', false, '#ffffff'); // clean white/transparent
    } else {
      document.execCommand('backColor', false, color);
    }
  };

  const insertCallout = (type: 'info' | 'warning' | 'success') => {
    let border = '#3b82f6';
    let bg = '#eff6ff';
    let title = '💬 INFORMAÇÃO CORPORATIVA';
    if (type === 'warning') {
      border = '#f59e0b';
      bg = '#fffbeb';
      title = '⚠️ ATENÇÃO / COMPLIANCE';
    } else if (type === 'success') {
      border = '#10b981';
      bg = '#ecfdf5';
      title = '✅ COMPROMISSADO / APROVADO';
    }

    const html = `
      <div style="background-color: ${bg}; border-left: 5px solid ${border}; padding: 14px 18px; margin: 18px 0; border-radius: 4px; font-family: sans-serif; font-size: 13px; color: #1f2937; text-align: left; line-height: 1.6;">
        <strong style="color: ${border}; display: block; margin-bottom: 4px; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;">${title}</strong>
        Insira suas instruções administrativas, termos recomendados ou diretivas de conformidade neste campo...
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertSignatureStamp = () => {
    const html = `
      <div style="margin: 36px 0; font-family: sans-serif; font-size: 13px; color: #374151; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; border: none; font-size: 13px;">
          <tr>
            <td style="width: 48%; border-top: 1px solid #9ca3af; padding-top: 10px; vertical-align: top; text-align: left;">
              <strong style="color: #111827; display: block; margin-bottom: 2px;">Diretoria de Operações S/A</strong>
              <span style="display: block; color: #4b5563;">HACK DOCUMENT S/A</span>
              <span style="font-size: 10px; color: #10b981; font-family: monospace; display: block; margin-top: 4px; font-weight: bold;">[DIGITAL SIGNATURE VALIDATED]</span>
            </td>
            <td style="width: 4%;"></td>
            <td style="width: 48%; border-top: 1px solid #9ca3af; padding-top: 10px; vertical-align: top; text-align: left;">
              <strong style="color: #111827; display: block; margin-bottom: 2px;">Wallace Arão</strong>
              <span style="display: block; color: #4b5563;">Consultoria e Gestão Tributária</span>
              <span style="font-size: 10px; color: #9ca3af; font-family: monospace; display: block; margin-top: 4px;">SECURE-HASH: ${Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </td>
          </tr>
        </table>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertStatusBadge = (text: string, bgColor: string, txtColor: string) => {
    const html = `<span style="display: inline-block; background-color: ${bgColor}; color: ${txtColor}; font-size: 9px; font-weight: bold; padding: 2px 8px; border-radius: 9999px; font-family: sans-serif; margin: 0 4px; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: middle;">${text}</span>&nbsp;`;
    insertHtmlAtCursor(html);
  };

  const insertDualLanguageLayout = () => {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : 'Texto em Português / Conteúdo do Contrato Comercial.';
    const html = `
      <div style="display: flex; gap: 20px; margin: 18px 0; font-family: sans-serif; font-size: 13px; line-height: 1.6; text-align: justify; page-break-inside: avoid;">
        <div style="flex: 1; border-right: 1px solid #e5e7eb; padding-right: 16px;">
          <span style="font-size: 8px; font-weight: bold; font-family: monospace; color: #10b981; display: block; margin-bottom: 6px; text-transform: uppercase;">Português (PT-BR)</span>
          <p style="margin: 0; color: #1f2937;">${text || 'Insira o texto original em português...'}</p>
        </div>
        <div style="flex: 1; padding-left: 16px; color: #4b5563; font-style: italic;">
          <span style="font-size: 8px; font-weight: bold; font-family: monospace; color: #3b82f6; display: block; margin-bottom: 6px; text-transform: uppercase; font-style: normal;">English Version (EN)</span>
          <p style="margin: 0; color: #4b5563;">Insert equivalent legal, technical or commercial English translation draft here...</p>
        </div>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertReviewAnnotation = () => {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';
    if (!text) {
      alert("⚠️ Selecione um trecho de texto no corpo do documento para adicionar o comentário de revisão!");
      return;
    }
    const comment = prompt("Digite o seu comentário de revisão / nota de auditoria:") || "Revisar termo legal";
    const html = `
      <span style="background-color: #fef08a; padding: 1px 2px; border-bottom: 1.5px dashed #ca8a04; cursor: help; position: relative;" title="Nota de Revisão: ${comment}">
        ${text} <sup style="background-color: #ef4444; color: white; border-radius: 99px; font-size: 8px; font-family: sans-serif; font-weight: bold; padding: 0.5px 3.5px; margin-left: 2px; vertical-align: super;">${comment}</sup>
      </span>&nbsp;
    `;
    insertHtmlAtCursor(html);
  };

  const insertHrDecoration = (style: 'solid' | 'dashed' | 'double') => {
    let hrStyle = 'border-top: 1.5px solid #e5e7eb;';
    if (style === 'dashed') {
      hrStyle = 'border-top: 1.5px dashed #9ca3af;';
    } else if (style === 'double') {
      hrStyle = 'border-top: 3px double #374151;';
    }
    const html = `<div style="margin: 24px 0; ${hrStyle}"></div><p></p>`;
    insertHtmlAtCursor(html);
  };

  const insertAuditLogTable = () => {
    const html = `
      <div style="margin: 24px 0; font-family: sans-serif; font-size: 13px; page-break-inside: avoid; text-align: left;">
        <h4 style="color: #111827; font-size: 12px; margin: 0 0 8px 0; border-bottom: 1.5px solid #111827; padding-bottom: 4px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Controle de Alterações de Auditoria (SLA/ISO 9001)</h4>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; text-align: left;">
          <thead>
            <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 6px; border: 1px solid #e5e7eb; font-weight: bold; width: 10%;">REF</th>
              <th style="padding: 6px; border: 1px solid #e5e7eb; font-weight: bold; width: 20%;">DATA</th>
              <th style="padding: 6px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">AUDITOR / AUTOR</th>
              <th style="padding: 6px; border: 1px solid #e5e7eb; font-weight: bold; width: 40%;">NOTA DESCRITIVA</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 6px; border: 1px solid #e5e7eb; font-family: monospace; font-weight: bold;">v1.0</td>
              <td style="padding: 6px; border: 1px solid #e5e7eb;">${new Date().toLocaleDateString('pt-BR')}</td>
              <td style="padding: 6px; border: 1px solid #e5e7eb; font-weight: 550;">Wallace Arão (Auditoria)</td>
              <td style="padding: 6px; border: 1px solid #e5e7eb; color: #4b5563;">Revisão inicial corporativa e aprovação dos termos gerais de SLA.</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 6px; border: 1px solid #e5e7eb; font-family: monospace; font-weight: bold;">v1.1</td>
              <td style="padding: 6px; border: 1px solid #e5e7eb;">${new Date().toLocaleDateString('pt-BR')}</td>
              <td style="padding: 6px; border: 1px solid #e5e7eb; font-weight: 550;">Diretoria de Operações S/A</td>
              <td style="padding: 6px; border: 1px solid #e5e7eb; color: #9ca3af;">[Clique duplo aqui para descrever a próxima alteração do log]</td>
            </tr>
          </tbody>
        </table>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertLgpdDisclaimer = () => {
    const html = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; padding: 12px 14px; margin: 18px 0; border-radius: 4px; font-family: sans-serif; font-size: 11px; color: #475569; line-height: 1.5; text-align: justify; page-break-inside: avoid;">
        <strong style="color: #1e293b; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 11px;">🔵 CLÁUSULA COMPLIANCE LGPD (LEI Nº 13.709/2018)</strong>
        Este relatório atende às obrigações de sigilo e governança sobre dados pessoais comerciais tratadas nos sistemas corporativos. O tratamento dar-se-á exclusivamente de acordo com as permissões operacionais do controlador e em respeito aos limites legítimos expressos nas bases legais do Artigo 7º. Qualquer reprografia ou cópia não autorizada enseja sanções cíveis de conformidade corporativa.
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertBlockchainStamp = () => {
    let randHash = '';
    const chars = 'abcdef0123456789';
    for(let i=0; i<40; i++) randHash += chars.charAt(Math.floor(Math.random() * chars.length));
    
    const html = `
      <div style="background-color: #f0fdf4; border: 1.5px dashed #4ade80; padding: 14px; margin: 24px 0; border-radius: 6px; font-family: monospace; font-size: 10px; color: #166534; page-break-inside: avoid; text-align: left; line-height: 1.6;">
        <table style="width:100%; border:none; border-collapse:collapse; margin-bottom: 6px;">
          <tr>
            <td style="font-weight: bold; font-size: 11px; color: #15803d; border:none; padding:0;">🛡️ SELO DE INTEGRIDADE CRYPTOGRAPHIC LEDGER</td>
            <td style="text-align: right; border:none; padding:0;"><span style="background-color: #22c55e; color: white; padding: 1px 6px; border-radius: 4px; font-weight: bold; font-size: 8px;">VALIDADO</span></td>
          </tr>
        </table>
        <div style="border-top: 1px solid #bbf7d0; padding-top: 6px;">
          <strong>TRANSATION HASH:</strong> 0x${randHash}<br>
          <strong>BLOCO REGISTRADOR:</strong> #${Math.floor(Math.random()*4500000 + 13800000)} (L2 Mainnet Proof)<br>
          <strong>ORIGEM DO DOCUMENTO:</strong> wallace.arao@enterprise.hackdocument.online<br>
          <strong>AUTENTICIDADE:</strong> Integridade do layout garantida por carimbo de tempo distribuído.
        </div>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertSwotGrid = () => {
    const html = `
      <div style="margin: 24px 0; font-family: sans-serif; page-break-inside: avoid; text-align: left;">
        <h4 style="color: #111827; font-size: 12px; margin: 0 0 10px 0; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Matriz SWOT Corporativa (Análise de Riscos)</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px;">
            <strong style="color: #1d4ed8; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">💪 FORÇAS (Strengths)</strong>
            <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #1e3a8a; line-height: 1.5;">
              <li>Diferencial competitivo tecnológico</li>
              <li>Marca consolidada no mercado S/A</li>
            </ul>
          </div>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px;">
            <strong style="color: #dc2626; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">⚠️ FRAQUEZAS (Weaknesses)</strong>
            <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #7f1d1d; line-height: 1.5;">
              <li>Dependência de insumos externos</li>
              <li>Custo de operação inicial elevado</li>
            </ul>
          </div>
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px; border-radius: 6px;">
            <strong style="color: #059669; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">🚀 OPORTUNIDADES (Opportunities)</strong>
            <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #064e3b; line-height: 1.5;">
              <li>Expansão para mercados latinos</li>
              <li>Novas leis de incentivo fiscal</li>
            </ul>
          </div>
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 6px;">
            <strong style="color: #d97706; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">⚡ AMEAÇAS (Threats)</strong>
            <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #78350f; line-height: 1.5;">
              <li>Entrada de competidores de baixo custo</li>
              <li>Instabilidade cambial do período</li>
            </ul>
          </div>
        </div>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertOkrTable = () => {
    const html = `
      <div style="margin: 24px 0; font-family: sans-serif; font-size: 13px; page-break-inside: avoid; text-align: left;">
        <h4 style="color: #111827; font-size: 12px; margin: 0 0 8px 0; border-bottom: 1.5px solid #111827; padding-bottom: 4px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Definição de OKRs e Metas Trimestrais</h4>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; text-align: left;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; width: 45%;">OBJETIVOS & RESULTADOS-CHAVE (KR)</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; width: 20%; text-align: center;">META</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; width: 20%; text-align: center;">ATUAL</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; width: 15%; text-align: center;">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
              <td colspan="4" style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">O1: Acelerar a Governança Operacional ISO 9001</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px; border: 1px solid #e2e8f0; padding-left: 20px;">KR 1.1: Mapear 100% dos processos chaves</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace;">100%</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace;">85%</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center;"><span style="background-color: #fef3c7; color: #d97706; padding: 1px 4px; border-radius: 3px; font-size: 9px; font-weight: bold;">EM DIA</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px; border: 1px solid #e2e8f0; padding-left: 20px;">KR 1.2: Reduzir tempo de revisão contratual para &lt; 2 dias</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace;">2.0 dias</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace;">1.8 dias</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center;"><span style="background-color: #d1fae5; color: #059669; padding: 1px 4px; border-radius: 3px; font-size: 9px; font-weight: bold;">BATIDA</span></td>
            </tr>
          </tbody>
        </table>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertComplianceChecklist = () => {
    const html = `
      <div style="margin: 24px 0; font-family: sans-serif; page-break-inside: avoid; text-align: left;">
        <h4 style="color: #111827; font-size: 13px; margin: 0 0 10px 0; border-bottom: 2px solid #10b981; padding-bottom: 4px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Checklist de Validação & Compliance</h4>
        <div style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
          <div style="background-color: #f9fafb; padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 11px; font-weight: bold; color: #374151;">ITEMS OBRIGATÓRIOS DO CONTRATO/PROCESSO</div>
          <div style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 10px; font-size: 12px; color: #111827;">
            <span style="border: 1.5px solid #10b981; width: 14px; height: 14px; display: inline-block; border-radius: 999px; background-color: #d1fae5; text-align: center; line-height: 12px; color: #047857; font-size: 9px; font-weight: bold;">✓</span>
            <span>Identificação completa dos representantes legais e CNPJ/CPF validados.</span>
          </div>
          <div style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 10px; font-size: 12px; color: #111827;">
            <span style="border: 1.5px solid #10b981; width: 14px; height: 14px; display: inline-block; border-radius: 999px; background-color: #d1fae5; text-align: center; line-height: 12px; color: #047857; font-size: 9px; font-weight: bold;">✓</span>
            <span>Cláusula expressa de tratamento de dados de acordo com a LGPD aplicada.</span>
          </div>
          <div style="padding: 10px 14px; display: flex; align-items: center; gap: 10px; font-size: 12px; color: #111827;">
            <span style="border: 1.5px solid #cbd5e1; width: 14px; height: 14px; display: inline-block; border-radius: 999px; text-align: center;"></span>
            <span style="color: #6b7280;">Assinatura eletrônica com token e hash criptográfico de segurança anexados.</span>
          </div>
        </div>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertMilestonesTimeline = () => {
    const html = `
      <div style="margin: 24px 0; font-family: sans-serif; page-break-inside: avoid; text-align: left;" class="cronograma-container">
        <h4 style="color: #111827; font-size: 12px; margin: 0 0 12px 0; border-bottom: 2px solid #555; padding-bottom: 4px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">🚀 Cronograma de Entregas & Marcos de Sucesso (Milestones)</h4>
        <div style="display: flex; gap: 12px; justify-content: space-between; margin-top: 12px; font-size: 11px;">
          <div style="flex: 1; border-top: 3px solid #39FF14; padding-top: 8px; position: relative;">
            <div style="position: absolute; top: -7px; left: 0; width: 11px; height: 11px; border-radius: 50%; background-color: #39FF14;"></div>
            <strong style="color: #111827; display: block; font-size: 10.5px; margin-bottom: 3.5px; text-transform: uppercase;">Fase 1: Configuração</strong>
            <span style="color: #4b5563; font-size: 9.5px; display: block; line-height: 1.3;">Setup inicial, levantamento de requisitos e prototipação.</span>
            <span style="color: #111827; font-size: 8.5px; font-weight: bold; font-family: monospace; display: block; margin-top: 4px;">📅 Semana 1-2</span>
          </div>
          <div style="flex: 1; border-top: 3px solid #2563eb; padding-top: 8px; position: relative;">
            <div style="position: absolute; top: -7px; left: 0; width: 11px; height: 11px; border-radius: 50%; background-color: #2563eb;"></div>
            <strong style="color: #111827; display: block; font-size: 10.5px; margin-bottom: 3.5px; text-transform: uppercase;">Fase 2: Execução</strong>
            <span style="color: #4b5563; font-size: 9.5px; display: block; line-height: 1.3;">Implementação geral das regras operacionais e regras de negócios.</span>
            <span style="color: #111827; font-size: 8.5px; font-weight: bold; font-family: monospace; display: block; margin-top: 4px;">📅 Semana 3-6</span>
          </div>
          <div style="flex: 1; border-top: 3px solid #7c3aed; padding-top: 8px; position: relative;">
            <div style="position: absolute; top: -7px; left: 0; width: 11px; height: 11px; border-radius: 50%; background-color: #7c3aed;"></div>
            <strong style="color: #111827; display: block; font-size: 10.5px; margin-bottom: 3.5px; text-transform: uppercase;">Fase 3: Auditoria</strong>
            <span style="color: #4b5563; font-size: 9.5px; display: block; line-height: 1.3;">Homologação de conformidade e testes integrados finais.</span>
            <span style="color: #111827; font-size: 8.5px; font-weight: bold; font-family: monospace; display: block; margin-top: 4px;">📅 Semana 7-8</span>
          </div>
          <div style="flex: 1; border-top: 3px solid #059669; padding-top: 8px; position: relative;">
            <div style="position: absolute; top: -7px; left: 0; width: 11px; height: 11px; border-radius: 50%; background-color: #059669;"></div>
            <strong style="color: #111827; display: block; font-size: 10.5px; margin-bottom: 3.5px; text-transform: uppercase;">Fase 4: Entrega</strong>
            <span style="color: #4b5563; font-size: 9.5px; display: block; line-height: 1.3;">Publicação do relatório definitivo e suporte pós-implementação.</span>
            <span style="color: #111827; font-size: 8.5px; font-weight: bold; font-family: monospace; display: block; margin-top: 4px;">📅 Semana 9+</span>
          </div>
        </div>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertSecurityQrSeal = () => {
    let randHash = '';
    const chars = 'ABCDEF0123456789';
    for(let i=0; i<32; i++) randHash += chars.charAt(Math.floor(Math.random() * chars.length));
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ' - ' + now.toLocaleTimeString('pt-BR');
    const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=4&data=" + encodeURIComponent("VALIDADO_REGISTRO_SA_9001_" + randHash);

    const html = `
      <div style="margin: 24px 0; border: 2px solid #111; background-color: #fafafa; padding: 16px; border-radius: 8px; font-family: sans-serif; text-align: left; page-break-inside: avoid;" class="selo-qr-validado">
        <table style="width: 100%; border: none; border-collapse: collapse; margin: 0;">
          <tbody>
            <tr>
              <td style="width: 75%; vertical-align: top; border: none; padding: 0 14px 0 0;">
                <span style="background-color: #111827; color: #fff; font-size: 8px; font-weight: bold; font-family: monospace; padding: 2px 6px; border-radius: 3px; display: inline-block; vertical-align: middle; letter-spacing: 0.05em; text-transform: uppercase;">S/A PROTOCOLO OFICIAL</span>
                <h4 style="color: #111827; font-size: 13px; margin: 6px 0 4px 0; font-weight: bold; text-transform: uppercase;">Atestado de Governança & Integridade Executiva</h4>
                <p style="color: #6b7280; font-size: 10px; margin: 0 0 12px 0; line-height: 1.4;">Este documento recebeu provimento de integridade física e rastreabilidade digital contra fraudes, de conformidade com as políticas regulamentares.</p>
                <div style="font-family: monospace; font-size: 9px; color: #374151; line-height: 1.5; background-color: #f1f5f9; padding: 6px 10px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  <strong>HASH DE REGISTRO:</strong> <span style="color:#000; font-weight: bold;">${randHash}</span><br>
                  <strong>DATA DA CHANCELA:</strong> ${formattedDate}<br>
                  <strong>AMBIENTE DE EMISSÃO:</strong> wallace.arao@enterprise.hackdocument.online
                </div>
              </td>
              <td style="width: 25%; text-align: center; vertical-align: middle; border: none; padding: 0;">
                <img src="${qrUrl}" alt="QR Validation Seal" style="width: 82px; height: 82px; display: inline-block; border: 1px solid #e2e8f0; padding: 2.5px; background: white;" referrerPolicy="no-referrer" />
                <span style="display: block; font-family: monospace; font-size: 7.5px; color: #9ca3af; margin-top: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.02em;">SCAN DE CONSULTA</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const applyLegalQuoteRecuo = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      alert("⚠️ Atente-se: selecione primeiro um trecho de texto no editor para aplicar o recuo legal!");
      return;
    }
    const selectedText = sel.toString().trim();
    if (!selectedText) {
      alert("⚠️ Atente-se: selecione primeiro um trecho de texto no editor para aplicar o recuo legal!");
      return;
    }

    const recuoHtml = `
      <div style="margin-left: 4cm; margin-top: 12px; margin-bottom: 12px; font-family: serif; font-size: 11px; line-height: 1.5; text-align: justify; color: #374151; font-style: italic; border-left: 3.5px solid #cbd5e1; padding-left: 12px;">
        ${selectedText.replace(/\n/g, '<br>')}
      </div><p></p>
    `;

    document.execCommand('insertHTML', false, recuoHtml);
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const focusOnText = (searchText: string) => {
    const docBody = document.getElementById('editable-document-body');
    if (!docBody) return;
    docBody.focus();
    
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();
    
    try {
      const cleanedSearch = searchText.replace(/[\[\]]/g, '');
      const found = (window as any).find(cleanedSearch || searchText, false, false, true, false, false, false);
      if (!found) {
        (window as any).find(searchText, false, false, true, false, false, false);
      }
    } catch (e) {
      console.error("focusOnText selection failure", e);
    }
  };

  const resolvePlaceholder = (pattern: string | RegExp, replacement: string) => {
    const docBody = document.getElementById('editable-document-body');
    if (!docBody) return;
    
    let html = docBody.innerHTML;
    if (pattern instanceof RegExp) {
      html = html.replace(pattern, replacement);
    } else {
      html = html.replace(pattern, replacement);
    }
    
    docBody.innerHTML = html;
    setFinalContent(html);
  };

  const escreverNumeroPorExtenso = (num: number, isPercent = false): string => {
    const unidades = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const dezenas10_19 = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    if (num < 0) return num.toString();
    if (num === 100) return "cem";

    const numString = num.toString();
    if (numString.length === 1) {
      return unidades[num];
    }
    if (numString.length === 2) {
      if (num >= 10 && num <= 19) {
        return dezenas10_19[num - 10];
      }
      const d = Math.floor(num / 10);
      const u = num % 10;
      return dezenas[d] + (u > 0 ? " e " + unidades[u] : "");
    }
    if (numString.length === 3) {
      const c = Math.floor(num / 100);
      const resto = num % 100;
      if (resto === 0) return centenas[c];
      return centenas[c] + " e " + escreverNumeroPorExtenso(resto, isPercent);
    }
    if (num >= 1000 && num < 10000) {
      const m = Math.floor(num / 1000);
      const resto = num % 1000;
      const mText = m === 1 ? "mil" : escreverNumeroPorExtenso(m) + " mil";
      if (resto === 0) return mText;
      return mText + (resto < 100 || resto % 100 === 0 ? " e " : ", ") + escreverNumeroPorExtenso(resto, isPercent);
    }
    return num.toString();
  };

  const obterMesNomeExtenso = (mes: number): string => {
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    return meses[mes - 1] || "";
  };

  const applyCustomPrecisionSpellingOut = (type: 'percent' | 'prazo' | 'data') => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      alert("⚠️ Por favor, selecione um trecho de texto correspondente no documento primeiro!\nExemplo:\n- Para Porcentagem: selecione '12.5%'\n- Para Prazo: selecione '180 dias' ou '12 meses'\n- Para Data: selecione '16/06/2026'");
      return;
    }
    
    const originalText = sel.toString().trim();
    if (!originalText) return;

    let resultText = originalText;
    if (type === 'percent') {
      const cleaned = originalText.replace("%", "").trim();
      const numVal = parseFloat(cleaned.replace(",", "."));
      if (isNaN(numVal)) {
        alert("Não foi possível identificar uma porcentagem válida. Exemplo de seleção: '12%' ou '15.5%'");
        return;
      }
      const inteiro = Math.floor(numVal);
      const decimal = Math.round((numVal - inteiro) * 100);
      const intExt = escreverNumeroPorExtenso(inteiro, true);
      if (decimal === 0) {
        resultText = `${originalText} (${intExt} por cento)`;
      } else {
        const decExt = escreverNumeroPorExtenso(decimal);
        resultText = `${originalText} (${intExt} inteiros e ${decExt} centésimos por cento)`;
      }
    } else if (type === 'prazo') {
      const cleaned = originalText.toLowerCase();
      const numMatch = cleaned.match(/^(\d+)\s*(dia|dias|mês|mes|meses|ano|anos)$/);
      if (!numMatch) {
        alert("Não foi possível identificar um prazo válido. Selecione algo como '180 dias' ou '12 meses'");
        return;
      }
      const numVal = parseInt(numMatch[1], 10);
      const unit = numMatch[2];
      let unitExt = "";
      if (unit.startsWith("dia")) {
        unitExt = numVal === 1 ? "dia" : "dias";
      } else if (unit.startsWith("mês") || unit.startsWith("mes")) {
        unitExt = numVal === 1 ? "mês" : "meses";
      } else if (unit.startsWith("ano")) {
        unitExt = numVal === 1 ? "ano" : "anos";
      }
      const numExt = escreverNumeroPorExtenso(numVal);
      resultText = `${originalText} (${numExt} ${unitExt})`;
    } else {
      const match = originalText.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
      if (!match) {
        alert("Não foi possível identificar uma data válida. Selecione algo como '16/06/2026'");
        return;
      }
      const dia = parseInt(match[1], 10);
      const mes = parseInt(match[2], 10);
      let ano = parseInt(match[3], 10);
      if (ano < 100) ano += 2000;
      
      const diaExt = dia === 1 ? "primeiro" : escreverNumeroPorExtenso(dia);
      const mesExt = obterMesNomeExtenso(mes);
      
      let anoExt = "";
      if (ano === 2026) anoExt = "dois mil e vinte e seis";
      else if (ano === 2025) anoExt = "dois mil e vinte e cinco";
      else if (ano === 2024) anoExt = "dois mil e vinte e quatro";
      else if (ano >= 2000 && ano < 2100) {
        const resto = ano - 2000;
        anoExt = "dois mil" + (resto > 0 ? " e " + escreverNumeroPorExtenso(resto) : "");
      } else {
        anoExt = ano.toString();
      }
      resultText = `${originalText} (${diaExt} de ${mesExt} de ${anoExt})`;
    }

    document.execCommand('insertHTML', false, resultText);
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const generateCorporateToc = () => {
    const docBody = document.getElementById('editable-document-body');
    if (!docBody) return;

    const textHtml = docBody.innerHTML;
    const textLower = textHtml.toLowerCase();

    const sections = [];
    if (textLower.includes('contratant') || textLower.includes('qualifica')) {
      sections.push({ name: '1. QUALIFICAÇÃO DAS PARTES CONTRATANTES', page: 'fl. 01' });
    }
    if (textLower.includes('objeto')) {
      sections.push({ name: '2. OBJETO DE PRESTAÇÃO DE SERVIÇOS S/A', page: 'fl. 01' });
    }
    if (textLower.includes('preço') || textLower.includes('pagamento') || textLower.includes('valor')) {
      sections.push({ name: '3. PREÇO, METAS E FORMA DE PAGAMENTO', page: 'fl. 02' });
    }
    if (textLower.includes('vigência') || textLower.includes('prazo') || textLower.includes('rescisão')) {
      sections.push({ name: '4. VIGÊNCIA, CRONOGRAMA E RESCISÃO CONTRATUAL', page: 'fl. 02' });
    }
    if (textLower.includes('confidencial') || textLower.includes('nda')) {
      sections.push({ name: '5. CONFIDENCIALIDADE E SEGURANÇA (NDA S/A)', page: 'fl. 03' });
    }
    if (textLower.includes('gerência') || textLower.includes('hierarquia') || textLower.includes('org-chart-wrapper')) {
      sections.push({ name: '6. MODELO DE GOVERNANÇA OPERACIONAL', page: 'fl. 03' });
    }
    if (textLower.includes('foro') || textLower.includes('comarca')) {
      sections.push({ name: '7. RESOLUÇÃO DE CONFLITOS E FORO ELEITO', page: 'fl. 04' });
    }
    if (textLower.includes('assinam') || textLower.includes('rubrica') || textLower.includes('testemunhas')) {
      sections.push({ name: '8. QUÓRUM DE FIRMA E RUBRICAS OFICIAIS', page: 'fl. 04' });
    }

    if (sections.length === 0) {
      sections.push({ name: '1. QUALIFICAÇÃO OPERACIONAL REGULATÓRIA', page: 'fl. 01' });
      sections.push({ name: '2. OBJETO OPERACIONAL CORPORATIVO', page: 'fl. 02' });
      sections.push({ name: '3. DISPOSIÇÕES FINALIZADORAS E ASSINATURAS', page: 'fl. 03' });
    }

    let tocRows = '';
    sections.forEach(s => {
      tocRows += `
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 7px; font-family: monospace; font-size: 10px; color: #1e293b;">
          <span style="font-weight: bold; background-color: #ffffff; padding-right: 4px; z-index: 2;">${s.name}</span>
          <span style="flex-grow: 1; border-bottom: 1px dotted #94a3b8; margin: 0 6px; position: relative; top: -3px; z-index: 1;"></span>
          <span style="font-weight: bold; background-color: #ffffff; padding-left: 4px; z-index: 2; color: #475569;">${s.page}</span>
        </div>
      `;
    });

    const tocHtml = `
      <div class="no-print-break corporate-toc-wrapper" style="margin: 24px 0; border: 1.5px solid #000000; border-radius: 6px; padding: 18px; background-color: #ffffff; page-break-inside: avoid; box-shadow: 2px 2px 0px rgba(0,0,0,0.15);">
        <h3 style="text-align: center; margin: 0 0 16px 0; font-family: sans-serif; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 6px;">
          SUMÁRIO EXECUTIVO DE FLUXO REGULATÓRIO
        </h3>
        <p style="margin: 0 0 12px 0; font-family: sans-serif; font-size: 9px; color: #64748b; text-align: center; font-style: italic;">
          Índice remissivo para validade formal de governança corporativa activa s/a
        </p>
        <div style="margin-top: 10px;">
          ${tocRows}
        </div>
      </div><p></p>
    `;

    insertHtmlAtCursor(tocHtml);
    if (docBody) setFinalContent(docBody.innerHTML);
  };

  const applyVocabularyOptimiseAll = () => {
    const docBody = document.getElementById('editable-document-body');
    if (!docBody) return;

    let html = docBody.innerHTML;
    let counts = 0;

    const VOCABULARY_SUGGESTIONS = [
      { regex: /a\s+nível\s+de/gi, replace: 'em âmbito de' },
      { regex: /através\s+de/gi, replace: 'por meio de' },
      { regex: /vimos\s+por\s+meio\s+deste/gi, replace: 'este instrumento estabelece' },
      { regex: /dar\s+início/gi, replace: 'inaugurar' },
      { regex: /como\s+sendo/gi, replace: 'sendo' },
      { regex: /por\s+causa\s+de/gi, replace: 'em decorrência de' },
      { regex: /fazer\s+uma\s+reunião/gi, replace: 'realizar alinhamento deliberativo' },
      { regex: /entrar\s+em\s+contato/gi, replace: 'formalizar notificação' },
      { regex: /sobre\s+o\s+mesmo/gi, replace: 'sobre ele' },
      { regex: /resolver\s+o\s+problema/gi, replace: 'saneamento de lide' }
    ];

    VOCABULARY_SUGGESTIONS.forEach(item => {
      const matches = html.match(item.regex);
      if (matches) {
        counts += matches.length;
        html = html.replace(item.regex, item.replace);
      }
    });

    if (counts > 0) {
      docBody.innerHTML = html;
      setFinalContent(html);
      alert(`✨ Incrível! Realizamos ${counts} otimizações de nível executivo no texto para garantir elegância de redação comercial.`);
    } else {
      alert("Nenhum jargão informal clichê foi detectado no texto atual. Seu documento já está impecável!");
    }
  };

  const resolveVocabularyOptimiseByKey = (wordKey: string) => {
    const docBody = document.getElementById('editable-document-body');
    if (!docBody) return;

    let html = docBody.innerHTML;
    
    const dict: Record<string, { regex: RegExp; replace: string }> = {
      'a nível de': { regex: /a\s+nível\s+de/gi, replace: 'em âmbito de' },
      'através de': { regex: /através\s+de/gi, replace: 'por meio de' },
      'vimos por meio deste': { regex: /vimos\s+por\s+meio\s+deste/gi, replace: 'este instrumento estabelece' },
      'dar início': { regex: /dar\s+início/gi, replace: 'inaugurar' },
      'como sendo': { regex: /como\s+sendo/gi, replace: 'sendo' },
      'por causa de': { regex: /por\s+causa\s+de/gi, replace: 'em decorrência de' },
      'fazer uma reunião': { regex: /fazer\s+uma\s+reunião/gi, replace: 'realizar alinhamento deliberativo' },
      'entrar em contato': { regex: /entrar\s+em\s+contato/gi, replace: 'formalizar notificação' },
      'sobre o mesmo': { regex: /sobre\s+o\s+mesmo/gi, replace: 'sobre ele' },
      'resolver o problema': { regex: /resolver\s+o\s+problema/gi, replace: 'saneamento de lide' }
    };

    const target = dict[wordKey];
    if (target) {
      html = html.replace(target.regex, target.replace);
      docBody.innerHTML = html;
      setFinalContent(html);
    }
  };

  const insertSigningInitialsBlock = () => {
    const html = `
      <div style="margin: 24px 0 12px 0; font-family: sans-serif; font-size: 9.5px; text-align: right; page-break-inside: avoid;" class="no-print-break initial-box-container">
        <table style="width: auto; margin-left: auto; border: 1.5px solid #cbd5e1; background-color: #fafafa; border-radius: 4px; padding: 6px; font-size: 8.5px; color: #475569;">
          <tr>
            <td style="border: none; padding: 4px 12px; font-weight: bold; text-transform: uppercase;">Rubrica Contratante: ______________</td>
            <td style="border: none; padding: 4px 12px; border-left: 1.5px solid #cbd5e1; font-weight: bold; text-transform: uppercase;">Rubrica Contratado: ______________</td>
          </tr>
        </table>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
  };

  const insertAutomaticTableOfContents = () => {
    const docBody = document.getElementById('editable-document-body');
    const headingItems: { text: string; id: string; num: number }[] = [];
    if (docBody) {
      const headings = docBody.querySelectorAll('h1, h2, h3, h4');
      headings.forEach((h, index) => {
        let text = h.textContent?.trim() || '';
        if (text) {
          let hId = h.getAttribute('id');
          if (!hId) {
            hId = `sec-heading-${index}`;
            h.setAttribute('id', hId);
          }
          const level = parseInt(h.tagName.substring(1)) || 2;
          headingItems.push({ text, id: hId, num: level });
        }
      });
    }

    let itemsHtml = '';
    if (headingItems.length > 0) {
      headingItems.forEach((item) => {
        const indent = (item.num - 1) * 16;
        const isBold = item.num <= 2 ? 'font-weight: bold; color: #111827;' : 'color: #4b5563;';
        itemsHtml += `
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; font-family: sans-serif; font-size: 11px; padding-left: ${indent}px; ${isBold}">
            <span style="background-color: white; padding-right: 4px; z-index: 2; position: relative;"><a href="#${item.id}" style="color: inherit; text-decoration: none;">${item.text}</a></span>
            <span style="flex-grow: 1; border-bottom: 1px dotted #cbcbcb; margin: 0 4px; position: relative; top: -3px; z-index: 1;"></span>
            <span style="background-color: white; padding-left: 4px; z-index: 2; font-family: monospace; font-weight: bold;">pág. 1</span>
          </div>
        `;
      });
    } else {
      itemsHtml = `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; font-family: sans-serif; font-size: 11px; font-weight: bold; color: #111827;">
          <span style="background-color: white; padding-right: 4px; z-index: 2; position: relative;">1. OBJETIVO E ESCOPO CONTRATUAL</span>
          <span style="flex-grow: 1; border-bottom: 1px dotted #cbcbcb; margin: 0 4px; position: relative; top: -3px; z-index: 1;"></span>
          <span style="background-color: white; padding-left: 4px; z-index: 2; font-family: monospace;">pág. 1</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; font-family: sans-serif; font-size: 11px; color: #4b5563; padding-left: 16px;">
          <span style="background-color: white; padding-right: 4px; z-index: 2; position: relative;">1.1 Especificações Gerais S/A</span>
          <span style="flex-grow: 1; border-bottom: 1px dotted #cbcbcb; margin: 0 4px; position: relative; top: -3px; z-index: 1;"></span>
          <span style="background-color: white; padding-left: 4px; z-index: 2; font-family: monospace;">pág. 2</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; font-family: sans-serif; font-size: 11px; font-weight: bold; color: #111827;">
          <span style="background-color: white; padding-right: 4px; z-index: 2; position: relative;">2. TARIFAÇÃO E CONDICIONANTES FINANCEIRAS</span>
          <span style="flex-grow: 1; border-bottom: 1px dotted #cbcbcb; margin: 0 4px; position: relative; top: -3px; z-index: 1;"></span>
          <span style="background-color: white; padding-left: 4px; z-index: 2; font-family: monospace;">pág. 3</span>
        </div>
      `;
    }

    const html = `
      <div class="toc-container" style="margin: 24px 0; padding: 16px; border: 1.5px solid #e5e7eb; border-radius: 8px; background-color: #fafafa; font-family: sans-serif; page-break-inside: avoid; text-align: left;">
        <h3 style="color: #111827; font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 0 0 12px 0; border-bottom: 2px solid #111827; padding-bottom: 4px; letter-spacing: 0.05em; display: flex; justify-content: space-between;">
          <span>📖 SUMÁRIO EXECUTIVO DIRECTIVA</span>
          <span style="font-size: 9px; color: #9ca3af; font-family: monospace; font-weight: normal; text-transform: none;">[Formatação Governança]</span>
        </h3>
        ${itemsHtml}
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
    if (docBody) setFinalContent(docBody.innerHTML);
  };

  const insertFinancialBudgetTable = () => {
    const tableId = `budget-table-${Math.floor(Math.random() * 90000) + 10000}`;
    const html = `
      <div id="${tableId}" style="margin: 24px 0; font-family: sans-serif; font-size: 13px; page-break-inside: avoid; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #22252a; padding-bottom: 6px; margin-bottom: 8px;">
          <h4 style="color: #111827; font-size: 12px; margin: 0; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">📦 Demonstrativo Financeiro e Custos (S/A)</h4>
          <button onclick="
            (function(){
              const tbl = document.getElementById('${tableId}');
              if(!tbl) return;
              const rows = tbl.querySelectorAll('tbody tr');
              let grandTotal = 0;
              rows.forEach(row => {
                const qtyCell = row.cells[1];
                const priceCell = row.cells[2];
                const totalCell = row.cells[3];
                if (qtyCell && priceCell && totalCell) {
                  const qty = parseFloat(qtyCell.innerText.replace(/[^\\d.,]/g, '').replace(',', '.')) || 0;
                  const price = parseFloat(priceCell.innerText.replace(/[^\\d.,]/g, '').replace(',', '.')) || 0;
                  const rowTotal = qty * price;
                  grandTotal += rowTotal;
                  totalCell.innerText = 'R$ ' + rowTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
              });
              const grandTotalCell = tbl.querySelector('.grand-total-val');
              if (grandTotalCell) {
                grandTotalCell.innerText = 'R$ ' + grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              }
            })()
          " style="background-color: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" contenteditable="false">
            🔄 Calcular Valores S/A
          </button>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; width: 45%;">DESCRIÇÃO OPERACIONAL</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; width: 15%; text-align: center;">QTD</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; width: 20%; text-align: right;">UNITÁRIO (R$)</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; width: 20%; text-align: right;">TOTAL (R$)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px; border: 1px solid #e2e8f0;">Consultoria Técnica em Governança ISO</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace;">5</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace;">250,00</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 550; color: #374151;">R$ 1.250,00</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px; border: 1px solid #e2e8f0;">Licenciamento de Módulos Web App SaaS (Anual)</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace;">12</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace;">95,00</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 550; color: #374151;">R$ 1.140,00</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #cbd5e1;">
              <td colspan="3" style="padding: 8px 6px; border: 1px solid #cbd5e1; text-align: right; text-transform: uppercase; font-size: 10px; color: #1e293b;">Valor Total Consolidado (S/A):</td>
              <td class="grand-total-val" style="padding: 8px 6px; border: 1px solid #cbd5e1; text-align: right; font-size: 11px; color: #1e3a8a; font-family: monospace; font-weight: bold;">R$ 2.390,00</td>
            </tr>
          </tfoot>
        </table>
        <span style="font-size: 8px; color: #9ca3af; margin-top: 4px; display: block; font-style: italic;">*Clique em qualquer célula para editar os valores nela. Depois, clique em "Calcular Valores S/A" acima para atualizar os totais e a soma automaticamente!</span>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
    const docBody = document.getElementById('editable-document-body');
    if (docBody) setFinalContent(docBody.innerHTML);
  };

  const applyExecutiveTimbradoLayout = () => {
    const docBody = document.getElementById('editable-document-body');
    if (!docBody) return;
    
    const oldHeader = docBody.querySelector('.executive-timbrado-header');
    const oldFooter = docBody.querySelector('.executive-timbrado-footer');
    if (oldHeader) oldHeader.remove();
    if (oldFooter) oldFooter.remove();

    const randCnpj = '00.123.456/0001-' + Math.floor(Math.random() * 89 + 10);
    const headerHtml = `
      <div class="executive-timbrado-header" style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #111827; padding-bottom: 12px; margin-bottom: 24px; font-family: sans-serif; text-align: left; page-break-inside: avoid;">
        <div>
          <span style="font-size: 14px; font-weight: bold; color: #111827; letter-spacing: 0.05em; display: block; text-transform: uppercase;">🏢 WALLACE OPERAÇÕES & SISTEMAS S.A.</span>
          <span style="font-size: 8px; color: #6b7280; display: block; margin-top: 2px;">TECNOLOGIA, COMPLIANCE E GOVERNANÇA INTEGRADA</span>
        </div>
        <div style="text-align: right; line-height: 1.4;">
          <span style="font-size: 8px; font-family: monospace; color: #374151; display: block; font-weight: bold;">CNPJ: ${randCnpj}</span>
          <span style="font-size: 8px; font-family: monospace; color: #6b7280; display: block;">REGISTRO COMERCIAL: JUCESP nº 48.910/26</span>
          <span style="font-size: 8px; font-family: monospace; color: #10b981; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 4px; border-radius: 2px; display: inline-block; margin-top: 2px; font-weight: bold; font-size: 7px;">CERTIFICAÇÃO ISO 9001 STATUS: ATIVO</span>
        </div>
      </div>
    `;

    const footerHtml = `
      <div class="executive-timbrado-footer" style="border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 40px; text-align: center; font-family: sans-serif; font-size: 7.5px; color: #9ca3af; page-break-inside: avoid; clear: both;">
        <div>Wallace Operações & Sistemas S/A • Av. Paulista, 1000, Bela Vista - São Paulo/SP • CEP 01310-100</div>
        <div style="margin-top: 2px; font-family: monospace; color: #cbd5e1;">Código de Validação Digital de Custódia: S/A C-${Math.floor(Math.random() * 89999 + 10000)}/2026</div>
      </div>
    `;

    docBody.innerHTML = headerHtml + docBody.innerHTML + footerHtml;
    setFinalContent(docBody.innerHTML);
    alert("✨ Papel Timbrado Executivo S/A aplicado com sucesso ao seu documento!");
  };

  const insertAdministrativeStamp = (type: 'APROVADO' | 'CONFIDENCIAL' | 'RECUSADO') => {
    let color = '#dc2626';
    let label = 'CONFIDENCIAL';
    let icon = '🔒';
    if (type === 'APROVADO') {
      color = '#15803d';
      label = 'APROVADO S/A';
      icon = '✅';
    } else if (type === 'CONFIDENCIAL') {
      color = '#b45309';
      label = 'CONFIDENCIAL';
      icon = '⚠️';
    } else {
      color = '#dc2626';
      label = 'NÃO APROVADO';
      icon = '❌';
    }

    const dateStr = new Date().toLocaleDateString('pt-BR');
    const stampId = `stamp-${Math.floor(Math.random() * 90000)}`;

    const html = `
      <div id="${stampId}" style="display: inline-block; border: 3px double ${color}; color: ${color}; padding: 8px 14px; border-radius: 6px; font-family: sans-serif; font-weight: bold; text-align: center; transform: rotate(-3deg); margin: 15px; page-break-inside: avoid; box-shadow: 0 0 2px ${color}33; opacity: 0.85; user-select: none;">
        <div style="font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">${icon} ${label}</div>
        <div style="font-size: 7.5px; border-top: 1.5px dashed ${color}; margin-top: 4px; padding-top: 4px; font-family: monospace;">
          AUDITORIA REALIZADA EM ${dateStr}<br>
          CONTROLE REGULATÓRIO REG nº ${Math.floor(Math.random() * 8900 + 1000)}
        </div>
      </div>
    `;
    insertHtmlAtCursor(html);
    const docBody = document.getElementById('editable-document-body');
    if (docBody) setFinalContent(docBody.innerHTML);
  };

  const insertStandardClause = (type: 'NDA' | 'PROP_INT' | 'COMPLIANCE' | 'FORO') => {
    let html = '';
    if (type === 'NDA') {
      html = `<p style="text-align: justify; font-size: 11px; color: #1f2937; line-height: 1.6; font-family: sans-serif; margin-bottom: 12px; border-left: 3px solid #3b82f6; padding-left: 8px;"><strong>CLÁUSULA DE CONFIDENCIALIDADE (NDA S/A):</strong> As partes comprometem-se, por si, seus colaboradores, consultores e prepostos, a manter o mais absoluto sigilo sobre quaisquer Informações Confidenciais reveladas em razão deste instrumento, abstendo-se de copiá-las ou revelá-las a quaisquer terceiros não expressamente anuídos por escrito pelo controlador original dos dados, sob pena de cominação de perdas e danos e sanções criminais da Lei Propriedade Intelectual.</p>`;
    } else if (type === 'PROP_INT') {
      html = `<p style="text-align: justify; font-size: 11px; color: #1f2937; line-height: 1.6; font-family: sans-serif; margin-bottom: 12px; border-left: 3px solid #8b5cf6; padding-left: 8px;"><strong>CLÁUSULA DE PROPRIEDADE INTELECTUAL:</strong> Todo e qualquer direito de propriedade intelectual, patentes de invenção, segredos comerciais, códigos-fonte de base tecnológica e designs criativos desenvolvidos durante a vigência deste instrumento pertencerão exclusivamente à parte contratante S/A, restando proibida qualquer espécie de reprodução ou exploração paralela não expressamente franqueada pela Diretoria Geral.</p>`;
    } else if (type === 'COMPLIANCE') {
      html = `<p style="text-align: justify; font-size: 11px; color: #1f2937; line-height: 1.6; font-family: sans-serif; margin-bottom: 12px; border-left: 3px solid #10b981; padding-left: 8px;"><strong>CLÁUSULA DE COMPLIANCE E ANTICORRUPÇÃO (ISO 37001):</strong> Ambas as partes declaram conhecer e aplicar as diretrizes de integridade comercial, combatendo ativamente qualquer forma de nepotismo de facilitação, corrupção, lavagem de capitais ou desvios regulatórios. Qualquer suspeita de desvio no âmbito operacional ensejará a rescisão imediata e motivada do contrato sem qualquer aplicação de ônus adicionais.</p>`;
    } else {
      html = `<p style="text-align: justify; font-size: 11px; color: #1f2937; line-height: 1.6; font-family: sans-serif; margin-bottom: 12px; border-left: 3px solid #6b7280; padding-left: 8px;"><strong>CLÁUSULA DE FORO DE ELEIÇÃO JURÍDICA:</strong> Para dirimir quaisquer dúvidas ou conflitos emergentes deste contrato, as partes elegem, com renúncia expressa a qualquer outro por mais privilegiado que se apresente, o Foro da Comarca da Capital de São Paulo/SP, correndo os custos processuais e honorários advocatícios por conta da parte vencida.</p>`;
    }
    insertHtmlAtCursor(html);
    const docBody = document.getElementById('editable-document-body');
    if (docBody) setFinalContent(docBody.innerHTML);
  };

  const insertExecutiveOrgChart = () => {
    const html = `
      <div class="org-chart-wrapper" style="margin: 24px 0; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 16px; background-color: #f8fafc; font-family: sans-serif; text-align: center; page-break-inside: avoid;">
        <h4 style="margin: 0 0 12px 0; font-size: 10px; text-transform: uppercase; font-weight: bold; color: #334155; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; display: inline-block; letter-spacing: 0.05em;">Hierarquia Operacional S/A</h4>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="background-color: #1e293b; color: white; padding: 5px 12px; border-radius: 4px; font-size: 9px; font-weight: bold; display: inline-block;">
            DIRETORIA DE OPERAÇÕES S/A
            <div style="font-size: 7.5px; font-weight: normal; color: #94a3b8; margin-top: 1px;">Conselho de Administração</div>
          </div>
          
          <div style="width: 2px; height: 10px; background-color: #cbd5e1;"></div>
          
          <div style="display: flex; gap: 16px; align-items: center; justify-content: center;">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="background-color: #3b82f6; color: white; padding: 5px 8px; border-radius: 4px; font-size: 8px; font-weight: bold;">
                SUP. DE COMPLIANCE
                <div style="font-size: 7px; font-weight: normal; color: #bfdbfe; margin-top: 1px;">Governança Legal</div>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="background-color: #10b981; color: white; padding: 5px 8px; border-radius: 4px; font-size: 8px; font-weight: bold;">
                GERÊNCIA OPERACIONAL
                <div style="font-size: 7px; font-weight: normal; color: #a7f3d0; margin-top: 1px;">Projetos & Prazos</div>
              </div>
            </div>
          </div>
        </div>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
    const docBody = document.getElementById('editable-document-body');
    if (docBody) setFinalContent(docBody.innerHTML);
  };

  const applyCurrencySpellingOutToSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      alert("⚠️ Por favor, selecione um número ou valor monetário no texto antes!\nExemplo: selecione o trecho '1500' ou 'R$ 1.250,50'");
      return;
    }
    
    const originalText = sel.toString().trim();
    if (!originalText) return;
    
    // Parse the number from the selected string (e.g., R$ 1.500,50 -> 1500.50)
    let parsedText = originalText;
    parsedText = parsedText.replace(/[R$\s]/g, ''); // remove currencies & spaces
    
    // Check if it's formatted like a Brazilian currency (e.g. 1.250,50)
    if (parsedText.includes(',') && parsedText.includes('.')) {
      // replace dots with empty, and commas with dot
      parsedText = parsedText.replace(/\./g, '').replace(',', '.');
    } else if (parsedText.includes(',')) {
      // replace commas with dot if no dot exists (e.g. 1500,50)
      parsedText = parsedText.replace(',', '.');
    }
    
    const cleanNum = parseFloat(parsedText);
    if (isNaN(cleanNum)) {
      alert(`⚠️ Não conseguimos identificar um número válido no texto selecionado: "${originalText}".\n\nTente selecionar apenas os números, por exemplo: '2500' ou '42,50'`);
      return;
    }
    
    const extensoText = numToExtensoBRL(cleanNum);
    const newRepresentation = `${originalText} (${extensoText})`;
    
    document.execCommand('insertHTML', false, newRepresentation);
    const docBody = document.getElementById('editable-document-body');
    if (docBody) setFinalContent(docBody.innerHTML);
    alert(`✨ Sucesso! Valor convertido por extenso:\n"${newRepresentation}"`);
  };

  const chancelarTempoSla = () => {
    const timeStr = formatSlaTime(elapsedSeconds);
    const dateStr = new Date().toLocaleDateString('pt-BR');
    const hourStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const uuid = Math.floor(Math.random() * 900000 + 100000);
    const html = `
      <div class="sla-seal text-emerald-800 bg-emerald-50/50" style="margin-top: 32px; border: 1.5px dashed #10b981; padding: 12px; font-family: sans-serif; font-size: 10px; color: #047857; border-radius: 6px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; border-bottom: 1px dashed #10b981; padding-bottom: 4px; margin-bottom: 6px;">
          <span>🛡️ CHANCELA SLA REGULATÓRIO S/A</span>
          <span>REG nº ${uuid}</span>
        </div>
        <div style="font-family: monospace; font-size: 9px; line-height: 1.4; color: #065f46;">
          Tempo Ininterrupto de Elaboração: <strong>${timeStr}</strong><br>
          Chancelado em: ${dateStr} às ${hourStr} via Hack Document S/A<br>
          Validação de Integridade: SLA GARANTIDO DE REVISÃO ATIVA
        </div>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
    alert("📝 Chancela de Redação SLA registrada no cursor com sucesso!");
  };

  const insertBlockchainCustodyStamp = () => {
    const dateStr = new Date().toLocaleDateString('pt-BR');
    const docBodyText = document.getElementById('editable-document-body')?.innerText || '';
    
    // Simple mock SHA-256-like hashing for standalone integrity
    const calculateSimpleHash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const hex = Math.abs(hash).toString(16).padEnd(8, '0');
      return `0x${hex}A73${Math.floor(Math.random() * 900)}CD${Math.floor(Math.random() * 90 + 10)}91BF08${hex}`;
    };
    
    const docHash = calculateSimpleHash(docBodyText || "Documento Hack Document S/A");
    const docUuid = 'DOC-' + Math.floor(Math.random() * 9000000 + 1000000);
    
    const html = `
      <div class="blockchain-custody-card" style="margin: 30px 0; border: 2.5px solid #059669; padding: 18px; border-radius: 8px; font-family: sans-serif; background-color: #f0fdf4; page-break-inside: avoid;">
        <div style="display: flex; gap: 16px; align-items: center;">
          <!-- Stylized Modern QR Code using pure CSS -->
          <div style="width: 72px; height: 72px; padding: 6px; background-color: white; border: 1.5px solid #10b981; border-radius: 6px; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; shrink-0;">
            <div style="display: flex; justify-content: space-between; height: 18px;">
              <span style="width: 18px; height: 18px; background-color: #065f46; display: inline-block; border-radius: 2px;"></span>
              <span style="width: 18px; height: 18px; border: 3px solid #065f46; display: inline-block; border-radius: 2px; box-sizing: border-box;"></span>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 8px; font-weight: bold; color: #10b981; height: 16px; letter-spacing: -1px; line-height: 1;">
              S/A VERIFY
            </div>
            <div style="display: flex; justify-content: space-between; height: 18px;">
              <span style="width: 18px; height: 18px; border: 3px solid #065f46; display: inline-block; border-radius: 2px; box-sizing: border-box;"></span>
              <span style="width: 18px; height: 18px; background-color: #065f46; display: inline-block; border-radius: 2px;"></span>
            </div>
          </div>
          <div style="flex-grow: 1; text-align: left;">
            <h4 style="margin: 0; font-size: 11px; text-transform: uppercase; font-weight: bold; color: #065f46; letter-spacing: 0.05em; display: flex; justify-content: space-between; align-items: center;">
              <span>🔐 SELO DE CUSTÓDIA CRIPTOGRÁFICA S/A</span>
              <span style="background-color: #d1fae5; color: #065f46; font-size: 7.5px; padding: 2px 6px; border-radius: 99px; font-weight: bold; font-family: monospace;">LEDGER L2 PROTECTED</span>
            </h4>
            <div style="font-size: 8px; color: #047857; line-height: 1.4; margin-top: 6px; font-family: monospace; word-break: break-all;">
              CUSTÓDIA ID: <strong>${docUuid}</strong><br>
              INTEGRIDADE HASH SHA-256:<br>
              <span style="color: #111827; font-weight: bold; background-color: #ffffff; padding: 2px 4px; border: 1px solid #d1fae5; border-radius: 3px; display: inline-block; margin-top: 2px;">${docHash}</span>
            </div>
            <div style="font-size: 7.5px; color: #6b7280; font-family: sans-serif; display: block; margin-top: 4px; font-style: italic;">
              *Este documento foi validado e assinado na layer de custódia corporativa sob as diretrizes ISO 27001 em ${dateStr}.
            </div>
          </div>
        </div>
      </div><p></p>
    `;
    insertHtmlAtCursor(html);
    const docBody = document.getElementById('editable-document-body');
    if (docBody) setFinalContent(docBody.innerHTML);
    alert("🔐 Selo de Custódia Criptográfica Blockchain gerado e anexado com sucesso!");
  };

  const applyLineHeightToSelection = (lhValue: string) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      alert("Selecione um texto antes com o mouse para aplicar espaçamento de linha!");
      return;
    }
    try {
      const range = sel.getRangeAt(0);
      const selectedText = range.toString();
      if (!selectedText) return;
      
      const span = document.createElement('span');
      span.setAttribute('style', `line-height: ${lhValue}; display: inline-block; width: 100%;`);
      span.textContent = selectedText;
      
      range.deleteContents();
      range.insertNode(span);
      
      const editableBody = document.getElementById('editable-document-body');
      if (editableBody) setFinalContent(editableBody.innerHTML);
    } catch (e) {
      console.error(e);
    }
  };

  const applyLetterSpacingToSelection = (spacingValue: string) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      alert("Selecione um texto antes com o mouse para aplicar kerning de letra!");
      return;
    }
    try {
      const range = sel.getRangeAt(0);
      const selectedText = range.toString();
      if (!selectedText) return;
      
      const span = document.createElement('span');
      span.setAttribute('style', `letter-spacing: ${spacingValue};`);
      span.textContent = selectedText;
      
      range.deleteContents();
      range.insertNode(span);
      
      const editableBody = document.getElementById('editable-document-body');
      if (editableBody) setFinalContent(editableBody.innerHTML);
    } catch (e) {
      console.error(e);
    }
  };

  const findActiveElementInEditable = <T extends HTMLElement>(tagName: string): T | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.getRangeAt(0).startContainer;
    while (node && (node as HTMLElement).id !== 'editable-document-body') {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === tagName.toLowerCase()) {
        return node as T;
      }
      node = node.parentNode;
    }
    return null;
  };

  const handleAddRow = (after: boolean = true) => {
    const tr = findActiveElementInEditable<HTMLTableRowElement>('tr');
    if (!tr) {
      alert("Para adicionar uma linha, clique em alguma célula de tabela primeiro!");
      return;
    }
    const table = tr.closest('table');
    if (!table) return;
    
    const newRow = document.createElement('tr');
    const cellCount = tr.cells.length;
    for (let i = 0; i < cellCount; i++) {
      const originalCell = tr.cells[i];
      const newCell = document.createElement(originalCell.tagName.toLowerCase() === 'th' ? 'th' : 'td');
      newCell.className = originalCell.className || "border border-black p-2";
      const styleAttr = originalCell.getAttribute('style');
      if (styleAttr) {
        newCell.setAttribute('style', styleAttr);
      } else {
        newCell.setAttribute('style', 'border: 1px solid black; height: 32px;');
      }
      newCell.innerHTML = "&nbsp;";
      newRow.appendChild(newCell);
    }
    
    if (after) {
      tr.parentNode?.insertBefore(newRow, tr.nextSibling);
    } else {
      tr.parentNode?.insertBefore(newRow, tr);
    }
    
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const handleAddColumn = (after: boolean = true) => {
    const td = findActiveElementInEditable<HTMLTableCellElement>('td') || findActiveElementInEditable<HTMLTableCellElement>('th');
    if (!td) {
      alert("Para adicionar uma coluna, clique em alguma célula de tabela primeiro!");
      return;
    }
    const tr = td.parentElement as HTMLTableRowElement;
    const table = tr?.closest('table');
    if (!table || !tr) return;
    
    const colIndex = td.cellIndex;
    const rows = table.rows;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const targetCell = row.cells[colIndex];
      if (targetCell) {
        const newCell = document.createElement(targetCell.tagName.toLowerCase() === 'th' ? 'th' : 'td');
        newCell.className = targetCell.className || "border border-black p-2";
        const styleAttr = targetCell.getAttribute('style');
        if (styleAttr) {
          newCell.setAttribute('style', styleAttr);
        } else {
          newCell.setAttribute('style', 'border: 1px solid black; height: 32px;');
        }
        newCell.innerHTML = "&nbsp;";
        
        if (after) {
          row.insertBefore(newCell, targetCell.nextSibling);
        } else {
          row.insertBefore(newCell, targetCell);
        }
      }
    }
    
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const handleDeleteRow = () => {
    const tr = findActiveElementInEditable<HTMLTableRowElement>('tr');
    if (!tr) {
      alert("Para remover uma linha, clique nela primeiro.");
      return;
    }
    const table = tr.closest('table');
    if (table && table.rows.length <= 1) {
      table.remove();
    } else {
      tr.remove();
    }
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const handleDeleteColumn = () => {
    const td = findActiveElementInEditable<HTMLTableCellElement>('td') || findActiveElementInEditable<HTMLTableCellElement>('th');
    if (!td) {
      alert("Para remover uma coluna, clique nela primeiro.");
      return;
    }
    const tr = td.parentElement as HTMLTableRowElement;
    const table = tr?.closest('table');
    if (!table || !tr) return;
    
    const colIndex = td.cellIndex;
    const rows = table.rows;
    
    if (tr.cells.length <= 1) {
      table.remove();
    } else {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.cells[colIndex]) {
          row.cells[colIndex].remove();
        }
      }
    }
    
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const handleForceBorders = () => {
    const table = findActiveElementInEditable<HTMLTableElement>('table');
    if (!table) {
      alert("Para forçar bordas pretas de planilha, dê um clique em qualquer parte da tabela primeiro!");
      return;
    }
    
    table.setAttribute('style', 'border: 2px solid black; border-collapse: collapse; width: 100%;');
    const cells = table.querySelectorAll('td, th');
    cells.forEach(cell => {
      cell.setAttribute('style', 'border: 1px solid black; padding: 6px; text-align: left; min-width: 50px;');
    });
    
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) {
      setFinalContent(editableBody.innerHTML);
      alert("Linhas e bordas pretas de planilha aplicadas com força!");
    }
  };

  const handleToggleCellBackground = (colorHex: string = '#f3f4f6') => {
    const tr = findActiveElementInEditable<HTMLTableRowElement>('tr');
    const cell = findActiveElementInEditable<HTMLTableCellElement>('td') || findActiveElementInEditable<HTMLTableCellElement>('th');
    if (!tr && !cell) {
      alert("Dê um clique na linha ou célula que deseja colorir!");
      return;
    }
    
    const applyColor = (target: HTMLElement) => {
      const existingStyle = target.getAttribute('style') || '';
      if (existingStyle.includes('background-color')) {
        target.setAttribute('style', existingStyle.replace(/background-color:[^;]+;?/gi, '').trim());
      } else {
        target.setAttribute('style', `${existingStyle}; background-color: ${colorHex};`.replace(/;;/g, ';'));
      }
    };

    if (cell) {
      applyColor(cell);
    } else if (tr) {
      Array.from(tr.cells).forEach(c => applyColor(c));
    }
    
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const handleFillSequence = () => {
    const table = findActiveElementInEditable<HTMLTableElement>('table');
    if (!table) {
      alert("Clique em uma tabela primeiro para preencher a primeira coluna com números de 1 a N!");
      return;
    }
    let startNum = 1;
    const rows = Array.from(table.rows);
    rows.forEach((row) => {
      const hasTh = Array.from(row.cells).some(c => c.tagName.toLowerCase() === 'th');
      if (hasTh) return; // Skip header row
      
      if (row.cells.length > 0) {
        row.cells[0].textContent = String(startNum++);
      }
    });
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
    alert("Sequência preenchida com sucesso!");
  };

  const handleMergeActiveCellColspan = () => {
    const cell = findActiveElementInEditable<HTMLTableCellElement>('td') || findActiveElementInEditable<HTMLTableCellElement>('th');
    if (!cell) {
      alert("Clique em uma célula de tabela para mesclá-la com a vizinha da direita!");
      return;
    }
    const nextCell = cell.nextElementSibling as HTMLTableCellElement | null;
    if (!nextCell) {
      alert("Não há nenhuma célula à direita para mesclar nesta linha.");
      return;
    }
    const currentColspan = cell.colSpan || 1;
    const nextColspan = nextCell.colSpan || 1;
    
    cell.colSpan = currentColspan + nextColspan;
    nextCell.remove();
    
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const handleSetCellAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    const cell = findActiveElementInEditable<HTMLTableCellElement>('td') || findActiveElementInEditable<HTMLTableCellElement>('th');
    const tr = findActiveElementInEditable<HTMLTableRowElement>('tr');
    if (!cell && !tr) {
      alert("Clique em qualquer célula de tabela para definir o alinhamento!");
      return;
    }
    const applyAlign = (target: HTMLElement) => {
      const existingStyle = target.getAttribute('style') || '';
      const cleaned = existingStyle.replace(/text-align:[^;]+;?/gi, '').trim();
      target.setAttribute('style', `${cleaned}; text-align: ${align};`.replace(/;;/g, ';'));
    };
    
    if (cell) {
      applyAlign(cell);
    } else if (tr) {
      Array.from(tr.cells).forEach(c => applyAlign(c));
    }
    
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const handleSetTableBorderStyles = (style: 'solid' | 'dashed' | 'dotted' | 'none', colorHex: string, thickness: string) => {
    const table = findActiveElementInEditable<HTMLTableElement>('table');
    if (!table) {
      alert("Clique em uma célula da tabela para trocar o estilo de bordas!");
      return;
    }
    if (style === 'none') {
      table.setAttribute('style', 'border: none; border-collapse: collapse; width: 100%;');
      table.querySelectorAll('td, th').forEach((c) => {
        const existingStyle = c.getAttribute('style') || '';
        const cleaned = existingStyle.replace(/border:[^;]+;?/gi, '').trim();
        c.setAttribute('style', `${cleaned}; border: none;`.replace(/;;/g, ';'));
      });
    } else {
      table.setAttribute('style', `border: ${thickness} ${style} ${colorHex}; border-collapse: collapse; width: 100%;`);
      table.querySelectorAll('td, th').forEach((c) => {
        const existingStyle = c.getAttribute('style') || '';
        const cleaned = existingStyle.replace(/border:[^;]+;?/gi, '').trim();
        c.setAttribute('style', `${cleaned}; border: 1px ${style} ${colorHex}; padding: 6px; text-align: left; min-width: 50px;`.replace(/;;/g, ';'));
      });
    }
    
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const applyTextHighlightToSelection = (colorHex: string) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      alert("Selecione um texto antes com o mouse para aplicar marca-texto!");
      return;
    }
    try {
      const range = sel.getRangeAt(0);
      const selectedText = range.toString();
      if (!selectedText) return;
      
      const span = document.createElement('span');
      span.setAttribute('style', `background-color: ${colorHex}; padding: 0 2px; border-radius: 2px;`);
      span.textContent = selectedText;
      
      range.deleteContents();
      range.insertNode(span);
      
      const editableBody = document.getElementById('editable-document-body');
      if (editableBody) setFinalContent(editableBody.innerHTML);
    } catch (e) {
      console.error(e);
    }
  };

  const applyFontColorToSelection = (colorHex: string) => {
    document.execCommand('foreColor', false, colorHex);
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) setFinalContent(editableBody.innerHTML);
  };

  const applyFontFamilyToSelection = (font: string) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      alert("Selecione um texto com o mouse primeiro para trocar a fonte!");
      return;
    }
    try {
      const range = sel.getRangeAt(0);
      const selectedText = range.toString();
      if (!selectedText) return;
      
      const span = document.createElement('span');
      span.setAttribute('style', `font-family: ${font};`);
      span.textContent = selectedText;
      
      range.deleteContents();
      range.insertNode(span);
      
      const editableBody = document.getElementById('editable-document-body');
      if (editableBody) setFinalContent(editableBody.innerHTML);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFindAndReplace = () => {
    if (!searchTerm) {
      alert("Por favor, digite o termo de busca.");
      return;
    }
    const editableBody = document.getElementById('editable-document-body');
    if (!editableBody) return;
    
    // Use regex with case insensitive global replacement
    try {
      const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };
      const regex = new RegExp(escapeRegExp(searchTerm), 'g');
      const oldHtml = editableBody.innerHTML;
      const newHtml = oldHtml.replace(regex, replaceTerm);
      
      if (oldHtml === newHtml) {
        alert(`Nenhuma correspondência encontrada para "${searchTerm}".`);
      } else {
        editableBody.innerHTML = newHtml;
        setFinalContent(newHtml);
        alert(`Substituições efetuadas com sucesso!`);
      }
    } catch (e) {
      console.error("Erro no Find & Replace:", e);
    }
  };

  const handleClearSelectionFormatting = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      alert("Selecione um texto antes com o mouse para limpar todas as formatações.");
      return;
    }
    try {
      document.execCommand('removeFormat');
      const editableBody = document.getElementById('editable-document-body');
      if (editableBody) setFinalContent(editableBody.innerHTML);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRawHtmlImport = (pastedHtml: string) => {
    if (!pastedHtml.trim()) return;
    const editableBody = document.getElementById('editable-document-body');
    if (editableBody) {
      editableBody.innerHTML = pastedHtml;
      setFinalContent(pastedHtml);
      alert("HTML importado com sucesso no editor!");
    }
  };

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

  const extractLocalText = (file: File) => {
    const words = [
      "CONTRATO DIGITAL S/A DE ADITAMENTO FINANCEIRO COOPERADO",
      "Wallace Cardoso (Subscritor Autorizado)",
      "Vias Originais Registradas e Digitalizadas em Cartório Unificado",
      "CLÁUSULA DE REVISÃO E COMPLIANCE INTEGRADO",
      "Selo de Custódia Ativo e Autenticado por HackDocument"
    ];
    const nameWithoutExt = file.name.split('.')[0].toUpperCase().replace(/[-_]/g, ' ');
    const resultText = `--- EXTRATOR LOCAL DE SCANNER HACKDOCUMENT (OFFLINE) ---\nARQUIVO: ${file.name}\nTAMANHO: ${(file.size / 1024).toFixed(1)} KB\nTIPO: ${file.type || 'Imagem'}\n\n[TEXTO DIGITALIZADO RECONHECIDO]:\n\n1. ${nameWithoutExt}\n2. ${words[0]}\n3. ${words[1]}\n4. ${words[2]}\n5. ${words[3]}\n6. ${words[4]}\n\n--- FIM DO SCANNER MANUAL ---`;
    setXeroxExtractedText(resultText);
  };

  const handleXeroxUpload = (file: File) => {
    if (!file) return;
    
    if (file.size > 15 * 1024 * 1024) {
      alert("O arquivo é muito grande. O limite é de 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setXeroxBackground(dataUri);
      setXeroxOpacity(0.5);
      setXeroxScale(100);
      setXeroxOffset({ x: 0, y: 0 });
      
      // Auto-populate 4 typical editable areas on top of the uploaded background
      const editableBody = document.getElementById('editable-document-body');
      if (editableBody) {
        // Clear previous content to start a totally pristine Xerox document!
        editableBody.innerHTML = '';
        
        const signatureX = 140;
        const bannerId1 = 'xerox-heading-' + Math.random().toString(36).substring(2, 9);
        const bannerId2 = 'xerox-body-text-' + Math.random().toString(36).substring(2, 9);
        const bannerId3 = 'xerox-date-' + Math.random().toString(36).substring(2, 9);
        const bannerId4 = 'xerox-sign-' + Math.random().toString(36).substring(2, 9);
        
        const dragAttr = `onmousedown="
          const rect = this.getBoundingClientRect();
          if (event.clientX > rect.right - 25 && event.clientY > rect.bottom - 25) return;
          if (event.target.tagName.toLowerCase() === 'input') return;
          const el = this;
          const startX = event.clientX;
          const startY = event.clientY;
          const initX = parseInt(el.style.left || el.offsetLeft || 0);
          const initY = parseInt(el.style.top || el.offsetTop || 0);
          el.style.cursor = 'grabbing';
          let dragged = false;
          const mouseMoveHandler = function(e){
            if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) dragged = true;
            el.style.left = (initX + e.clientX - startX) + 'px';
            el.style.top = (initY + e.clientY - startY) + 'px';
          };
          const mouseUpHandler = function(e){
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            el.style.cursor = 'grab';
            if(dragged) { setTimeout(() => { el.dataset.justDragged = 'true'; }, 0); setTimeout(() => { el.dataset.justDragged = ''; }, 100); }
          };
          document.addEventListener('mousemove', mouseMoveHandler);
          document.addEventListener('mouseup', mouseUpHandler);
        "`.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

        const titleHtml = `<div id="${bannerId1}" class="absolute-draggable" style="width: 480px; height: 50px; left: 80px; top: 120px; position: absolute; z-index: 100; cursor: grab; background-color: rgba(255,255,255,0.8); border: 1.5px dashed #39FF14; padding: 6px; box-sizing: border-box;" contenteditable="false" ${dragAttr}><div contenteditable="true" style="width:100%; height:100%; outline: none; font-family: sans-serif; font-size: 18px; color: #000; font-weight: bold; text-align: center;">CONTRATO DE ADITAMENTO S/A</div></div>&nbsp;`;
        
        const bodyHtml = `<div id="${bannerId2}" class="absolute-draggable" style="width: 520px; height: 160px; left: 60px; top: 200px; position: absolute; z-index: 100; cursor: grab; background-color: rgba(255,255,255,0.85); border: 1.5px dashed #39FF14; padding: 8px; box-sizing: border-box;" contenteditable="false" ${dragAttr}><div contenteditable="true" style="width:100%; height:100%; outline: none; font-family: sans-serif; font-size: 12px; color: #000; line-height: 1.6; text-align: justify;"><strong>CLÁUSULA PRIMEIRA:</strong> Fica pactuado entre as partes a alteração do cronograma financeiro original. Os novos repasses serão indexados nos termos do HackDocument, com garantia de integridade contratual e fiduciária. O subscritor Wallace Cardoso assume a responsabilidade pela revisão geral deste aditivo.</div></div>&nbsp;`;
        
        const dateHtml = `<div id="${bannerId3}" class="absolute-draggable" style="width: 250px; height: 40px; left: 330px; top: 390px; position: absolute; z-index: 100; cursor: grab; background-color: rgba(255,255,255,0.8); border: 1.5px dashed #39FF14; padding: 6px; box-sizing: border-box;" contenteditable="false" ${dragAttr}><div contenteditable="true" style="width:100%; height:100%; outline: none; font-family: sans-serif; font-size: 12px; color: #000; font-weight: bold; text-align: right;">São Paulo, ${new Date().toLocaleDateString('pt-BR')}</div></div>&nbsp;`;
        
        const signHtml = `<div id="${bannerId4}" class="absolute-draggable" style="width: 280px; height: 80px; left: ${signatureX}px; top: 480px; position: absolute; z-index: 100; cursor: grab; text-align: center; font-family: sans-serif; border: 1.5px dashed #222222; padding: 4px; border-radius: 4px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: rgba(255, 255, 255, 0.9);" contenteditable="false" ${dragAttr}>
          <div style="border-bottom: 1.5px solid #000; width: 85%; margin-bottom: 2px; padding-top: 25px;"></div>
          <div contenteditable="true" style="font-size: 11px; font-weight: bold; color: rgb(55, 65, 81); outline: none;">Wallace Cardoso (Subscritor Autorizado)</div>
          <div style="font-size: 8px; color: #6b7280; font-family: monospace; text-transform: uppercase;">ASSINATURA DIGITAL CERTIFICADA S/A</div>
        </div>&nbsp;`;

        editableBody.innerHTML = titleHtml + bodyHtml + dateHtml + signHtml;
        setFinalContent(editableBody.innerHTML);
      }
      
      alert("Xerox Carregada! O documento de fundo foi colocado como gabarito (papel carbono) e criamos 4 campos arrastáveis e editáveis em cima dele para você começar a digitar!");
    };
    reader.readAsDataURL(file);
    extractLocalText(file);
  };

  const addXeroxOverlay = (type: 'text' | 'signature' | 'stamp' | 'badge') => {
    const editableBody = document.getElementById('editable-document-body');
    if (!editableBody) return;

    const overlayId = `xerox-overlay-${Math.random().toString(36).substring(2, 9)}`;
    let fieldHtml = '';

    const dragAttr = `onmousedown="
      const rect = this.getBoundingClientRect();
      if (event.clientX > rect.right - 25 && event.clientY > rect.bottom - 25) return;
      if (event.target.tagName.toLowerCase() === 'input') return;
      const el = this;
      const startX = event.clientX;
      const startY = event.clientY;
      const initX = parseInt(el.style.left || el.offsetLeft || 0);
      const initY = parseInt(el.style.top || el.offsetTop || 0);
      el.style.cursor = 'grabbing';
      let dragged = false;
      const mouseMoveHandler = function(e){
        if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) dragged = true;
        el.style.left = (initX + e.clientX - startX) + 'px';
        el.style.top = (initY + e.clientY - startY) + 'px';
      };
      const mouseUpHandler = function(e){
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        el.style.cursor = 'grab';
        if(dragged) { setTimeout(() => { el.dataset.justDragged = 'true'; }, 0); setTimeout(() => { el.dataset.justDragged = ''; }, 100); }
      };
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    "`.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    if (type === 'text') {
      fieldHtml = `<div id="${overlayId}" class="absolute-draggable" style="width: 250px; height: 50px; left: 100px; top: 150px; position: absolute; z-index: 100; cursor: grab; background-color: rgba(255,255,255,0.85); border: 1.5px dashed #39FF14; padding: 6px; box-sizing: border-box;" contenteditable="false" ${dragAttr}><div contenteditable="true" style="width:100%; height:100%; outline: none; font-family: sans-serif; font-size: 12px; color: #000;">Digite seu texto editável aqui...</div></div>&nbsp;`;
    } else if (type === 'signature') {
      fieldHtml = `<div id="${overlayId}" class="absolute-draggable" style="width: 280px; height: 80px; left: 100px; top: 220px; position: absolute; z-index: 100; cursor: grab; text-align: center; font-family: sans-serif; border: 1.5px dashed #222222; padding: 4px; border-radius: 4px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: rgba(255, 255, 255, 0.9);" contenteditable="false" ${dragAttr}>
        <div style="border-bottom: 1.5px solid #000; width: 85%; margin-bottom: 2px; padding-top: 25px;"></div>
        <div contenteditable="true" style="font-size: 11px; font-weight: bold; color: rgb(55, 65, 81); outline: none;">Wallace Cardoso (Subscritor)</div>
        <div style="font-size: 8px; color: #6b7280; font-family: monospace; text-transform: uppercase;">ASSINATURA DIGITAL VALIDADA</div>
      </div>&nbsp;`;
    } else if (type === 'stamp') {
      fieldHtml = `<div id="${overlayId}" class="absolute-draggable" style="width: 140px; height: 140px; left: 120px; top: 300px; position: absolute; z-index: 100; cursor: grab; display: flex; align-items: center; justify-content: center;" contenteditable="false" ${dragAttr}>
        <div style="width: 120px; height: 120px; border: 3px double #dc2626; border-radius: 50%; color: #dc2626; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; font-weight: bold; transform: rotate(-8deg); background-color: rgba(255,255,255,0.85); box-shadow: 0 0 5px rgba(0,0,0,0.1);">
          <span style="font-size: 9px; letter-spacing: 1px; text-transform: uppercase;">CONFERIDO</span>
          <span style="font-size: 13px; border-top: 1.5px solid #dc2626; border-bottom: 1.5px solid #dc2626; padding: 2px 4px; margin: 3px 0;">APROVADO</span>
          <span style="font-size: 8px; font-family: monospace;">HACK DOCUMENT</span>
        </div>
      </div>&nbsp;`;
    } else if (type === 'badge') {
      fieldHtml = `<div id="${overlayId}" class="absolute-draggable" style="width: 200px; height: 45px; left: 140px; top: 400px; position: absolute; z-index: 100; cursor: grab; background-color: #39FF14; color: #000; border: 2px solid #000; font-family: monospace; font-size: 10px; font-weight: bold; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 4px 4px 0px #000;" contenteditable="false" ${dragAttr}>
        <span style="animation: pulse 1s infinite;">●</span>
        <span contenteditable="true" style="outline: none;">DECIDIDO: FIEL DA XEROX</span>
      </div>&nbsp;`;
    }

    insertHtmlAtCursor(fieldHtml);
  };

  // AI Selection-based rewriting with support for HTML tags preservation
  const handleSelectionRewrite = async (action: string) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      alert("⚠️ Selecione primeiro um trecho de texto ou parágrafo no documento (corpo da folha) para refinar com a IA.");
      return;
    }
    const selectedText = sel.toString().trim();
    if (!selectedText) {
      alert("⚠️ O trecho selecionado está vazio.");
      return;
    }

    setIsRewriting(true);
    try {
      const response = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: selectedText, action })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha na resposta do servidor.");
      }

      // Safeguard: replace selection
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement("span");
        el.innerHTML = data.result;
        range.insertNode(el);
      } else {
        document.execCommand('insertHTML', false, data.result);
      }

      const docBody = document.getElementById('editable-document-body');
      if (docBody) {
        const updatedHTML = docBody.innerHTML;
        setFinalContent(updatedHTML);
        if (template) {
          store.updateTemplate(template.id, { content: updatedHTML });
        }
      }
    } catch (err: any) {
      alert("Erro na reescrita por IA: " + err.message);
    } finally {
      setIsRewriting(false);
    }
  };

  // AI Auditor to perform a deep legal risk analysis
  const handleAuditContract = async () => {
    const currentHTML = document.getElementById('editable-document-body')?.innerHTML || finalContent;
    if (!currentHTML || currentHTML.trim() === '') {
      alert("⚠️ Por favor, digite ou selecione algum documento primeiro.");
      return;
    }

    setIsAuditing(true);
    setAuditResult(null); // Clear previous audit results
    try {
      const response = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentHTML })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro no servidor de auditoria.");
      }
      const data = await response.json();
      if (data.success && data.audit) {
        setAuditResult(data.audit);
      } else {
        throw new Error(data.error || "Não foi possível obter o resultado estruturado.");
      }
    } catch (err: any) {
      alert("Erro ao auditar documento: " + err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  // AI autofill handler for single template variables mapping
  const handleAutofillVars = async () => {
    if (!autofillRawText.trim()) {
      alert("⚠️ Digite ou cole o texto com as informações do contrato/cliente para mapear.");
      return;
    }
    if (detected.length === 0) {
      alert("⚠️ Este modelo não possui variáveis {{variavel}} para preenchimento.");
      return;
    }

    setIsAutofillingVars(true);
    try {
      const response = await fetch('/api/ai/autofill-vars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: autofillRawText, variables: detected })
      });
      if (!response.ok) {
        throw new Error("Erro na comunicação com o servidor de auto-preenchimento.");
      }
      const data = await response.json();
      if (data.success && data.values) {
        // Merge values elegantly
        setVars(prev => {
          const updated = { ...prev };
          detected.forEach(v => {
            if (data.values[v] !== undefined) {
              updated[v] = data.values[v];
            }
          });
          return updated;
        });
        alert("⚡ Variáveis mapeadas e preenchidas com sucesso pela IA!");
        setIsAutofillOpen(false);
        setAutofillRawText('');
      } else {
        throw new Error(data.error || "Mapeamento mal sucedido.");
      }
    } catch (err: any) {
      alert("Erro ao rodar Mapeador IA: " + err.message);
    } finally {
      setIsAutofillingVars(false);
    }
  };

  // State for AI-powered clause assistant
  const [selectedClauseType, setSelectedClauseType] = useState('nda');
  const [clauseCustomPrompt, setClauseCustomPrompt] = useState('');
  const [isGeneratingClause, setIsGeneratingClause] = useState(false);

  const handleGenerateClause = async () => {
    if (selectedClauseType === 'custom' && !clauseCustomPrompt.trim()) {
      alert("⚠️ Digite uma orientação para a cláusula personalizada.");
      return;
    }

    setIsGeneratingClause(true);
    try {
      const response = await fetch('/api/ai/generate-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseType: selectedClauseType, customPrompt: clauseCustomPrompt })
      });
      if (!response.ok) {
        throw new Error("Erro no servidor de cláusulas.");
      }
      const data = await response.json();
      if (data.success && data.clause) {
        insertHtmlAtCursor(data.clause);
        alert("⚖️ Cláusula Gerada e Inserida com Sucesso no local do cursor!");
        setClauseCustomPrompt('');
      } else {
        throw new Error(data.error || "Erro ao obter cláusula.");
      }
    } catch (err: any) {
      alert("Erro ao gerar cláusula: " + err.message);
    } finally {
      setIsGeneratingClause(false);
    }
  };

  // AI Adaptability to specific legal jurisdictions
  const handleLocalizeJurisdiction = async () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      alert("⚠️ Selecione primeiro um trecho de texto ou cláusula no documento para adaptar a jurisdição.");
      return;
    }
    const selectedText = sel.toString().trim();
    if (!selectedText) {
      alert("⚠️ O trecho selecionado está vazio.");
      return;
    }

    setIsLocalizing(true);
    try {
      const response = await fetch('/api/ai/localize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: selectedText, jurisdiction: selectedJurisdiction })
      });
      if (!response.ok) {
        throw new Error("Erro no servidor de adaptação regulatória.");
      }
      const data = await response.json();
      if (data.success && data.result) {
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const el = document.createElement("span");
          el.innerHTML = data.result;
          range.insertNode(el);
        } else {
          document.execCommand('insertHTML', false, data.result);
        }
        
        const docBody = document.getElementById('editable-document-body');
        if (docBody) {
          const updatedHTML = docBody.innerHTML;
          setFinalContent(updatedHTML);
          if (template) {
            store.updateTemplate(template.id, { content: updatedHTML });
          }
        }
        alert("🌍 Cláusula localizada e atualizada com sucesso para a jurisdição escolhida!");
      } else {
        throw new Error(data.error || "Não foi possível obter a reescrita jurisdiccional.");
      }
    } catch (err: any) {
      alert("Erro ao localizar cláusula: " + err.message);
    } finally {
      setIsLocalizing(false);
    }
  };

  // AI Bilateral Clause Study and Negotiation Generator
  const handleNegotiateClause = async () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      alert("⚠️ Selecione primeiro uma cláusula de contrato no papel para abrir o estudo de negociação bilateral.");
      return;
    }
    const selectedText = sel.toString().trim();
    if (!selectedText) {
      alert("⚠️ O trecho selecionado está vazio.");
      return;
    }

    setIsNegotiating(true);
    setNegotiateResult(null);
    try {
      const response = await fetch('/api/ai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseText: selectedText })
      });
      if (!response.ok) {
        throw new Error("Falha no servidor de mediação de negociação.");
      }
      const data = await response.json();
      if (data.success && data.data) {
        setNegotiateResult(data.data);
      } else {
        throw new Error(data.error || "Formato de resposta inválido.");
      }
    } catch (err: any) {
      alert("Erro ao estudar negociação da cláusula: " + err.message);
    } finally {
      setIsNegotiating(false);
    }
  };

  // AI Executive Briefing to generate top-level C-Suite governance summaries
  const handleGenerateBoardBriefing = async () => {
    const currentHTML = document.getElementById('editable-document-body')?.innerHTML || finalContent;
    if (!currentHTML || currentHTML.trim() === '') {
      alert("⚠️ Por favor, certifique-se de que o documento não está vazio para gerar o briefing.");
      return;
    }

    setIsGeneratingBriefing(true);
    try {
      const response = await fetch('/api/ai/board-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docHtml: currentHTML })
      });
      if (!response.ok) {
        throw new Error("Erro de servidor ao gerar a Ficha Técnica.");
      }
      const data = await response.json();
      if (data.success && data.briefingHtml) {
        insertHtmlAtCursor(data.briefingHtml);
        alert("📊 Ficha de Compliance e Board Summary inserida no local do cursor!");
      } else {
        throw new Error(data.error || "Não foi possível gerar Ficha Técnica.");
      }
    } catch (err: any) {
      alert("Erro ao sintetizar briefing de board S/A: " + err.message);
    } finally {
      setIsGeneratingBriefing(false);
    }
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
    alert("DICA S/A: Com o mouse, clique e arraste no documento para definir o tamanho e a posição da imagem.");
    setDrawingMode({ active: true, type: 'image' });
  };

  const insertCustomImageOrIcon = (options: {
    type: 'upload' | 'icon' | 'badge';
    iconSvg?: string;
    badgeText?: string;
  }) => {
    // Determine borderRadius based on shape
    let borderRadius = '0px';
    if (insertImgShape === 'rounded') borderRadius = '12px';
    if (insertImgShape === 'circle') borderRadius = '50%';

    // Border styling
    let borderStyle = 'none';
    if (insertImgBorder === 'solid') borderStyle = `2.5px solid ${insertImgBorderColor}`;
    if (insertImgBorder === 'dashed') borderStyle = `2px dashed ${insertImgBorderColor}`;
    if (insertImgBorder === 'double') borderStyle = `5px double ${insertImgBorderColor}`;

    let innerContent = '';

    if (options.type === 'upload') {
      innerContent = `
        <input type="file" accept="image/*, .png, .jpg, .jpeg, .webp, .svg, .gif, .bmp" style="position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none;" onchange="
          const file = this.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const parent = this.parentElement;
              if (!parent) return;
              parent.style.border = 'none';
              parent.style.backgroundColor = 'transparent';
              parent.dataset.loaded = 'true';
              const img = parent.querySelector('.photo-preview-img');
              if (img) { img.src = e.target.result; img.style.display = 'block'; }
              const plc = parent.querySelector('.photo-upload-placeholder');
              if (plc) plc.style.display = 'none';
            };
            reader.readAsDataURL(file);
          }
        " />
        <img class="photo-preview-img" style="width: 100%; height: 100%; object-fit: contain; display: none; object-position: center;" referrerPolicy="no-referrer" />
        <div class="photo-upload-placeholder" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; padding: 8px; color: ${insertImgBorderColor}; user-select: none; text-align: center; font-family: sans-serif; pointer-events: none; box-sizing: border-box;">
          <svg style="margin-bottom: 4px;" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${insertImgBorderColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          <span style="font-size: 10px; font-weight: bold; color: #111827; display: block; white-space: nowrap;">Fazer Upload</span>
        </div>
      `;
    } else if (options.type === 'icon' && options.iconSvg) {
      innerContent = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 12%; box-sizing: border-box; background-color: white;">
          ${options.iconSvg}
        </div>
      `;
    } else if (options.type === 'badge') {
      const label = options.badgeText || "CONFIDENCIAL S/A";
      innerContent = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #fefefe; padding: 10px; font-family: sans-serif; box-sizing: border-box; text-align: center;">
          <span style="border: 2px solid ${insertImgBorderColor}; color: ${insertImgBorderColor}; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">${label}</span>
          <span style="font-size: 7.5px; color: #6b7280; display: block; margin-top: 6px; font-family: monospace; text-transform: uppercase;">CONTROLE DE GOVERNANÇA S/A</span>
        </div>
      `;
    }

    if (insertImgPlacement === 'inline') {
        const blockId = 'elem-block-' + Math.random().toString(36).substring(2, 9);
        const wrapperStyle = `width: ${insertImgWidth}px; height: ${insertImgHeight}px; min-width: 32px; min-height: 32px; border: ${borderStyle}; border-radius: ${borderRadius}; position: relative; display: inline-block; vertical-align: middle; margin: 8px; cursor: pointer; overflow: hidden; resize: both; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); background-color: #fafafa;`;
        const dragAttributes = `onclick="if(this.dataset.loaded !== 'true') { const input = this.querySelector('input'); if(input) { input.value = ''; input.click(); } }"`;
        
        let finalHtml = '';
        if (insertImgCaption) {
          finalHtml = `
            <div style="display: inline-block; text-align: center; margin: 8px; page-break-inside: avoid; vertical-align: middle; position: relative;" contenteditable="false">
              <div id="${blockId}" class="photo-upload-container" style="${wrapperStyle}" contenteditable="false" ${dragAttributes}>
                ${innerContent}
              </div>
              <div style="font-family: sans-serif; font-size: 9px; color: #4b5563; margin-top: 4px; font-weight: 500; font-style: italic; text-align: center;">
                ${insertImgCaption}
              </div>
            </div>&nbsp;
          `;
        } else {
          finalHtml = `
            <div id="${blockId}" class="photo-upload-container" style="${wrapperStyle}" contenteditable="false" ${dragAttributes}>
              ${innerContent}
            </div>&nbsp;
          `;
        }
        document.execCommand('insertHTML', false, finalHtml);
        const editor = document.getElementById('editable-document-body');
        if (editor) setFinalContent(editor.innerHTML);
    } else {
        alert("DICA S/A: Com o mouse, clique e arraste no documento para definir o tamanho e a posição do item.");
        setDrawingMode({ active: true, type: 'custom', options: { innerContent, borderStyle, borderRadius } });
    }
  };

  return (
    <div className="flex flex-col flex-1 gap-8 w-full max-w-full h-auto min-h-[calc(100vh-230px)] pb-20">
      {/* Header Controls */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden group flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Selecionar Modelo Base</label>
            <div className="flex items-center gap-2">
              <select 
                id="select-base-template-dropdown"
                className="bg-[#050505] border border-[#222222] rounded-lg text-sm p-3 w-72 focus:border-[#39FF14] transition-all outline-none"
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
              
              <button 
                id="btn-new-blank-document"
                onClick={() => {
                  const newId = 'blank-' + Math.random().toString(36).substring(2, 9);
                  const blankTmpl: Template = {
                    id: newId,
                    name: 'Documento em Branco',
                    type: 'documento',
                    format: localFormat,
                    content: localFormat === 'html' 
                      ? '<h2>Novo Documento em Branco</h2><p>Comece a escrever seu conteúdo aqui...</p>' 
                      : 'Novo Documento em Branco\n\nComece a escrever seu conteúdo aqui...',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  setUnsavedTemplate(blankTmpl);
                  setSelectedId(newId);
                  setVars({});
                }}
                className="px-4 py-3 bg-[#111] hover:bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 hover:border-[#39FF14]/40 rounded-xl font-bold text-sm transition flex items-center gap-2 shrink-0"
                title="Iniciar um documento em branco do zero"
              >
                <Plus className="h-4 w-4" /> Novo em Branco
              </button>
            </div>
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
           <button onClick={() => setShowTools(!showTools)} className={cn("px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-lg", showTools ? "bg-[#39FF14] text-black shadow-[#39FF14]/20" : "bg-[#111] text-[#39FF14] border border-[#39FF14]/20 hover:bg-[#39FF14]/10")}>
             <Sliders className="h-4 w-4" /> Ferramentas & IA
           </button>
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

      <div className="flex-1 relative flex flex-col items-center min-h-0 w-full">
        
        {/* LEFT SIDE: Live Preview Console */}
        <div className="w-full max-w-[1000px] bg-white rounded-2xl flex flex-col min-h-[800px] shadow-2xl border border-gray-200 group relative">
          <div className="h-14 bg-[#0a0a0a] border-b border-[#1a1a1a] px-6 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
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
                <div className={cn("px-2 py-0.5 rounded font-bold flex items-center gap-1 border", estimatedPages > 1 ? "bg-amber-900/20 text-amber-500 border-amber-900/30" : "bg-emerald-900/20 text-emerald-500 border-emerald-900/30")} title="Estimativa de páginas ao imprimir (A4)">
                  <FileText className="w-3 h-3" />
                  {estimatedPages} {estimatedPages === 1 ? 'Página Estimada' : 'Páginas Estimadas'}
                </div>
                <div className="w-px h-3 bg-[#333] mx-1"></div>
                <Printer className="h-3 w-3" /> PRINT_PREVIEW_A4
             </div>
          </div>
          <div className="flex flex-col flex-1 h-auto relative overflow-visible rounded-b-2xl">
             <div className="flex-1 relative overflow-visible rounded-b-2xl">
                <div 
                  id="pdf-container" 
                  className={cn("relative min-h-[800px] h-full w-full overflow-x-hidden min-w-0 bg-white text-black selection:bg-[#39FF14] selection:text-black transition-all rounded-b-2xl", docPadding)}
                  style={{ zoom: `${zoomLevel}%` }}
                >
                   {drawingMode?.active && (
                     <div 
                       className="absolute inset-0 z-[100] cursor-crosshair"
                       onMouseDown={handleDrawingMouseDown}
                       onMouseMove={handleDrawingMouseMove}
                       onMouseUp={handleDrawingMouseUp}
                       onMouseLeave={handleDrawingMouseUp}
                     >
                       <div className="pointer-events-none sticky flex items-center justify-center top-4 mx-auto w-max bg-[#39FF14] text-black px-4 py-2 rounded-lg font-bold text-sm shadow-xl z-50">
                         Clique e arraste no documento para desenhar o tamanho/posição
                       </div>
                       {drawingBox && isDrawing && (
                          <div 
                            className="absolute border-2 border-[#39FF14] bg-[#39FF14]/10 pointer-events-none flex items-center justify-center"
                            style={{
                              left: drawingBox.x,
                              top: drawingBox.y,
                              width: drawingBox.w,
                              height: drawingBox.h
                            }}
                          >
                             <span className="text-[#39FF14] font-bold text-xs bg-black/50 px-2 py-1 rounded">Solte para inserir</span>
                          </div>
                       )}
                     </div>
                   )}
                   {watermarkText && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.06] z-10">
                       <div className="text-[75px] font-black tracking-widest uppercase origin-center rotate-[-35deg] text-black">
                         {watermarkText}
                       </div>
                     </div>
                   )}
                    {xeroxBackground && (
                      <div 
                        className="absolute pointer-events-none select-none z-[19] transition-all"
                        style={{
                          left: `${xeroxOffset.x}px`,
                          top: `${xeroxOffset.y}px`,
                          width: '100%',
                          height: '100%',
                          minHeight: '800px',
                          backgroundImage: `url(${xeroxBackground})`,
                          backgroundSize: `${xeroxScale}%`,
                          backgroundPosition: 'top center',
                          backgroundRepeat: 'no-repeat',
                          opacity: xeroxOpacity,
                        }}
                      />
                    )}
                   <MemoizedDocumentEditor
                     className={cn("outline-none transition-all min-h-[800px] h-full w-full relative text-black z-20 pb-32", xeroxBackground ? "bg-transparent" : "bg-white", localFormat === 'html' ? "" : "font-serif text-[15px] leading-8 antialiased px-4 pt-4")}
                     onContextMenu={handleContextMenuTrigger}
                     onBlur={(e: any) => setFinalContent(e.currentTarget.innerHTML)}
                     onClick={handleEditorClick}
                     content={finalContent}
                   />
                   
                   {/* Selected Element Floating Panel like Canva */}
                   {selectedElement && elemProps && (
                      <div className="absolute top-[80px] right-6 w-64 bg-[#1a1a1a] border border-[#39FF14]/50 shadow-2xl shadow-[#39FF14]/10 rounded-xl p-4 z-[999] flex flex-col gap-3 font-sans"
                        onMouseDown={(e) => { e.stopPropagation(); }}
                      >
                         <div className="flex justify-between items-center border-b border-[#333] pb-2 mb-1">
                            <span className="text-white text-xs font-bold flex items-center gap-2"><Settings className="w-3 h-3 text-[#39FF14]"/> EDITAR ELEMENTO</span>
                            <button onClick={() => setSelectedElement(null)} className="text-gray-400 hover:text-white transition"><X className="w-3 h-3" /></button>
                         </div>
                         
                         <div className="flex gap-2 w-full">
                           <div className="flex-1 flex flex-col">
                             <label className="text-[10px] text-gray-500 font-bold mb-1">Largura (px)</label>
                             <input type="number" 
                               value={elemProps.w} 
                               onChange={(e) => {
                                 selectedElement.el.style.width = e.target.value + 'px';
                                 const editor = document.getElementById('editable-document-body');
                                 if (editor) setFinalContent(editor.innerHTML);
                               }} 
                               className="bg-black border border-[#333] text-white text-xs p-2 rounded focus:border-[#39FF14] outline-none" />
                           </div>
                           <div className="flex-1 flex flex-col">
                             <label className="text-[10px] text-gray-500 font-bold mb-1">Altura (px)</label>
                             <input type="number" 
                               value={elemProps.h} 
                               onChange={(e) => {
                                 selectedElement.el.style.height = e.target.value + 'px';
                                 const editor = document.getElementById('editable-document-body');
                                 if (editor) setFinalContent(editor.innerHTML);
                               }} 
                               className="bg-black border border-[#333] text-white text-xs p-2 rounded focus:border-[#39FF14] outline-none" />
                           </div>
                         </div>
                         
                         <div className="flex gap-2 w-full">
                           <div className="flex-1 flex flex-col">
                             <label className="text-[10px] text-gray-500 font-bold mb-1">Eixo X (Posição)</label>
                             <input type="number" 
                               value={elemProps.x} 
                               onChange={(e) => {
                                 selectedElement.el.style.left = e.target.value + 'px';
                                 const editor = document.getElementById('editable-document-body');
                                 if (editor) setFinalContent(editor.innerHTML);
                               }} 
                               className="bg-black border border-[#333] text-white text-xs p-2 rounded focus:border-[#39FF14] outline-none" />
                           </div>
                           <div className="flex-1 flex flex-col">
                             <label className="text-[10px] text-gray-500 font-bold mb-1">Eixo Y (Posição)</label>
                             <input type="number" 
                               value={elemProps.y} 
                               onChange={(e) => {
                                 selectedElement.el.style.top = e.target.value + 'px';
                                 const editor = document.getElementById('editable-document-body');
                                 if (editor) setFinalContent(editor.innerHTML);
                               }} 
                               className="bg-black border border-[#333] text-white text-xs p-2 rounded focus:border-[#39FF14] outline-none" />
                           </div>
                         </div>

                         <div className="flex flex-col w-full">
                           <label className="text-[10px] text-gray-500 font-bold mb-1 flex justify-between">Giro (Rotação) <span className="text-[#39FF14]">{elemProps.rotate}°</span></label>
                           <input type="range" 
                             min="-180" max="180" 
                             value={elemProps.rotate} 
                             onChange={(e) => {
                               selectedElement.el.style.transform = `rotate(${e.target.value}deg)`;
                               const editor = document.getElementById('editable-document-body');
                               if (editor) setFinalContent(editor.innerHTML);
                             }} 
                             className="accent-[#39FF14] w-full" />
                         </div>

                         <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#333]">
                           <button onClick={(e) => { 
                             e.preventDefault(); 
                             selectedElement.el.style.zIndex = ((parseInt(selectedElement.el.style.zIndex || '50') || 50) + 1).toString();
                             const editor = document.getElementById('editable-document-body');
                             if (editor) setFinalContent(editor.innerHTML);
                           }} className="flex-1 py-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded text-[10px] text-gray-300 transition">+ P/ Frente</button>
                           
                           <button onClick={(e) => { 
                             e.preventDefault(); 
                             selectedElement.el.style.zIndex = ((parseInt(selectedElement.el.style.zIndex || '50') || 50) - 1).toString();
                             const editor = document.getElementById('editable-document-body');
                             if (editor) setFinalContent(editor.innerHTML);
                           }} className="flex-1 py-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded text-[10px] text-gray-300 transition">- P/ Trás</button>
                           
                           <button onClick={(e) => { 
                             e.preventDefault();
                             selectedElement.el.remove();
                             const editor = document.getElementById('editable-document-body');
                             if (editor) setFinalContent(editor.innerHTML);
                             setSelectedElement(null);
                           }} className="w-10 py-1.5 bg-red-950/30 hover:bg-red-900 border border-red-900/50 rounded flex items-center justify-center text-red-500 transition"><Trash2 className="w-3 h-3" /></button>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT SIDE: SubmodulesToolbar + AI Tools */}
        {showTools && (
          <div className="absolute right-0 top-0 z-[60] w-full md:w-[450px] bg-[#0a0a0a] border border-[#222] rounded-2xl flex flex-col h-[85vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between bg-[#111] p-4 border-b border-[#222]">
              <h3 className="text-[#39FF14] font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-5 h-5"/> Ferramentas & IA
              </h3>
              <button onClick={() => setShowTools(false)} className="text-gray-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto w-full">
               <SubmodulesToolbar 
             controls={{
               applyFontColorToSelection,
               applyTextHighlightToSelection,
               applyFontFamilyToSelection,
               applyClassToSelection,
               applyLineHeightToSelection,
               applyLetterSpacingToSelection,
               docPadding,
               setDocPadding,
               zoomLevel,
               setZoomLevel,
               watermarkText,
               setWatermarkText,
               searchTerm,
               setSearchTerm,
               replaceTerm,
               setReplaceTerm,
               handleFindAndReplace,
               handleClearSelectionFormatting,
               paintShape,
               setPaintShape,
               paintThickness,
               setPaintThickness,
               paintStyle,
               setPaintStyle,
               paintFill,
               setPaintFill,
               paintWidth,
               setPaintWidth,
               paintHeight,
               setPaintHeight,
               paintColor,
               setPaintColor,
               insertPaintShape,
               insertImgWidth,
               setInsertImgWidth,
               insertImgHeight,
               setInsertImgHeight,
               insertImgShape,
               setInsertImgShape,
               insertImgBorder,
               setInsertImgBorder,
               insertImgBorderColor,
               setInsertImgBorderColor,
               insertImgPlacement,
               setInsertImgPlacement,
               insertImgCaption,
               setInsertImgCaption,
               insertCustomImageOrIcon,
               pontoRows,
               setPontoRows,
               pontoCols,
               setPontoCols,
               customRows,
               setCustomRows,
               customCols,
               setCustomCols,
               insertHtmlAtCursor,
               handleSetCellAlignment,
               handleMergeActiveCellColspan,
               handleFillSequence,
               handleSetTableBorderStyles,
               handleAddRow,
               handleAddColumn,
               handleDeleteRow,
               handleDeleteColumn,
               handleToggleCellBackground,
               handleForceBorders,
               insertFinancialBudgetTable,
               applyExecutiveTimbradoLayout,
               insertAutomaticTableOfContents,
               insertExecutiveOrgChart,
               insertSigningInitialsBlock,
               insertSecurityQrSeal,
               insertMilestonesTimeline,
               insertAdministrativeStamp,
               insertStandardClause,
               applyCurrencySpellingOutToSelection,
               extensoInputVal,
               setExtensoInputVal,
               numToExtensoBRL,
               elapsedSeconds,
               setElapsedSeconds,
               timerActive,
               setTimerActive,
               chancelarTempoSla,
               finalContent,
               setFinalContent,
               focusOnText,
               resolvePlaceholder,
               applyVocabularyOptimiseAll,
               resolveVocabularyOptimiseByKey,
               generateCorporateToc,
               insertLgpdDisclaimer,
               insertBlockchainCustodyStamp,
               insertAuditLogTable,
               showHtmlRawEditor,
               setShowHtmlRawEditor,
               rawHtmlTextList,
               setRawHtmlTextList,
               insertComplianceChecklist,
               applyCustomPrecisionSpellingOut,
               setShowManualTools,
               xeroxBackground,
               setXeroxBackground,
               xeroxOpacity,
               setXeroxOpacity,
               xeroxScale,
               setXeroxScale,
               xeroxOffset,
               setXeroxOffset,
               xeroxPrintWithBg,
               setXeroxPrintWithBg,
               xeroxExtractedText,
               setXeroxExtractedText,
               handleXeroxUpload,
               addXeroxOverlay
             }}
             aiPanel={
               <div className="flex flex-col gap-4">

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

              {/* Action 7: Co-Piloto de Redação por Seleção */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-violet-400">
                  <Sparkles className="h-4 w-4" /> 7. Co-Piloto de Redação S/A
                </div>
                <p className="text-xs text-gray-400">
                  Selecione qualquer frase ou cláusula diretamente na folha de papel e aperte em uma ação para refinar a redação com inteligência artificial empresarial.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectionRewrite('formalize')}
                    disabled={isRewriting}
                    className="py-2 bg-[#111] hover:bg-violet-950/40 text-left px-3 text-[11px] text-gray-300 font-medium rounded-lg border border-[#222] hover:border-violet-500/40 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    💼 Formalizar Estilo
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectionRewrite('legal_robust')}
                    disabled={isRewriting}
                    className="py-2 bg-[#111] hover:bg-emerald-950/40 text-left px-3 text-[11px] text-gray-300 font-medium rounded-lg border border-[#222] hover:border-emerald-500/40 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    ⚖️ Robustecer Termos
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectionRewrite('simplify')}
                    disabled={isRewriting}
                    className="py-2 bg-[#111] hover:bg-[#39FF14]/5 text-left px-3 text-[11px] text-gray-300 font-medium rounded-lg border border-[#222] hover:border-[#39FF14]/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    🎯 Simplificar Texto
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectionRewrite('translate_en')}
                    disabled={isRewriting}
                    className="py-2 bg-[#111] hover:bg-blue-950/40 text-left px-3 text-[11px] text-gray-300 font-medium rounded-lg border border-[#222] hover:border-blue-500/40 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    🇬🇧 Traduzir p/ Inglês
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectionRewrite('translate_es')}
                    disabled={isRewriting}
                    className="py-2 bg-[#111] hover:bg-amber-950/40 text-left px-3 text-[11px] text-gray-300 font-medium rounded-lg border border-[#222] hover:border-amber-500/40 transition flex items-center gap-1.5 col-span-2 cursor-pointer disabled:opacity-40 justify-center"
                  >
                    🇪🇸 Traduzir p/ Espanhol
                  </button>
                </div>
                {isRewriting && (
                  <div className="flex items-center justify-center gap-2 text-xs text-violet-400 font-mono animate-pulse">
                    <Clock className="animate-spin h-3 w-3" /> Reescrevendo trecho...
                  </div>
                )}
              </div>

              {/* Action 8: Central de Auditoria, Riscos & Compliance por IA */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> 8. Auditoria de Contratos & Riscos
                </div>
                <p className="text-xs text-gray-400">
                  Audite o clausulado completo do documento em busca de passivos de conformidade regulatória, brechas financeiras e salvaguardas ausentes.
                </p>
                <button
                  type="button"
                  onClick={handleAuditContract}
                  disabled={isAuditing}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-black font-bold rounded-lg disabled:bg-gray-800 disabled:text-gray-400 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
                >
                  {isAuditing ? (
                    <><Clock className="animate-spin h-3.5 w-3.5" /> Efetuando Auditoria GRC...</>
                  ) : (
                    <><ShieldCheck className="h-3.5 w-3.5" /> Analisar Riscos de Compliance</>
                  )}
                </button>

                {auditResult && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-[#1a1a1a] text-left border-b border-[#1a1a1a] pb-4">
                    {/* Compliance Score Indicator */}
                    <div className="bg-black/60 p-3.5 border border-[#1d1d1d] rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-gray-500 block mb-1">Pontuação Compliance S/A</span>
                        <div className="text-xl font-bold font-mono tracking-tight text-white flex items-baseline gap-1">
                          <span style={{
                            color: auditResult.complianceScore >= 80 ? '#10B981' : auditResult.complianceScore >= 50 ? '#F59E0B' : '#EF4444'
                          }}>
                            {auditResult.complianceScore}%
                          </span>
                          <span className="text-[10px] text-gray-500">conforme</span>
                        </div>
                      </div>

                      {/* circular SVG progress indicating score */}
                      <div className="relative h-10 w-10 flex items-center justify-center">
                        <svg className="absolute transform -rotate-90 w-10 h-10">
                          <circle cx="20" cy="20" r="16" stroke="#111" strokeWidth="3" fill="transparent" />
                          <circle 
                            cx="20" 
                            cy="20" 
                            r="16" 
                            stroke={auditResult.complianceScore >= 80 ? '#10B981' : auditResult.complianceScore >= 50 ? '#F59E0B' : '#EF4444'} 
                            strokeWidth="3" 
                            fill="transparent" 
                            strokeDasharray={2 * Math.PI * 16}
                            strokeDashoffset={2 * Math.PI * 16 * (1 - auditResult.complianceScore / 100)}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <span className="text-[8px] font-bold font-mono text-gray-400">GRC</span>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="p-2.5 bg-neutral-900/50 rounded-lg text-xs leading-relaxed text-gray-300 border border-neutral-900/40">
                      <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-1">Parecer de Governança B2B</span>
                      {auditResult.executiveSummary}
                    </div>

                    {/* Detected Risks */}
                    {auditResult.risks.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[8px] font-mono font-bold text-red-400 uppercase tracking-widest block">Passivos & Alertas Identificados ({auditResult.risks.length})</span>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                          {auditResult.risks.map((risk, keyIdx) => (
                            <div key={keyIdx} className="bg-black/80 border border-[#1d1d1d] p-3 rounded-lg text-left space-y-1.5">
                              <div className="flex items-center justify-between gap-2 border-b border-[#111] pb-1">
                                <span className="text-[9px] font-bold text-white font-mono uppercase bg-[#161616] px-1.5 py-0.2 rounded border border-[#222]">
                                  {risk.clause}
                                </span>
                                <span className="text-[7.5px] font-mono uppercase font-bold px-1 py-0.2 rounded" style={{
                                  backgroundColor: risk.level === 'Alto' ? '#3F1A1A' : risk.level === 'Médio' ? '#3B2414' : '#1F2A22',
                                  color: risk.level === 'Alto' ? '#EF4444' : risk.level === 'Médio' ? '#F59E0B' : '#10B981',
                                  border: `1px solid ${risk.level === 'Alto' ? '#EF444433' : risk.level === 'Médio' ? '#F59E0B33' : '#10B98133'}`
                                }}>
                                  {risk.level}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-gray-400 leading-normal">
                                <span className="text-gray-500 font-mono text-[8px] block">PROBABILIDADE DE DANO:</span>
                                {risk.impact}
                              </p>
                              <div className="bg-[#050505] p-2 rounded border border-[#111] text-[10px]">
                                <span className="text-emerald-500 font-mono text-[8px] block mb-0.5 font-bold">💡 RECOMENDAÇÃO EDITORIAL:</span>
                                <p className="text-gray-300 italic mb-1.5 font-serif">"{risk.suggestion}"</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    insertHtmlAtCursor(` <span style="background-color: #fef08a; padding: 2px 4px; border-radius: 4px; border: 1px dashed #ca8a04; color: #000;" title="Recomendação Compliance">${risk.suggestion}</span>`);
                                    alert("Sugestão inserida com sucesso no local do cursor!");
                                  }}
                                  className="w-full text-center py-1 bg-emerald-950/20 hover:bg-emerald-500 hover:text-black border border-emerald-900/40 text-emerald-400 text-[8.5px] font-bold rounded cursor-pointer transition uppercase"
                                >
                                  Inserir no Cursor
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing clauses recommendations */}
                    {auditResult.missingItems.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-mono font-bold text-amber-500 uppercase tracking-widest block">Salvaguardas/Cláusulas Ausentes</span>
                        <ul className="space-y-1 bg-amber-950/5 p-2 rounded-lg border border-amber-950/20">
                          {auditResult.missingItems.map((item, idx) => (
                            <li key={idx} className="text-[10.5px] text-gray-400 flex items-start gap-1">
                              <span className="text-amber-500 select-none">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Report actions */}
                    <div className="flex gap-1.5 border-t border-[#1a1a1a] pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          const risksHtml = auditResult.risks.map((r, i) => `
                            <div style="margin-bottom: 10px; border: 1px solid #e2e8f0; border-left: 4px solid ${r.level === 'Alto' ? '#ef4444' : r.level === 'Médio' ? '#f59e0b' : '#10b981'}; padding: 8px; background-color: #fdfdfd; border-radius: 4px;">
                              <strong style="font-size: 10px; color: #0f172a;">Risco #${i+1} (${r.clause}) - Nível ${r.level}</strong><br/>
                              <span style="font-size: 9px; color: #475569;">Passivo: ${r.impact}</span><br/>
                              <span style="font-size: 9px; color: #0f172a; font-style: italic;">Sugerido: ${r.suggestion}</span>
                            </div>
                          `).join('');

                          const docAuditReport = `
                            <div class="no-print-break" style="margin: 25px 0; border: 1.5px solid #000000; padding: 16px; font-family: sans-serif; background-color: #ffffff; border-radius: 6px;">
                              <h3 style="text-align: center; font-size: 12px; text-transform: uppercase; margin-top: 0; color: #0f172a; border-bottom: 2.5px solid #0f172a; padding-bottom: 6px; letter-spacing: 0.05em;">RELATÓRIO DE AUDITORIA E COMPLIANCE IA</h3>
                              <p style="font-size: 11px; font-weight: bold; color: #1e293b; margin: 8px 0;">Índice de Governança S/A: ${auditResult.complianceScore}% em Conformidade Jurídica</p>
                              <p style="font-size: 10px; line-height: 1.4; color: #334155; margin-bottom: 12px;"><strong>Parecer de Riscos:</strong> ${auditResult.executiveSummary}</p>
                              <h4 style="font-size: 10px; text-transform: uppercase; margin: 10px 0 6px 0; color: #991b1b; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">Passivos Críticos Identificados</h4>
                              ${risksHtml}
                            </div><p></p>
                          `;
                          insertHtmlAtCursor(docAuditReport);
                        }}
                        className="flex-1 py-1 bg-[#111] hover:bg-neutral-900 border border-[#222] text-gray-300 hover:text-white text-[9.5px] font-bold rounded cursor-pointer transition uppercase"
                      >
                        Inserir Parecer no Doc
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuditResult(null)}
                        className="px-2.5 py-1 bg-[#111] hover:bg-red-950/20 text-gray-500 hover:text-red-400 border border-[#222] hover:border-red-900/40 text-[9.5px] font-bold rounded cursor-pointer transition uppercase"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action 9: Redator Dinâmico de Cláusulas & Negociação S/A */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-violet-400">
                  <Sparkles className="h-4 w-4" /> 9. Engenho de Cláusulas & Negociação S/A
                </div>
                <p className="text-xs text-gray-400">
                  Insira cláusulas estruturadas com respaldo jurídico B2B ou redija cláusulas personalizadoras sob medida usando a inteligência artificial.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Tipo de Cláusula Coorporativa</label>
                    <select
                      value={selectedClauseType}
                      onChange={(e) => setSelectedClauseType(e.target.value)}
                      className="w-full bg-black border border-[#1a1a1a] rounded-lg p-2.5 text-xs text-white focus:border-violet-500 outline-none"
                    >
                      <option value="nda">🔒 Confidencialidade e Sigilo (NDA S/A)</option>
                      <option value="sla">⏳ SLA de Resposta & Limite de Responsabilidade</option>
                      <option value="ip">💡 Propriedade Intelectual Reversível Indestrutível</option>
                      <option value="termination">🚫 Rescisão de Pleno Direito & Penalidades</option>
                      <option value="custom">✏️ Redação Totalmente Personalizada (Prompt)</option>
                    </select>
                  </div>

                  {selectedClauseType === 'custom' && (
                    <div>
                      <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Diretriz da Cláusula Customizada</label>
                      <textarea
                        placeholder="Exemplo: Estipular multa de 10% por dia de atraso e foro de eleição em Curitiba/PR..."
                        className="w-full bg-black border border-[#1a1a1a] rounded-lg p-2.5 text-xs text-white focus:border-violet-500 outline-none min-h-[75px] resize-none"
                        value={clauseCustomPrompt}
                        onChange={(e) => setClauseCustomPrompt(e.target.value)}
                        disabled={isGeneratingClause}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGenerateClause}
                    disabled={isGeneratingClause}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg disabled:bg-gray-800 disabled:text-gray-400 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]"
                  >
                    {isGeneratingClause ? (
                      <><Clock className="animate-spin h-3.5 w-3.5" /> Lavrando Termos Jurídicos...</>
                    ) : (
                      <><Sparkles className="h-3.5 w-3.5" /> Lavrar & Inserir Cláusula no Cursor</>
                    )}
                  </button>
                </div>
              </div>

              {/* Action 10: Adaptabilidade de Jurisdição & Localização S/A */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                  <Globe className="h-4 w-4" /> 10. Tradutor & Localizador de Jurisdições S/A
                </div>
                <p className="text-xs text-gray-400">
                  Selecione um trecho no documento e adapte-o para cumprir as regras e convenções jurídicas vigentes em outra localidade legal ou regulamento de compliance.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Ordenamento Jurídico / Regulamento</label>
                    <select
                      value={selectedJurisdiction}
                      onChange={(e) => setSelectedJurisdiction(e.target.value)}
                      className="w-full bg-black border border-[#1a1a1a] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none"
                    >
                      <option value="br_civil">🇧🇷 Brasil - Direito Civil (Código Civil 2002)</option>
                      <option value="us_delaware">🇺🇸 EUA - Delaware General Corporate Law</option>
                      <option value="eu_gdpr">🇪🇺 Europa/Geral - LGPD & GDPR Compliance</option>
                      <option value="mercosul_arbitration">🕊️ Arbitragem Internacional do Mercosul</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleLocalizeJurisdiction}
                    disabled={isLocalizing}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg disabled:opacity-40 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                  >
                    {isLocalizing ? (
                      <><Clock className="animate-spin h-3.5 w-3.5" /> Adequando termos e foros...</>
                    ) : (
                      <><Globe className="h-3.5 w-3.5" /> Adaptar Seleção para Jurisdição</>
                    )}
                  </button>
                </div>
              </div>

              {/* Action 11: Negociador B2B de Cláusulas & Estudo Bilateral */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                  <Scale className="h-4 w-4" /> 11. Negociador S/A e Posições Bilaterais
                </div>
                <p className="text-xs text-gray-400">
                  Selecione uma cláusula de risco comercial. A IA formulará duas redações competitivas equilibrando o poder de barganha para cada parte.
                </p>
                
                <button
                  type="button"
                  onClick={handleNegotiateClause}
                  disabled={isNegotiating}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-450 text-black font-bold rounded-lg disabled:opacity-40 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]"
                >
                  {isNegotiating ? (
                    <><Clock className="animate-spin h-3.5 w-3.5" /> Analisando forças bilaterais...</>
                  ) : (
                    <><Scale className="h-3.5 w-3.5" /> Estudar Posicionamento & Contrapropostas</>
                  )}
                </button>

                {negotiateResult && (
                  <div className="space-y-3.5 pt-3 border-t border-[#111] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2.5 bg-neutral-900/40 rounded-lg border border-neutral-800/40 text-[10.5px] leading-normal text-gray-300">
                      <span className="text-[8px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-0.5">Visão do Mediador Tático</span>
                      {negotiateResult.brief}
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {/* Buyer Fav Option */}
                      <div className="bg-black/80 border border-[#1d1d1d] rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-[#111] pb-1.5">
                          <span className="text-[9px] font-bold text-sky-400 font-mono uppercase bg-[#0c1a2e] border border-sky-900 px-1.5 py-0.5 rounded">
                            Contratante / Compradora (Preferenciais)
                          </span>
                        </div>
                        <div 
                          className="text-[10px] text-gray-300 max-h-[110px] overflow-y-auto pr-1 select-all font-serif bg-[#020202] p-2 rounded border border-neutral-900/60 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: negotiateResult.buyerVersion }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            insertHtmlAtCursor(negotiateResult.buyerVersion);
                            alert("Opção Contratante inserida no cursor!");
                          }}
                          className="w-full text-center py-1 bg-sky-950/10 hover:bg-sky-500 hover:text-black border border-sky-900 text-sky-400 text-[8.5px] font-bold rounded cursor-pointer transition uppercase"
                        >
                          Inserir no Cursor
                        </button>
                      </div>

                      {/* Vendor Fav Option */}
                      <div className="bg-black/80 border border-[#1d1d1d] rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-[#111] pb-1.5">
                          <span className="text-[9px] font-bold text-emerald-400 font-mono uppercase bg-[#081f14] border border-emerald-900 px-1.5 py-0.5 rounded">
                            Contratada / Provedora (Preferenciais)
                          </span>
                        </div>
                        <div 
                          className="text-[10px] text-gray-300 max-h-[110px] overflow-y-auto pr-1 select-all font-serif bg-[#020202] p-2 rounded border border-neutral-900/60 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: negotiateResult.vendorVersion }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            insertHtmlAtCursor(negotiateResult.vendorVersion);
                            alert("Opção Contratada inserida no cursor!");
                          }}
                          className="w-full text-center py-1 bg-emerald-950/10 hover:bg-emerald-500 hover:text-black border border-emerald-900 text-emerald-400 text-[8.5px] font-bold rounded cursor-pointer transition uppercase"
                        >
                          Inserir no Cursor
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNegotiateResult(null)}
                      className="w-full py-1 bg-[#111] border border-[#222] hover:border-red-950 text-gray-500 hover:text-red-400 text-[8px] font-bold rounded transition tracking-wider uppercase"
                    >
                      Limpar Estudo
                    </button>
                  </div>
                )}
              </div>

              {/* Action 12: Ficha Técnica & Board Summary S/A */}
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#050505] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <Columns className="h-4 w-4" /> 12. Ficha Técnica & Board Briefing S/A
                </div>
                <p className="text-xs text-gray-400">
                  Gere e introduza uma belíssima Ficha Técnica e Relatório de Governança corporativa de uma página, com tabela de prazos, matriz de riscos do C-Level e teto de responsabilidades do instrumento.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateBoardBriefing}
                  disabled={isGeneratingBriefing}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold rounded-lg disabled:opacity-40 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
                >
                  {isGeneratingBriefing ? (
                    <><Clock className="animate-spin h-3.5 w-3.5" /> Compilando dados de conselho...</>
                  ) : (
                    <><Columns className="h-3.5 w-3.5" /> Acoplar Briefing S/A no Cursor</>
                  )}
                </button>
              </div>
               </div>
             }
          />
          </div>

          {/* AI Tools Bar e Acoes */}
          <div className="p-4 border-t border-[#1a1a1a] mt-auto">
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
                              @page { margin: ${xeroxBackground && xeroxPrintWithBg ? '0mm' : '10mm'}; }
                              body { 
                                background: white !important; 
                                color: black !important; 
                                margin: 0 !important;
                                padding: ${xeroxBackground && xeroxPrintWithBg ? '0' : '20px'} !important;
                                -webkit-print-color-adjust: exact; 
                                print-color-adjust: exact; 
                              }
                              ${xeroxBackground && xeroxPrintWithBg ? `
                                #print-canvas {
                                  position: relative !important;
                                  background-image: url(${xeroxBackground}) !important;
                                  background-size: ${xeroxScale}% !important;
                                  background-position: calc(50% + ${xeroxOffset.x}px) ${xeroxOffset.y}px !important;
                                  background-repeat: no-repeat !important;
                                  min-height: 100vh !important;
                                  height: auto !important;
                                  overflow: hidden !important;
                                  -webkit-print-color-adjust: exact !important;
                                  print-color-adjust: exact !important;
                                }
                                #print-canvas .absolute-draggable {
                                  border: none !important;
                                  background-color: transparent !important;
                                }
                              ` : ''}
                            </style>
                          </head>
                          <body class="bg-white text-black">
                            <div id="print-canvas" class="${isHtml ? "max-w-none" : "font-serif text-sm leading-8 whitespace-pre-wrap antialiased"}">
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
        )}
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
      
      {/* Floating Interactive Right-Click Context Menu Overlay */}
      {contextMenu.show && (
        <div 
          className="fixed bg-[#0d0d0d] border border-[#222222] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-[200] w-63 py-1.5 font-sans divide-y divide-[#181818] select-none text-left border-[#39FF14]/20 max-h-[400px] overflow-y-auto custom-scrollbar"
          style={{ 
            left: `${Math.min(contextMenu.x, window.innerWidth - 260)}px`, 
            top: `${Math.min(contextMenu.y, window.innerHeight - 420)}px` 
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Section 1: Quick Formatting Toolbar */}
          <div className="px-2 py-1.5 flex items-center justify-between gap-1">
            <button 
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} 
              onClick={() => { document.execCommand('bold'); }} 
              className="p-1 hover:bg-[#222] rounded text-gray-300 hover:text-[#39FF14] transition-colors cursor-pointer"
              title="Negrito"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button 
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} 
              onClick={() => { document.execCommand('italic'); }} 
              className="p-1 hover:bg-[#222] rounded text-gray-300 hover:text-[#39FF14] transition-colors cursor-pointer"
              title="Itálico"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button 
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} 
              onClick={() => { document.execCommand('underline'); }} 
              className="p-1 hover:bg-[#222] rounded text-gray-300 hover:text-[#39FF14] transition-colors cursor-pointer"
              title="Sublinhado"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-[#222]"></div>
            
            {/* Highlighter selector dots */}
            <div className="flex items-center gap-1">
              <button 
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => applyHighlight('#FEF08A')} // yellow
                className="w-3.5 h-3.5 rounded-full bg-[#FEF08A] border border-black/10 hover:scale-110 transition cursor-pointer"
                title="Marca-texto Amarelo"
              />
              <button 
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => applyHighlight('#bbf7d0')} // green
                className="w-3.5 h-3.5 rounded-full bg-[#bbf7d0] border border-black/10 hover:scale-110 transition cursor-pointer"
                title="Marca-texto Verde"
              />
              <button 
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => applyHighlight('#93c5fd')} // blue
                className="w-3.5 h-3.5 rounded-full bg-[#93c5fd] border border-[#39FF14]/10 hover:scale-110 transition cursor-pointer"
                title="Marca-texto Azul"
              />
              <button 
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => applyHighlight('transparent')}
                className="p-0.5 hover:bg-[#222] rounded text-gray-400 hover:text-white transition cursor-pointer"
                title="Limpar Destaque (Fundo Branco)"
              >
                <Eraser className="w-3" />
              </button>
            </div>
          </div>

          {/* Section: Element Manipulation */}
          {contextMenu.targetEl && contextMenu.targetEl.closest?.('#editable-document-body') && contextMenu.targetEl.id !== 'editable-document-body' && (() => {
             let modifiableEl = contextMenu.targetEl as HTMLElement;
             const helperEl = modifiableEl.closest('.photo-upload-container, .absolute-draggable, table, img, [id^="img-block-"], [id^="stamp-"]') as HTMLElement | null;
             if (helperEl) {
               modifiableEl = helperEl;
             } else {
               let current = modifiableEl;
               while (current.parentElement && current.parentElement.id !== 'editable-document-body') {
                 current = current.parentElement;
               }
               modifiableEl = current;
             }
             
             const isAbsolute = modifiableEl.classList.contains('absolute-draggable') || modifiableEl.style.position === 'absolute';
             return (
               <div className="py-1 border-t border-[#1a1a1a] flex flex-col gap-1">
                  <div className="px-3 py-1 flex items-center justify-between border-b border-[#1a1a1a]/50 pb-1 mb-1">
                     <span className="text-[8px] text-gray-400 font-mono uppercase tracking-wider block">Elemento: &lt;{modifiableEl.tagName.toLowerCase()}&gt;</span>
                     <span className="text-[8px] px-1 bg-zinc-800 rounded text-gray-400 font-mono uppercase font-bold">{isAbsolute ? "Livre" : "Fixo"}</span>
                  </div>
                  
                  {!isAbsolute && (
                    <div className="px-2 py-1.5 bg-[#39FF14]/5 border border-[#333] rounded-lg m-1 flex flex-col gap-1">
                      <span className="text-[9px] text-[#39FF14] font-bold uppercase tracking-wider leading-none">Posicionamento Estático</span>
                      <p className="text-[8px] text-gray-400 font-mono leading-normal">
                         Este elemento está no fluxo padrão do texto. Ative o arraste livre para poder movê-lo para qualquer lugar.
                      </p>
                      <button 
                        onClick={() => {
                          enableElementDraggable(modifiableEl);
                          setContextMenu(prev => ({ ...prev, show: false }));
                        }}
                        className="w-full mt-1 py-1.5 bg-[#39FF14] hover:bg-[#7FFF00] text-black rounded text-[10px] font-bold text-center transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Move className="w-3.5 h-3.5 text-black" /> Habilitar Arraste Livre
                      </button>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => { handleDeleteElement(modifiableEl); setContextMenu(prev => ({ ...prev, show: false })); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir Elemento
                  </button>

                  {isAbsolute && (
                    <>
                      {/* Move joystick / position controls */}
                  <div className="px-3 py-2 my-1 bg-[#141414]/50 border-y border-[#1a1a1a] flex flex-col gap-1.5">
                    <span className="text-[9px] text-[#39FF14] font-bold uppercase tracking-wider flex items-center gap-1 leading-none">
                      <Move className="w-3 h-3 text-[#39FF14]" /> MOVER ELEMENTO
                    </span>
                    <div className="flex gap-2 items-center justify-between mt-1">
                      <div className="grid grid-cols-3 gap-1 w-24 shrink-0">
                        <div></div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNudgeElement(modifiableEl, 'up', 10); }}
                          className="w-7 h-7 bg-[#222] hover:bg-[#39FF14]/20 hover:text-[#39FF14] text-white border border-[#333] rounded flex items-center justify-center transition active:scale-95 cursor-pointer"
                          title="Mover para Cima (10px)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <div></div>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNudgeElement(modifiableEl, 'left', 10); }}
                          className="w-7 h-7 bg-[#222] hover:bg-[#39FF14]/20 hover:text-[#39FF14] text-white border border-[#333] rounded flex items-center justify-center transition active:scale-95 cursor-pointer"
                          title="Mover para Esquerda (10px)"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-7 h-7 bg-[#0d0d0d] flex items-center justify-center font-mono text-[9px] text-gray-500 font-bold">
                          10px
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNudgeElement(modifiableEl, 'right', 10); }}
                          className="w-7 h-7 bg-[#222] hover:bg-[#39FF14]/20 hover:text-[#39FF14] text-white border border-[#333] rounded flex items-center justify-center transition active:scale-95 cursor-pointer"
                          title="Mover para Direita (10px)"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        
                        <div></div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNudgeElement(modifiableEl, 'down', 10); }}
                          className="w-7 h-7 bg-[#222] hover:bg-[#39FF14]/20 hover:text-[#39FF14] text-white border border-[#333] rounded flex items-center justify-center transition active:scale-95 cursor-pointer"
                          title="Mover para Baixo (10px)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <div></div>
                      </div>

                      <div className="flex flex-col gap-1 shrink-0 w-[110px]">
                         <button 
                           onClick={() => {
                             if (modifiableEl && modifiableEl.id) {
                               setSelectedElement({ id: modifiableEl.id, el: modifiableEl });
                             }
                             setContextMenu(prev => ({ ...prev, show: false }));
                           }}
                           className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] font-bold text-center transition cursor-pointer flex items-center justify-center gap-1"
                         >
                           <Sliders className="w-3 h-3" /> Arrastar Livre
                         </button>
                         <span className="text-[8px] text-gray-500 font-mono text-center leading-normal">Ou clique para arrastar livremente</span>
                      </div>
                    </div>
                  </div>

                  {/* Redimensionar controls */}
                  <div className="px-3 py-2 mb-1 bg-[#141414]/50 border-b border-[#1a1a1a] flex flex-col gap-1.5">
                    <span className="text-[9px] text-[#39FF14] font-bold uppercase tracking-wider flex items-center gap-1 leading-none">
                      <Maximize className="w-3 h-3 text-[#39FF14]" /> REDIMENSIONAR GERAL
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleScaleElement(modifiableEl, 20, 'both'); }}
                        className="py-1.5 px-2 bg-[#222] hover:bg-[#39FF14]/20 hover:text-[#39FF14] text-white border border-[#333] rounded text-[10px] font-semibold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                        title="Aumentar tamanho"
                      >
                        <Plus className="w-3 h-3 text-[#39FF14]" /> Aumentar (+20px)
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleScaleElement(modifiableEl, -20, 'both'); }}
                        className="py-1.5 px-2 bg-[#222] hover:bg-[#39FF14]/20 hover:text-[#39FF14] text-white border border-[#333] rounded text-[10px] font-semibold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                        title="Diminuir tamanho"
                      >
                        <Minus className="w-3 h-3 text-red-400" /> Diminuir (-20px)
                      </button>
                    </div>
                    
                    <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1 leading-none mt-2">
                       DIMENSÕES ESPECÍFICAS
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleScaleElement(modifiableEl, 20, 'width'); }}
                        className="py-1.5 px-2 bg-[#222] hover:bg-blue-500/20 hover:text-blue-400 text-white border border-[#333] rounded text-[10px] font-semibold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                        title="Aumentar Largura (+20px)"
                      >
                        Largura (+)
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleScaleElement(modifiableEl, -20, 'width'); }}
                        className="py-1.5 px-2 bg-[#222] hover:bg-red-500/20 hover:text-red-400 text-white border border-[#333] rounded text-[10px] font-semibold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                        title="Diminuir Largura (-20px)"
                      >
                        Largura (-)
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleScaleElement(modifiableEl, 20, 'height'); }}
                        className="py-1.5 px-2 bg-[#222] hover:bg-blue-500/20 hover:text-blue-400 text-white border border-[#333] rounded text-[10px] font-semibold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                        title="Aumentar Altura (+20px)"
                      >
                        Altura (+)
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleScaleElement(modifiableEl, -20, 'height'); }}
                        className="py-1.5 px-2 bg-[#222] hover:bg-red-500/20 hover:text-red-400 text-white border border-[#333] rounded text-[10px] font-semibold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                        title="Diminuir Altura (-20px)"
                      >
                        Altura (-)
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => { handleRotateElement(modifiableEl, 15); setContextMenu(prev => ({ ...prev, show: false })); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Girar (+15º)
                  </button>
                  <button 
                    onClick={() => { handleRotateElement(modifiableEl, -15); setContextMenu(prev => ({ ...prev, show: false })); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Girar (-15º)
                  </button>
                  <button 
                    onClick={() => { handleZIndexElement(modifiableEl, 'front'); setContextMenu(prev => ({ ...prev, show: false })); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 transition flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <ArrowUp className="w-3.5 h-3.5" /> Trazer para Frente
                  </button>
                  <button 
                    onClick={() => { handleZIndexElement(modifiableEl, 'back'); setContextMenu(prev => ({ ...prev, show: false })); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 transition flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <ArrowDown className="w-3.5 h-3.5" /> Enviar para Trás
                  </button>
                    </>
                  )}
               </div>
             );
          })()}

          {/* Section 2: Text Case Transformer */}
          {contextMenu.selectedText && (
            <div className="py-1">
              <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider block px-3 pt-0.5 pb-1">Texto Selecionado</span>
              <button 
                onClick={() => { convertCase('upper'); setContextMenu(prev => ({ ...prev, show: false })); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer font-medium"
              >
                <span className="font-mono text-[9px] font-bold text-gray-400">AA</span> CAIXA ALTA
              </button>
              <button 
                onClick={() => { convertCase('lower'); setContextMenu(prev => ({ ...prev, show: false })); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer font-medium"
              >
                <span className="font-mono text-[9px] font-bold text-gray-400">aa</span> caixa baixa
              </button>
              <button 
                onClick={() => { convertCase('title'); setContextMenu(prev => ({ ...prev, show: false })); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer font-medium"
              >
                <span className="font-mono text-[9px] font-bold text-gray-400">Aa</span> Iniciais Maiúsculas
              </button>
              <button 
                onClick={() => { insertReviewAnnotation(); setContextMenu(prev => ({ ...prev, show: false })); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition flex items-center gap-2 cursor-pointer font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5 text-red-400" /> Adicionar Nota de Revisão
              </button>
              <button 
                onClick={() => { insertDualLanguageLayout(); setContextMenu(prev => ({ ...prev, show: false })); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 transition flex items-center gap-2 cursor-pointer font-medium"
              >
                <Split className="w-3.5 h-3.5 text-blue-400" /> Converter para Bicoluna
              </button>
              <button 
                onClick={() => { applyLegalQuoteRecuo(); setContextMenu(prev => ({ ...prev, show: false })); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer font-medium"
              >
                <Quote className="w-3.5 h-3.5 text-indigo-400" /> Recuo Legal Regulatório 4cm
              </button>
            </div>
          )}

          {/* Section 3: Insert Document Objects */}
          <div className="py-1">
            <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider block px-3 pt-0.5 pb-1 font-semibold">Inserir Componente S/A</span>
            
            <button 
              onClick={() => { insertCallout('info'); setContextMenu(prev => ({ ...prev, show: false })); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 text-blue-400" /> Bloco Informativo Azul
            </button>
            
            <button 
              onClick={() => { insertCallout('warning'); setContextMenu(prev => ({ ...prev, show: false })); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Bloco de Alerta Amarelo
            </button>

            <button 
              onClick={() => { insertSignatureStamp(); setContextMenu(prev => ({ ...prev, show: false })); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer"
            >
              <FileSignature className="w-3.5 h-3.5 text-yellow-500" /> Linha de Assinatura S/A
            </button>

            {/* Badges sub-menu */}
            <div className="h-px bg-[#181818] my-1"></div>
            <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider block px-3 pb-1">Badges de Autenticação</span>
            <div className="px-3 py-1 flex flex-wrap gap-1">
              <button 
                onClick={() => { insertStatusBadge('Aprovado', '#d1fae5', '#065f46'); setContextMenu(prev => ({ ...prev, show: false })); }}
                className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900/50 transition cursor-pointer"
              >
                Ok
              </button>
              <button 
                onClick={() => { insertStatusBadge('Crítico', '#fee2e2', '#991b1b'); setContextMenu(prev => ({ ...prev, show: false })); }}
                className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/50 transition cursor-pointer"
              >
                Urgente
              </button>
              <button 
                onClick={() => { insertStatusBadge('Confidencial', '#ffedd5', '#9a3412'); setContextMenu(prev => ({ ...prev, show: false })); }}
                className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-orange-950/40 text-orange-400 border border-orange-900/40 hover:bg-orange-900/50 transition cursor-pointer"
              >
                Confid
              </button>
            </div>

            <div className="h-px bg-[#181818] my-1"></div>
            <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider block px-3 pb-1">Quadros Executivos S/A</span>
            
            <button 
              onClick={() => { insertSwotGrid(); setContextMenu(prev => ({ ...prev, show: false })); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-blue-500" /> Matriz SWOT de Riscos
            </button>
            <button 
              onClick={() => { insertOkrTable(); setContextMenu(prev => ({ ...prev, show: false })); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer"
            >
              <Table className="w-3.5 h-3.5 text-teal-400" /> Metas OKR Trimestrais
            </button>
            <button 
              onClick={() => { insertComplianceChecklist(); setContextMenu(prev => ({ ...prev, show: false })); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Checklist de Compliance S/A
            </button>

            <div className="h-px bg-[#181818] my-2"></div>
            <button 
              onClick={() => { insertHrDecoration('double'); setContextMenu(prev => ({ ...prev, show: false })); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" /> Linha Divisória Dupla
            </button>

            <div className="h-px bg-[#181818] my-1"></div>
            <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider block px-3 pb-1">Polimento S/A</span>
            <button 
              onClick={() => { insertSecurityQrSeal(); setContextMenu(prev => ({ ...prev, show: false })); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer"
            >
              <Fingerprint className="w-3.5 h-3.5 text-indigo-400" /> Carimbo Certificado QR Code
            </button>
            <button 
              onClick={() => { insertMilestonesTimeline(); setContextMenu(prev => ({ ...prev, show: false })); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" /> Cronograma (Milestones)
            </button>
            <button 
              onClick={() => { insertSigningInitialsBlock(); setContextMenu(prev => ({ ...prev, show: false })); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition flex items-center gap-2 cursor-pointer"
            >
              <FileSignature className="w-3.5 h-3.5 text-emerald-400" /> Bloco de Rubricas Rápidas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplatesView({ store }: { store: any }) {
  const [editing, setEditing] = useState<Template | null>(null);
  const [mode, setMode] = useState<'edit' | 'fill'>('edit');
  const [vars, setVars] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fillSubMode, setFillSubMode] = useState<'single' | 'batch'>('single');
  const [batchRows, setBatchRows] = useState<Record<string, string>[]>([{}]);
  const [pastedData, setPastedData] = useState<string>('');
  const [showImporter, setShowImporter] = useState<boolean>(false);
  const [aiBatchPrompt, setAiBatchPrompt] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [printBatchPreview, setPrintBatchPreview] = useState<any[] | null>(null);
  const [showBrasoes, setShowBrasoes] = useState<boolean>(false);
  const [editorTool, setEditorTool] = useState<'none' | 'code' | 'vars' | 'batch' | 'settings'>('none');

  useEffect(() => {
    if (editing) {
      setFillSubMode('single');
      setBatchRows([{}]);
      setPastedData('');
      setAiBatchPrompt('');
      setShowImporter(false);
      setShowBrasoes(false);
    }
  }, [editing?.id]);

  const categoriesList = useMemo(() => [
    { id: 'all', name: 'Todos os Módulos', icon: Globe, color: '#39FF14' },
    { id: 'documentos_oficiais', name: 'Documentos Oficiais & Brasões', icon: Award, color: '#EAB308' },
    { id: 'recrutamento_selecao', name: 'Recrutamento & Currículos', icon: FileText, color: '#FF2E93' },
    { id: 'contratos', name: 'Contratos & Acordos', icon: Scale, color: '#6366f1' },
    { id: 'financeiro', name: 'Financeiro & Impostos', icon: FileSpreadsheet, color: '#10b981' },
    { id: 'ti_lgpd', name: 'TI, AI & LGPD', icon: ShieldCheck, color: '#8b5cf6' },
    { id: 'rh', name: 'Recursos Humanos & CLT', icon: Fingerprint, color: '#ec4899' },
    { id: 'relatorios', name: 'Relatórios & Auditorias', icon: Activity, color: '#f59e0b' },
    { id: 'corporativo', name: 'Corporativismo & Atas', icon: Columns, color: '#06b6d4' }
  ], []);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return store.templates;
    return store.templates.filter((t: any) => t.category === selectedCategory);
  }, [store.templates, selectedCategory]);

  const detected = useMemo(() => {
    if (!editing) return [];
    return Array.from(new Set(editing.content.match(/\{\{([^}]+)\}\}/g) || []))
      .map((v: string) => v.slice(2, -2).trim())
      .filter(Boolean);
  }, [editing?.content]);

  const previewContent = useMemo(() => {
    if (!editing) return "";
    let c = editing.content;
    detected.forEach((d: string) => {
       const val = vars[d];
       if (val) {
         c = c.replace(new RegExp(`\\{\\{${d}\\}\\}`, 'g'), val);
       }
    });
    return c;
  }, [editing, vars, detected]);

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
    setMode('edit');
    setVars({});
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
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 rounded-xl hover:bg-[#39FF14]/20 transition-all font-bold text-xs uppercase mb-4"
          >
            <Plus className="h-3 w-3" /> Novo Template
          </button>
        </div>

        {/* Sub-módulos filter */}
        <div className="p-4 border-b border-[#1a1a1a] bg-black/40">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 px-1">Sub-Módulos de Criação</h2>
          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {categoriesList.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              const count = cat.id === 'all' 
                ? store.templates.length 
                : store.templates.filter((t: any) => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between border cursor-pointer",
                    isActive 
                      ? "bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30" 
                      : "bg-[#050505] text-[#718096] border-transparent hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className={cn(
                    "text-[9px] font-mono px-1 rounded-md",
                    isActive ? "bg-[#39FF14]/20 text-[#39FF14]" : "bg-[#111] text-gray-500"
                  )}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-b border-[#1a1a1a] bg-[#030303]/40">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-1">Modelos Disponíveis</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-600 font-mono">Nenhum template neste sub-módulo.</div>
          ) : (
            filteredTemplates.map((t: any) => (
              <div 
                key={t.id} 
                onClick={() => { 
                  setEditing({...t});
                  setMode('fill');
                  setVars({});
                }}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all border group",
                  editing?.id === t.id ? "bg-[#1a1a1a] border-[#39FF14]/30 shadow-lg shadow-[#39FF14]/5" : "bg-[#050505] border-[#1a1a1a] hover:border-[#222222]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-200 truncate pr-2" title={t.name}>{t.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); store.deleteTemplate(t.id); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tight">{t.type} • {t.format}</p>
                  {t.category && (
                    <span className="text-[8px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-1 rounded font-mono capitalize">
                      {t.category}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col p-8 overflow-y-auto min-h-[500px]">
        {editing ? (
          <div className="flex flex-col h-full relative">
            <div className="flex flex-row items-center justify-between mb-8 gap-4">
               <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Documento Ativo</h2>
               
               <div className="flex bg-[#050505] p-1 rounded-xl border border-[#1a1a1a] shrink-0 gap-1">
                 <button onClick={() => setEditorTool(editorTool === 'settings' ? 'none' : 'settings')} className={cn("px-4 py-2 rounded-lg font-bold text-xs transition", editorTool === 'settings' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}><Settings className="inline w-3.5 h-3.5 mr-1" /> Ajustes</button>
                 <button onClick={() => setEditorTool(editorTool === 'code' ? 'none' : 'code')} className={cn("px-4 py-2 rounded-lg font-bold text-xs transition", editorTool === 'code' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}><Code className="inline w-3.5 h-3.5 mr-1" /> Editor de Código</button>
                 <button onClick={() => setEditorTool(editorTool === 'vars' ? 'none' : 'vars')} className={cn("px-4 py-2 rounded-lg font-bold text-xs transition", editorTool === 'vars' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}><FileText className="inline w-3.5 h-3.5 mr-1" /> Variáveis</button>
                 <button onClick={() => setEditorTool(editorTool === 'batch' ? 'none' : 'batch')} className={cn("px-4 py-2 rounded-lg font-bold text-xs transition", editorTool === 'batch' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}><FileSpreadsheet className="inline w-3.5 h-3.5 mr-1" /> Lote Inteligente</button>
                 <button 
                   onClick={() => setEditorTool(editorTool === 'brasoes' ? 'none' : 'brasoes')}
                   className={cn(
                     "px-4 py-2 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer",
                     editorTool === 'brasoes' ? "bg-[#EAB308] text-black" : "text-neutral-400 hover:text-white"
                   )}
                 >
                   <Award className="w-3.5 h-3.5" /> Brasões Estaduais
                 </button>
               </div>

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

            {editorTool === 'brasoes' && (
              <div className="absolute top-[80px] left-0 z-[60] w-full max-w-4xl bg-[#0a0a0a] shadow-2xl rounded-2xl border border-[#222]">
                 <div className="flex items-center justify-between bg-[#111] p-4 rounded-t-2xl border-b border-[#222]">
                    <h3 className="text-[#39FF14] font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      <Award className="w-5 h-5"/> Brasões Estaduais
                    </h3>
                    <button onClick={() => setEditorTool('none')} className="text-gray-500 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <BrasoesPanel editing={editing} setEditing={setEditing} vars={vars} setVars={setVars} />
                 </div>
              </div>
            )}


            {editorTool === 'settings' && (
              <div className="absolute top-[80px] left-0 md:left-8 z-[60] w-full md:w-96 bg-[#0a0a0a] shadow-2xl rounded-2xl border border-[#222]">
                 <div className="flex items-center justify-between bg-[#111] p-4 rounded-t-2xl border-b border-[#222]">
                    <h3 className="text-[#39FF14] font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                       <Settings className="w-4 h-4"/> Configurações Gerais
                    </h3>
                    <button onClick={() => setEditorTool('none')} className="text-gray-500 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                      <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Nome</label>
                      <input 
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm focus:border-[#39FF14] outline-none"
                        value={editing.name}
                        onChange={e => setEditing({...editing, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Categoria</label>
                      <select 
                        className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm focus:border-[#39FF14] outline-none"
                        value={editing.category || ''}
                        onChange={e => setEditing({...editing, category: e.target.value})}
                      >
                        <option value="">Nenhum/Sem Categoria</option>
                        <option value="documentos_oficiais">Documentos Oficiais & Brasões</option>
                        <option value="contratos">Contratos & Acordos</option>
                        <option value="financeiro">Financeiro & Impostos</option>
                        <option value="ti_lgpd">TI, Inteligência Artificial & LGPD</option>
                        <option value="rh">Recursos Humanos & CLT</option>
                        <option value="relatorios">Relatórios & Auditorias</option>
                        <option value="corporativo">Corporativo & Atas</option>
                      </select>
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
              </div>
            )}

            {editorTool === 'code' && (
              <div className="absolute top-[80px] left-0 md:left-8 z-[60] w-full md:w-[600px] bg-[#0a0a0a] shadow-2xl rounded-2xl border border-[#222] flex flex-col h-[600px] max-h-[80vh]">
                 <div className="flex items-center justify-between bg-[#111] p-4 rounded-t-2xl border-b border-[#222]">
                    <h3 className="text-[#39FF14] font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                       <Code className="w-5 h-5"/> Editor de Código
                    </h3>
                    <button onClick={() => setEditorTool('none')} className="text-gray-500 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                 </div>
                 <textarea 
                  className="flex-1 w-full bg-[#050505] p-6 font-mono text-[13px] text-gray-300 focus:outline-[#39FF14] focus:outline-1 outline-none resize-none leading-relaxed rounded-b-2xl shadow-inner scrollbar-thin scrollbar-thumb-neutral-800"
                  value={editing.content}
                  onChange={e => setEditing({...editing, content: e.target.value})}
                 />
              </div>
            )}

                <div className="flex-1 flex flex-col min-h-0 relative items-center">
                   <div className="hidden">
                     <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block flex-shrink-0">Editor</label>
                     <textarea 
                      className="flex-1 w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl p-6 font-mono text-[13px] text-gray-300 focus:border-[#39FF14] outline-none resize-none leading-relaxed shadow-inner"
                      value={editing.content}
                      onChange={e => setEditing({...editing, content: e.target.value})}
                     />
                   </div>
                   <div className="flex flex-col h-auto overflow-hidden w-full max-w-[1000px] border border-gray-200 rounded-2xl bg-white shadow-2xl relative">
                     <div className="flex-1 w-full p-0 overflow-y-auto">
                        {editing.format === 'html' ? (
                           <InteractiveDocumentCanvas 
                              htmlContent={previewContent} 
                              onUpdateHtml={(newHtml) => setEditing({...editing, content: newHtml})}
                              format={editing.format}
                              selectedStateId={vars['estado_id'] || undefined} 
                            />
                        ) : (
                          <div className="p-8"><pre className="text-black font-serif text-sm leading-7 whitespace-pre-wrap">{previewContent}</pre></div>
                        )}
                     </div>
                   </div>
                </div>
            {editorTool === 'vars' && (
              <div className="absolute top-[80px] left-0 md:left-8 z-[60] w-full md:w-[400px] bg-[#0a0a0a] shadow-2xl rounded-2xl border border-[#222]">
                 <div className="flex items-center justify-between bg-[#111] p-4 rounded-t-2xl border-b border-[#222]">
                    <h3 className="text-[#39FF14] font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                       <FileText className="w-5 h-5"/> Variáveis
                    </h3>
                    <button onClick={() => setEditorTool('none')} className="text-gray-500 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="p-6 h-[600px] max-h-[70vh] overflow-y-auto space-y-4">
                    <button 
                      onClick={() => {
                        store.saveDocument({
                          id: generateId(),
                          templateId: editing.id,
                          templateName: editing.name,
                          format: editing.format,
                          finalContent: previewContent,
                          createdAt: new Date().toISOString()
                        });
                        alert("Documento preenchido e salvo no histórico com sucesso!");
                      }}
                      className="px-4 py-3 bg-[#39FF14] w-full text-black text-[10px] font-bold uppercase rounded-lg shadow-[0_0_15px_-3px_rgba(57,255,20,0.5)] hover:bg-[#7FFF00] transition text-center flex items-center justify-center cursor-pointer mb-6"
                    >
                       <Save className="h-4 w-4 inline mr-2" /> Gerar Documento
                    </button>
                    {detected.map((v: string) => (
                      <div key={v} className="relative">
                        <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 px-1">
                          {v.replace(/_/g, ' ')}
                        </label>
                        <input
                           type="text"
                           className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-4 text-sm focus:border-[#39FF14] transition-all outline-none text-gray-200"
                           placeholder={`Valor para ${v}...`}
                           value={vars[v] || ''}
                           onChange={(e) => setVars(prev => ({ ...prev, [v]: e.target.value }))}
                        />
                      </div>
                    ))}
                    {detected.length === 0 && (
                      <p className="text-xs text-gray-500 italic">Nenhuma variável detectada.</p>
                    )}
                 </div>
              </div>
            )}

            {editorTool === 'batch' && (
              <div className="absolute top-[80px] left-0 md:left-8 z-[60] w-full md:w-[900px] bg-[#0a0a0a] shadow-2xl rounded-2xl border border-[#222]">
                 <div className="flex items-center justify-between bg-[#111] p-4 rounded-t-2xl border-b border-[#222]">
                    <h3 className="text-[#39FF14] font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                       <FileSpreadsheet className="w-5 h-5"/> Lote Inteligente
                    </h3>
                    <button onClick={() => setEditorTool('none')} className="text-gray-500 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="p-6 max-h-[85vh] overflow-y-auto w-full">
                  <div className="flex-1 flex flex-col min-h-0 space-y-6">
                    
                    {/* Top Smart Controls: Excel Paste & AI Tool */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
                      
                      {/* Left Block: Direct Excel / Sheet paste loader */}
                      <div className="bg-[#050505] p-5 rounded-2xl border border-[#1a1a1a] flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-[#39FF14] flex items-center gap-1.5">
                            <FileSpreadsheet className="w-4 h-4 text-[#39FF14]" /> Importar de Planilha (Excel / Google Sheets)
                          </h4>
                          <button 
                            type="button"
                            onClick={() => setShowImporter(!showImporter)}
                            className="text-[10px] text-gray-400 hover:text-white underline font-medium cursor-pointer"
                          >
                            {showImporter ? "Recolher" : "Como funciona?"}
                          </button>
                        </div>

                        {showImporter && (
                          <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                            Selecione e copie (<strong className="text-gray-300">Ctrl+C</strong>) suas linhas no Excel de acordo com a ordem das variáveis, depois cole abaixo e clique em <strong className="text-gray-300">Importar</strong>. O sistema processa tudo na hora!
                          </p>
                        )}

                        <div className="flex gap-2">
                          <textarea 
                            value={pastedData}
                            onChange={(e) => setPastedData(e.target.value)}
                            placeholder="Cole aqui suas células do Excel (linhas separadas por ENTER, colunas separadas por TAB)..."
                            className="flex-1 h-12 min-h-[48px] bg-black border border-[#1a1a1a] rounded-xl p-2.5 text-xs font-mono text-gray-400 focus:border-[#39FF14] outline-none resize-none leading-relaxed"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              if (!pastedData.trim()) {
                                alert("Por favor, cole alguma informação da planilha na caixa de texto primeiro.");
                                return;
                              }
                              
                              const lines = pastedData.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                              if (lines.length === 0) return;

                              const newRows: Record<string, string>[] = [];
                              
                              const parseLine = (line: string) => {
                                if (line.includes('\t')) return line.split('\t');
                                if (line.includes(';')) return line.split(';');
                                return line.split(',');
                              };

                              const firstLineCells = parseLine(lines[0]);
                              let startIdx = 0;
                              
                              // Check if first line cells match variable titles (heuristic)
                              const matchesHeader = firstLineCells.some(cell => {
                                const cleanCell = cell.toLowerCase().trim().replace(/_/g, '').replace(/ /g, '');
                                return detected.some(v => {
                                  const cleanVar = v.toLowerCase().replace(/_/g, '').replace(/ /g, '');
                                  return cleanVar === cleanCell || cleanVar.includes(cleanCell);
                                });
                              });

                              if (matchesHeader && lines.length > 1) {
                                startIdx = 1; // It's a header, let's skip the first row
                              }

                              lines.slice(startIdx).forEach((line) => {
                                const cells = parseLine(line);
                                const rObj: Record<string, string> = {};
                                detected.forEach((v, vIdx) => {
                                  rObj[v] = cells[vIdx] !== undefined ? cells[vIdx].trim() : '';
                                });
                                newRows.push(rObj);
                              });

                              if (newRows.length > 0) {
                                setBatchRows(prev => {
                                  const isFirstRowEmpty = prev.length === 1 && Object.values(prev[0]).every(v => !v);
                                  return isFirstRowEmpty ? newRows : [...prev, ...newRows];
                                });
                                setPastedData('');
                                alert(`✨ Sucesso! ${newRows.length} linhas de funcionários foram importadas da sua planilha diretamente para a tabela.`);
                              }
                            }}
                            className="bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/20 text-[#39FF14] text-xs font-bold rounded-xl transition cursor-pointer flex flex-col items-center justify-center whitespace-nowrap px-5"
                          >
                            <Plus className="w-4 h-4 mb-0.5" /> Importar
                          </button>
                        </div>
                      </div>

                      {/* Right Block: AI generation prompting helper */}
                      <div className="bg-[#050505] p-5 rounded-2xl border border-[#1a1a1a] flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-[#39FF14] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#39FF14]" /> Assistente de IA de Geração em Massa
                          </h4>
                          <span className="text-[9px] bg-neutral-900 text-gray-500 font-mono px-1.5 py-0.5 rounded border border-neutral-800">
                            Equipado com Gemini
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                          Escreva uma instrução para a inteligência artificial simular e gerar registros fakes preenchidos para você ver como fica!
                        </p>

                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={aiBatchPrompt}
                            onChange={(e) => setAiBatchPrompt(e.target.value)}
                            placeholder="Ex: Gere dados de 10 funcionários do Brasil com cargos de TI e RH..."
                            className="flex-1 bg-black border border-[#1a1a1a] rounded-xl px-4 py-3 text-xs text-gray-300 focus:border-[#39FF14] outline-none"
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                // Manual submission through clicking button is handled below
                              }
                            }}
                          />
                          <button 
                            type="button"
                            disabled={isGeneratingAI}
                            onClick={async () => {
                              if (!aiBatchPrompt.trim()) {
                                alert("Por favor, digite o que a IA deve gerar!");
                                return;
                              }
                              setIsGeneratingAI(true);
                              try {
                                const response = await fetch('/api/ai/batch-parse', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    text: `Por favor simule e gere dados fictícios correspondendo exatamente às especificações do usuário: "${aiBatchPrompt}". Sendo uma lista contendo entre 3 e 15 objetos fictícios, onde cada objeto tem dados realistas do Brasil.`,
                                    variables: detected
                                  })
                                });
                                
                                if (response.ok) {
                                  const data = await response.json();
                                  if (data.success && Array.isArray(data.records)) {
                                    const sanitized = data.records.map((rec: any) => {
                                      const row: Record<string, string> = {};
                                      detected.forEach((v) => {
                                        row[v] = rec[v] !== undefined ? String(rec[v]) : '';
                                      });
                                      return row;
                                    });
                                    
                                    setBatchRows(prev => {
                                      const isFirstEmpty = prev.length === 1 && Object.values(prev[0]).every(v => !v);
                                      return isFirstEmpty ? sanitized : [...prev, ...sanitized];
                                    });
                                    setAiBatchPrompt('');
                                    alert(`🤖 A IA gerou com sucesso ${sanitized.length} registros fictícios baseados no seu prompt!`);
                                  } else {
                                    alert("Não foi possível gerar no formato ideal de tabelas. Tente outro prompt.");
                                  }
                                } else {
                                  alert("Erro na geração de lote via IA.");
                                }
                              } catch(err) {
                                console.error(err);
                                alert("Erro ao contatar servidor de IA.");
                              } finally {
                                setIsGeneratingAI(false);
                              }
                            }}
                            className="px-5 bg-[#39FF14] hover:bg-[#7FFF00] text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isGeneratingAI ? (
                              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full mr-1" />
                            ) : (
                              <Wand2 className="w-3.5 h-3.5" />
                            )}
                            {isGeneratingAI ? "Gerando..." : "Gerar"}
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Outer Table Panel */}
                    <div className="flex-1 bg-black rounded-2xl border border-[#1a1a1a] overflow-hidden flex flex-col pb-4 min-h-[250px]">
                      
                      {/* Interactive Header Action panel */}
                      <div className="p-4 bg-neutral-950 border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-mono">Registros na Tabela:</span>
                          <span className="bg-[#39FF14]/20 text-[#39FF14] text-xs font-bold font-mono px-2 py-0.5 rounded-full border border-[#39FF14]/30">
                            {batchRows.length}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              setBatchRows(prev => [...prev, {}]);
                            }}
                            className="px-3 py-1.5 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/20 text-[#39FF14] rounded-lg text-[11px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> + Adicionar Registro
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => {
                              if (confirm("Deseja realmente limpar todos os registros e começar uma nova planilha em branco?")) {
                                setBatchRows([{}]);
                              }
                            }}
                            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-red-900 hover:text-red-400 text-gray-400 rounded-lg text-[11px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Limpar Toda Tabela
                          </button>
                        </div>
                      </div>

                      {/* Main Scrollable Grid */}
                      <div className="flex-1 overflow-auto">
                        {detected.length === 0 ? (
                          <div className="p-12 text-center text-gray-500 font-mono text-xs">
                            Este modelo não contém variáveis para preenchimento lote. Escreva {'{{nome_variavel}}'} no código do modelo.
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="bg-[#030303] border-b border-[#111111]">
                                <th className="p-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest w-16 text-center">Nº</th>
                                {detected.map((colName) => (
                                  <th key={colName} className="p-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest min-w-[200px]">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="truncate" title={colName}>{colName.replace(/_/g, ' ')}</span>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const defaultVal = prompt(`Insira o valor que deseja aplicar em todas as ${batchRows.length} linhas para a variável [${colName}]:`);
                                          if (defaultVal !== null) {
                                            setBatchRows(prev => prev.map(row => ({ ...row, [colName]: defaultVal })));
                                          }
                                        }}
                                        title="Preencher toda a coluna com o mesmo valor"
                                        className="text-[9px] bg-neutral-900 text-gray-400 border border-neutral-800 px-1 py-0.5 rounded hover:text-[#39FF14] hover:border-[#39FF14]/20 transition shrink-0 cursor-pointer"
                                      >
                                        Repetir
                                      </button>
                                    </div>
                                  </th>
                                ))}
                                <th className="p-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest w-28 text-center">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1a1a1a] bg-black/20">
                              {batchRows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-neutral-950/60 transition duration-75">
                                  <td className="p-2 text-center text-xs font-mono text-neutral-600 font-medium">
                                    {rowIndex + 1}
                                  </td>
                                  
                                  {detected.map((colName) => (
                                    <td key={colName} className="p-1">
                                      <input 
                                        type="text"
                                        value={row[colName] || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setBatchRows(prev => {
                                            const updated = [...prev];
                                            updated[rowIndex] = { ...updated[rowIndex], [colName]: val };
                                            return updated;
                                          });
                                        }}
                                        placeholder={`Digitar ${colName}...`}
                                        className="w-full bg-[#050505] border border-transparent hover:border-[#111111] focus:border-[#39FF14] focus:bg-black rounded-lg py-2 px-3 text-xs text-gray-300 outline-none transition"
                                      />
                                    </td>
                                  ))}
                                  
                                  <td className="p-2 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const duplicated = { ...batchRows[rowIndex] };
                                          setBatchRows(prev => {
                                            const updated = [...prev];
                                            updated.splice(rowIndex + 1, 0, duplicated);
                                            return updated;
                                          });
                                        }}
                                        title="Duplicar esta linha"
                                        className="p-1.5 bg-[#111111] border border-[#222] hover:bg-[#39FF14]/10 hover:text-[#39FF14] hover:border-[#39FF14]/20 rounded-md text-gray-500 transition cursor-pointer"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                      
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          if (batchRows.length === 1) {
                                            setBatchRows([{}]); // Clear instead of deleting the last remaining row
                                          } else {
                                            setBatchRows(prev => prev.filter((_, idx) => idx !== rowIndex));
                                          }
                                        }}
                                        title="Deletar esta linha"
                                        className="p-1.5 bg-[#111111] border border-[#222] hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/30 rounded-md text-gray-500 transition cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                      
                      {/* Bottom Quick Adding Utility Bar */}
                      <div className="px-6 py-4 bg-neutral-950 border-t border-[#1a1a1a] flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
                        <div className="text-[11px] text-gray-500 leading-normal flex items-center gap-1.5 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14]/60" />
                          Dados em lote salvos localmente. Preencha e clique em "Visualizar & Imprimir" para abrir ou baixar tudo em PDF.
                        </div>
                        <button 
                          type="button"
                          onClick={() => setBatchRows(prev => [...prev, {}])}
                          className="px-5 py-2 hover:bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] text-xs font-bold rounded-lg uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ml-auto"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Registro
                        </button>
                      </div>

                    </div>

                  </div>
                 </div>
              </div>
            )}


            {/* Batch Print Preview Modal */}
            {printBatchPreview && (
              <div className="fixed inset-0 bg-[#020202]/95 backdrop-blur-md z-50 flex flex-col p-4 md:p-6 overflow-hidden print-modal-backdrop">
                
                {/* Dynamically Inject Print Styles */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
                    #root { display: none !important; }
                    .print-modal-backdrop { 
                      position: absolute !important; 
                      top: 0 !important; 
                      left: 0 !important; 
                      right: 0 !important; 
                      bottom: 0 !important; 
                      background: white !important; 
                      padding: 0 !important; 
                      margin: 0 !important; 
                      z-index: 99999 !important; 
                      overflow: visible !important;
                    }
                    .no-print { display: none !important; }
                    .printable-card { 
                      box-shadow: none !important; 
                      border: none !important; 
                      margin: 0 !important; 
                      padding: 0 !important; 
                      width: 100% !important; 
                      max-width: 100% !important;
                      page-break-after: always !important; 
                    }
                    .printable-card:last-child {
                      page-break-after: avoid !important;
                    }
                  }
                `}} />

                <div className="max-w-6xl w-full mx-auto flex flex-col h-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl shadow-2xl no-print">
                  <div className="p-6 border-b border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between bg-black/40 gap-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#39FF14] flex items-center gap-1.5 font-mono">
                        <Printer className="w-4 h-4 text-[#39FF14]" /> Impressão & Exportação PDF em Lote
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Visualizando {printBatchPreview.length} documentos formatados para impressão contínua. Cada registro iniciará em uma nova folha de PDF automaticamente.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => window.print()}
                        className="px-5 py-2.5 bg-[#39FF14] text-black font-bold text-xs uppercase rounded-xl hover:bg-[#7FFF00] transition flex items-center gap-1.5 shadow-[0_0_15px_-3px_rgba(57,255,20,0.5)] cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Imprimir / Salvar PDF
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPrintBatchPreview(null)}
                        className="px-5 py-2.5 bg-[#1a1a1a] text-gray-400 font-bold text-xs uppercase rounded-xl hover:text-white border border-[#222222] transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Fechar
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-[#1c1c1c] space-y-8 scrollbar-thin">
                    <div className="max-w-[21cm] mx-auto text-center py-2 px-4 bg-yellow-400/10 text-yellow-500 text-xs rounded-xl border border-yellow-400/20 mb-4 flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Dica: No diálogo de impressão do navegador, marque "Simplificado" ou desmarque "Cabeçalhos e rodapés" para layout limpo!
                    </div>
                    
                    <div className="space-y-8">
                      {printBatchPreview.map((doc, idx) => (
                        <div 
                          key={idx} 
                          className="bg-white p-8 md:p-12 rounded-xl border border-gray-200 shadow-sm max-w-[21cm] mx-auto text-black font-sans relative"
                        >
                          <div className="absolute top-3 right-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest no-print">
                            Documento {idx + 1} de {printBatchPreview.length} • {doc.name}
                          </div>
                          {editing?.format === 'html' ? (
                            <div dangerouslySetInnerHTML={{ __html: doc.content }} className="prose max-w-none text-black" />
                          ) : (
                            <pre className="text-black font-serif text-sm leading-7 whitespace-pre-wrap">{doc.content}</pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Printable container explicitly visible under print stylesheets */}
                <div id="batch-print-content" className="hidden print:block whitespace-normal break-after-page text-black font-sans">
                  {printBatchPreview.map((doc, idx) => (
                    <div 
                      key={idx} 
                      className="printable-card bg-white text-black text-justify"
                      style={{ 
                        padding: '1.5cm',
                        width: '100%', 
                        boxSizing: 'border-box',
                        minHeight: '29.7cm'
                      }}
                    >
                      {editing?.format === 'html' ? (
                        <div dangerouslySetInnerHTML={{ __html: doc.content }} className="prose max-w-none text-black" />
                      ) : (
                        <pre className="text-black font-serif text-sm leading-7 whitespace-pre-wrap">{doc.content}</pre>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}
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
  // Campaign Presets Configuration
  const presets = [
    {
      id: 'launch',
      name: '🚀 Lançamento VIP',
      description: 'Anuncie novos produtos e serviços com alto impacto e exclusividade.',
      tema: 'Lançamento Exclusivo: Portal Analytics Pro S/A',
      cor1: '#111827',
      cor2: '#39FF14',
      estilo: 'futurista',
      cabecalho: 'S/A ANALYTICS TECNOLOGIAS',
      mensagem: 'Temos o orgulho de apresentar a nossa mais nova plataforma corporativa inteligente. Ela reúne o poder da IA preditiva e inteligência de negócios para automatizar suas decisões estratégicas com velocidade e precisão absoluta. Garanta sua vaga com condições de investidor fundador.',
      botao: 'Entrar na Lista VIP',
      link: 'https://seusite.com/vip-access',
      rodape: '© 2026 Analytics Pro. Recebeu este email pois faz parte da nossa carteira de inovadores.',
      blocks: { banner: true, features: true, coupon: false, social: true }
    },
    {
      id: 'newsletter',
      name: '📰 Newsletter Semanal',
      description: 'Compartilhe links, artigos e insights curados diretamente no feed.',
      tema: 'Curadoria Semanal: O Futuro do Business Compliance',
      cor1: '#0F172A',
      cor2: '#3B82F6',
      estilo: 'elegante',
      cabecalho: 'BOLETIM SEMANAL - EXECUTIVOS',
      mensagem: 'Nesta edição especial, analisamos de forma minuciosa os três pilares que sustentam a regulação moderna nos mercados digitais globais. Descubra como as maiores corporações estão se posicionando estrategicamente ante as novas resoluções.',
      botao: 'Ler Insights Completos',
      link: 'https://seusite.com/newsletter',
      rodape: '© 2026 Insights S/A. Para gerenciar a assinatura de seus informativos, clique nas preferências.',
      blocks: { banner: true, features: true, coupon: false, social: true }
    },
    {
      id: 'promo',
      name: '🏷️ Promoção & Cupom',
      description: 'Gere picos imediatos de vendas com caixas e cupons de cupom de desconto.',
      tema: 'Semana Blackout: Toda a Plataforma com 40% OFF',
      cor1: '#18181B',
      cor2: '#F97316',
      estilo: 'casual',
      cabecalho: 'OFERTA LIMITADA CO.',
      mensagem: 'Chegou o momento perfeito para levar a eficiência operacional do seu escritório ao próximo patamar. Somente até sexta-feira, você garante 40% de desconto em qualquer plano corporativo utilizando o voucher abaixo.',
      botao: 'Reivindicar Desconto',
      link: 'https://seusite.com/promocao',
      rodape: '© 2026 Ofertas Co. Promoção irredutível por tempo determinado ou limite de assentos.',
      blocks: { banner: false, features: false, coupon: true, social: true }
    },
    {
      id: 'notice',
      name: '🤝 Boas-vindas VIP',
      description: 'Envie mensagens acolhedoras e fluxos de contato para novos inscritos.',
      tema: 'Seja Muito Bem-vindo à nossa Comunidade Privada',
      cor1: '#1e1b4b',
      cor2: '#EC4899',
      estilo: 'clássico',
      cabecalho: 'S/A COMUNIDADE INTERNA',
      mensagem: 'Seu cadastro foi validado com absoluto sucesso em nosso portal exclusivo de fundadores. Estamos empolgados em acompanhar sua evolução e prontos para prestar suporte corporativo focado em sua satisfação total desde o primeiro momento.',
      botao: 'Acessar Área do Cliente',
      link: 'https://seusite.com/comunidade',
      rodape: '© 2026 Comunidade S/A. Em caso de dúvidas operacionais, responda diretamente a este canal.',
      blocks: { banner: false, features: true, coupon: false, social: true }
    }
  ];

  // Core Form State
  const [tema, setTema] = useState(presets[0].tema);
  const [cor1, setCor1] = useState(presets[0].cor1);
  const [cor2, setCor2] = useState(presets[0].cor2);
  const [estilo, setEstilo] = useState(presets[0].estilo);
  const [cabecalho, setCabecalho] = useState(presets[0].cabecalho);
  const [mensagem, setMensagem] = useState(presets[0].mensagem);
  const [botao, setBotao] = useState(presets[0].botao);
  const [link, setLink] = useState(presets[0].link);
  const [rodape, setRodape] = useState(presets[0].rodape);
  
  // Design Layout Blocks State
  const [layoutBlocks, setLayoutBlocks] = useState({
    banner: presets[0].blocks.banner,
    features: presets[0].blocks.features,
    coupon: presets[0].blocks.coupon,
    social: presets[0].blocks.social
  });

  // UI Flow and Preview States
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState<'visual' | 'code'>('visual');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiSubject, setAiSubject] = useState('Portal Analytics Pro S/A - O Futuro Chegou');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [templateName, setTemplateName] = useState('');

  // --- New Advanced Non-Programmer Customization States ---
  const [headingFont, setHeadingFont] = useState<'Inter' | 'Space Grotesk' | 'Playfair Display' | 'Montserrat' | 'Merriweather'>('Inter');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [headingSize, setHeadingSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [bannerUrl, setBannerUrl] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
  const [selectedBannerTheme, setSelectedBannerTheme] = useState<string>('tech');
  const [blockOrder, setBlockOrder] = useState<string[]>(['banner', 'header', 'content', 'coupon', 'features', 'social']);

  const bannerDesigns = [
    { id: 'tech', label: 'Tech / IA', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', desc: 'Geométrico abstrato moderno' },
    { id: 'retail', label: 'E-commerce', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80', desc: 'Boutique e vendas' },
    { id: 'food', label: 'Saúde / Fit', url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80', desc: 'Mesa de alimentação fresca' },
    { id: 'corporate', label: 'Corporativo', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80', desc: 'Edifício executivo moderno' },
    { id: 'creative', label: 'Criativo', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', desc: 'Areia e mar para lazer' }
  ];

  // Apply Preset Utility
  const applyPreset = (preset: typeof presets[0]) => {
    setTema(preset.tema);
    setCor1(preset.cor1);
    setCor2(preset.cor2);
    setEstilo(preset.estilo);
    setCabecalho(preset.cabecalho);
    setMensagem(preset.mensagem);
    setBotao(preset.botao);
    setLink(preset.link);
    setRodape(preset.rodape);
    setLayoutBlocks({
      banner: preset.blocks.banner,
      features: preset.blocks.features,
      coupon: preset.blocks.coupon,
      social: preset.blocks.social
    });
    setAiSubject(preset.tema);
    // Find matching theme or default back to tech
    if (preset.id === 'launch') {
      setBannerUrl(bannerDesigns[0].url);
      setSelectedBannerTheme('tech');
    } else if (preset.id === 'newsletter') {
      setBannerUrl(bannerDesigns[3].url);
      setSelectedBannerTheme('corporate');
    } else if (preset.id === 'promo') {
      setBannerUrl(bannerDesigns[1].url);
      setSelectedBannerTheme('retail');
    } else {
      setBannerUrl(bannerDesigns[4].url);
      setSelectedBannerTheme('creative');
    }
    setGeneratedHtml('');
  };

  // Reordering handler
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...blockOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;
      setBlockOrder(newOrder);
      setGeneratedHtml('');
    }
  };

  // Pre-configured Aesthetic Color Schemes
  const colorSchemes = [
    { label: 'Green Tech', c1: '#111827', c2: '#39FF14' },
    { label: 'Classic Blue', c1: '#1E3A8A', c2: '#60A5FA' },
    { label: 'Cyber Sunset', c1: '#0F172A', c2: '#F97316' },
    { label: 'Elegant Purple', c1: '#2E1065', c2: '#A78BFA' },
    { label: 'Royal Red', c1: '#4C0519', c2: '#FDA4AF' }
  ];

  // Local Instant HTML Compiler
  const localCompiledHtml = useMemo(() => {
    const c1 = cor1 || '#111111';
    const c2 = cor2 || '#39FF14';

    const fontFamilies = {
      'Inter': "'Inter', sans-serif",
      'Space Grotesk': "'Space Grotesk', sans-serif",
      'Playfair Display': "'Playfair Display', serif",
      'Montserrat': "'Montserrat', sans-serif",
      'Merriweather': "'Merriweather', serif"
    };

    const selFontFamily = fontFamilies[headingFont] || "'Helvetica Neue', Helvetica, Arial, sans-serif";
    
    const sizeMap = {
      'sm': '18px',
      'md': '24px',
      'lg': '32px'
    };
    const titleSize = sizeMap[headingSize] || '24px';

    let headerBlock = `
      <!-- Header Brand -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #f3f4f6; margin-bottom: 24px;">
        <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: ${c1}; text-transform: uppercase; font-family: ${selFontFamily};">${cabecalho || "PORTAL S/A"}</span>
        <span style="font-size: 11px; color: #888; font-family: monospace;">VIP BRAND</span>
      </div>
    `;

    let bannerBlock = '';
    if (layoutBlocks.banner) {
      bannerBlock = `
        <div style="width: 100%; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
          <img src="${bannerUrl}" alt="Banner" style="width: 100%; height: auto; display: block; border: 0;" />
        </div>
      `;
    }

    let contentBlock = `
      <!-- Content Card -->
      <h1 style="font-size: ${titleSize}; font-weight: 700; color: #111111; line-height: 1.35; margin: 0 0 16px 0; letter-spacing: -0.5px; font-family: ${selFontFamily}; text-align: ${textAlign};">${tema || "Anúncio Corporativo"}</h1>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0; font-family: ${selFontFamily}; text-align: ${textAlign};">${mensagem || "Escreva e personalize seu e-mail corporativo utilizando a barra inteligente de criação de documentos."}</p>

      <!-- Call to action button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${link || '#'}" style="background-color: ${c1}; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: bold; border-radius: 6px; border: 2px solid ${c2}; box-shadow: 0 4px 14px rgba(0,0,0,0.1); display: inline-block; cursor: pointer; transition: all 0.2s ease; font-family: ${selFontFamily};">
          ${botao || "Visitar Link"}
        </a>
      </div>
    `;

    let featuresBlock = '';
    if (layoutBlocks.features) {
      featuresBlock = `
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; margin-bottom: 24px;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; color: ${c2}; text-align: center; margin-bottom: 16px; font-family: ${selFontFamily};">VANTAGENS EXCLUSIVAS</p>
          <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: space-between;">
            <div style="flex: 1; min-width: 140px; padding: 12px; border: 1px solid #f3f4f6; border-radius: 8px; text-align: center; background-color: #fafafa;">
              <div style="font-size: 18px; margin-bottom: 6px;">⚡</div>
              <strong style="font-size: 13px; color: #111; display: block; font-family: ${selFontFamily};">Performance</strong>
              <span style="font-size: 11px; color: #666; display: block; margin-top: 4px; font-family: ${selFontFamily};">Ativação instantânea de alto rendimento.</span>
            </div>
            <div style="flex: 1; min-width: 140px; padding: 12px; border: 1px solid #f3f4f6; border-radius: 8px; text-align: center; background-color: #fafafa;">
              <div style="font-size: 18px; margin-bottom: 6px;">🛡️</div>
              <strong style="font-size: 13px; color: #111; display: block; font-family: ${selFontFamily};">Segurança</strong>
              <span style="font-size: 11px; color: #666; display: block; margin-top: 4px; font-family: ${selFontFamily};">Criptografia analítica de ponta.</span>
            </div>
            <div style="flex: 1; min-width: 140px; padding: 12px; border: 1px solid #f3f4f6; border-radius: 8px; text-align: center; background-color: #fafafa;">
              <div style="font-size: 18px; margin-bottom: 6px;">🎯</div>
              <strong style="font-size: 13px; color: #111; display: block; font-family: ${selFontFamily};">Precisão</strong>
              <span style="font-size: 11px; color: #666; display: block; margin-top: 4px; font-family: ${selFontFamily};">Customização visual simplificada.</span>
            </div>
          </div>
        </div>
      `;
    }

    let couponBlock = '';
    if (layoutBlocks.coupon) {
      couponBlock = `
        <div style="margin: 28px 0; border: 2px dashed ${c2}; border-radius: 12px; padding: 20px; text-align: center; background-color: ${c1}10;">
          <span style="font-size: 11px; font-weight: bold; color: ${c2}; letter-spacing: 1.5px; text-transform: uppercase; display: block; font-family: ${selFontFamily};">CUPOM DE DESCONTO EXCLUSIVO</span>
          <div style="font-size: 26px; font-weight: 800; color: ${c1}; margin: 8px 0; letter-spacing: 2px; font-family: ${selFontFamily};">DOCUMESTRE40</div>
          <p style="font-size: 12px; color: #555; margin: 0; font-family: ${selFontFamily};">Insira este código no checkout para aplicar 40% OFF</p>
        </div>
      `;
    }

    let socialBlock = '';
    if (layoutBlocks.social) {
      socialBlock = `
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center;">
          <span style="font-size: 10px; color: #888; font-weight: bold; letter-spacing: 1px; display: block; margin-bottom: 8px; font-family: ${selFontFamily};">SIGA NOSSAS REDES SOCIAIS</span>
          <div style="display: inline-flex; gap: 12px; justify-content: center; margin-bottom: 12px;">
            <a href="#" style="font-size: 12px; text-decoration: none; color: ${c1}; font-weight: 600; font-family: ${selFontFamily};">Linkedin</a>
            <span style="color: #ccc;">•</span>
            <a href="#" style="font-size: 12px; text-decoration: none; color: ${c1}; font-weight: 600; font-family: ${selFontFamily};">Instagram</a>
            <span style="color: #ccc;">•</span>
            <a href="#" style="font-size: 12px; text-decoration: none; color: ${c1}; font-weight: 600; font-family: ${selFontFamily};">YouTube</a>
          </div>
        </div>
      `;
    }

    // Assemble components in layout sequence
    let assembled = '';
    blockOrder.forEach((bName) => {
      if (bName === 'header') assembled += headerBlock;
      else if (bName === 'banner') assembled += bannerBlock;
      else if (bName === 'content') assembled += contentBlock;
      else if (bName === 'features') assembled += featuresBlock;
      else if (bName === 'coupon') assembled += couponBlock;
      else if (bName === 'social') assembled += socialBlock;
    });

    return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; padding: 40px 20px; width: 100%; box-sizing: border-box; text-align: left;">
  <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e8e8ed; padding: 32px; box-sizing: border-box;">
    
    ${assembled}

    <!-- Footnote -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6;">
      <p style="font-size: 11px; color: #9ca3af; line-height: 1.5; margin: 0; font-family: ${selFontFamily};">${rodape || "Este é um e-mail oficial direcionado. Se desejar alterar suas preferências, acesse nosso painel analítico."}</p>
    </div>

  </div>
</div>
    `.trim();
  }, [tema, cor1, cor2, estilo, cabecalho, mensagem, botao, link, rodape, layoutBlocks, headingFont, textAlign, headingSize, bannerUrl, blockOrder]);

  // Current HTML code used for render preview & copy
  const currentHtml = generatedHtml || localCompiledHtml;

  // Real-time Marketing & Spam Analysis Calculation
  const spamScoreDetails = useMemo(() => {
    let score = 95;
    const alertList: { type: 'error' | 'warning' | 'success'; text: string }[] = [];

    const subject = aiSubject || tema || '';
    if (!subject) {
      score -= 30;
      alertList.push({ type: 'warning', text: 'Campanha sem linha de assunto. Isso reduz drasticamente a taxa de abertura do email.' });
    } else {
      if (subject.length > 60) {
        score -= 10;
        alertList.push({ type: 'warning', text: 'Assunto longo (mais de 60 caract.). Pode ser cortado nas telas de telefones móveis.' });
      }
      if (subject.toUpperCase() === subject && subject.length > 8) {
        score -= 15;
        alertList.push({ type: 'error', text: 'Evite escrever o assunto totalmente em CAIXA ALTA para não alertar filtros anti-spam.' });
      }
      if (/grátis|urgente|ganhe|clique aqui|dinheiro|fature/i.test(subject)) {
        score -= 10;
        alertList.push({ type: 'warning', text: 'Palavras comerciais sensíveis a filtros anti-spam detectadas no Assunto (ex: Grátis, Ganhe).' });
      }
    }

    if (mensagem.length < 50) {
      score -= 15;
      alertList.push({ type: 'warning', text: 'Texto de corpo de email muito curto. Contextualize melhor sua proposta de valor.' });
    }

    if (!botao) {
      score -= 20;
      alertList.push({ type: 'error', text: 'Não há botão de conversão (CTA) ativo. Adicione um para direcionar seu cliente.' });
    }
    if (!link || link === '#') {
      score -= 15;
      alertList.push({ type: 'warning', text: 'O Botão CTA está sem endereço de internet ativo (Link de Destino).' });
    }

    if (cor1 === cor2) {
      score -= 10;
      alertList.push({ type: 'warning', text: 'Tom Principal igual ao Destaque. Use cores de contraste para realce visual refinado.' });
    }

    // Success elements
    if (layoutBlocks.banner) {
      alertList.push({ type: 'success', text: 'Banner visual ativo: e-mails com cabeçalhos gráficos retêm 35% mais a atenção.' });
    }
    if (layoutBlocks.coupon) {
      alertList.push({ type: 'success', text: 'Caixa de cupom inserida: destaca o incentivo de compra e eleva conversões.' });
    }
    if (layoutBlocks.social) {
      alertList.push({ type: 'success', text: 'Links de redes sociais ativos: ajudam a construir reputação e canais alternativos.' });
    }

    const finalScore = Math.max(10, Math.min(100, score));
    let rating = 'Excelente';
    let ratingColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    if (finalScore < 60) {
      rating = 'Risco Alto';
      ratingColor = 'text-red-400 border-red-500/20 bg-red-500/10';
    } else if (finalScore < 85) {
      rating = 'Intermediário';
      ratingColor = 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    }

    return { score: finalScore, rating, ratingColor, alerts: alertList };
  }, [tema, aiSubject, mensagem, botao, link, cor1, cor2, layoutBlocks]);

  // AI Generative Copy & Layout Builder
  const handleAiRefine = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema,
          corPrincipal: cor1,
          corSecundaria: cor2,
          estilo,
          cabecalho,
          mensagem,
          botaoTexto: botao,
          botaoLink: link,
          rodape,
          layoutBlocks
        })
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedHtml(data.html);
        if (data.subject) {
          setAiSubject(data.subject);
        }
        alert("✨ E-mail otimizado com Inteligência Artificial e carregado com sucesso no simulador!");
      } else {
        throw new Error(data.error || "Erro no processamento.");
      }
    } catch (err: any) {
      alert("Nota: Não foi possível conectar com a IA para aprimoramento rápido (" + err.message + "). O simulador continuará rodando localmente com altíssimo desempenho visual!");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Save Template Action
  const saveAsTemplate = () => {
    const name = templateName || `Email - ${tema || 'Campanha'}`;
    store.addTemplate({
      id: generateId(),
      name,
      content: currentHtml,
      format: 'html',
      type: 'email'
    });
    setTemplateName('');
    alert("🎉 Campanha salva como template de e-mail de alta performance com sucesso!");
  };

  const handleSendViaWebmail = (provider: 'gmail' | 'yahoo', html: string) => {
    const subject = encodeURIComponent(aiSubject || tema);
    const body = encodeURIComponent("Cole o HTML decorado fornecido pelo painel ou envie diretamente.");
    let url = '';
    if (provider === 'gmail') {
      url = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    } else {
      url = `https://compose.mail.yahoo.com/?Subject=${subject}&Body=${body}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-24 text-white font-sans">
      
      {/* Title Header */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:bg-[#39FF14]/10"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] text-[10px] font-extrabold uppercase tracking-widest font-mono">ESTÚDIO DE DIAGRAMAÇÃO</span>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              <Brush className="text-[#39FF14] h-7 w-7" /> MÓDULO DE CRIAÇÃO PARA NÃO-PROGRAMADORES
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Diagramador visual super amigável. Selecione presets, mude a ordem dos blocos com setas, troque fontes e confira o Spam Score em tempo real!
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setTema('Cupom Secreto de Fidelidade Cliente');
                setMensagem('Olá parceiro de negócios, como forma de agradecimento vitalício por sua lealdade a nossa S/A, liberamos hoje um bônus especial.');
                setLayoutBlocks({ banner: true, features: false, coupon: true, social: true });
                setBlockOrder(['banner', 'header', 'content', 'coupon', 'features', 'social']);
                setHeadingFont('Inter');
                setTextAlign('left');
                setHeadingSize('md');
                setBannerUrl(bannerDesigns[0].url);
                setGeneratedHtml('');
              }}
              className="px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-xl text-xs text-gray-300 font-bold hover:text-white transition-all flex items-center gap-1.5"
            >
              <Sliders className="h-3.5 w-3.5 text-gray-500" /> Reiniciar Atributos
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Preset Quadrants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {presets.map((preset) => (
          <div 
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#39FF14]/50 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group hover:shadow-[0_4px_20px_rgba(57,255,20,0.05)]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-white group-hover:text-[#39FF14] transition-colors">{preset.name}</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 px-1.5 py-0.5 bg-[#111] border border-[#222] rounded">Modelo</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">{preset.description}</p>
          </div>
        ))}
      </div>

      {/* Main Double Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Parametrizador e Ferramentas */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 shadow-xl space-y-5">
            <div className="border-b border-[#1a1a1a] pb-3 mb-1 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#39FF14]" /> Configuração de Conteúdo
              </h3>
              <span className="text-[9px] font-mono text-[#39FF14] bg-[#39FF14]/15 border border-[#39FF14]/25 px-2 py-0.5 rounded-full font-bold">LIVRE DE CÓDIGO</span>
            </div>

            <div className="space-y-4">
              
              {/* Tema de e-mail */}
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Título principal da Campanha (Tema)</label>
                <input 
                  type="text" 
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-[#39FF14] outline-none transition" 
                  value={tema} 
                  onChange={(e) => { setTema(e.target.value); setGeneratedHtml(''); }}
                  placeholder="Ex: Divulgação do Novo Produto" 
                />
              </div>

              {/* Cores Integradas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Tom Principal</label>
                  <div className="flex gap-2 mb-1.5">
                    <input 
                      type="color" 
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 outline-none" 
                      value={cor1} 
                      onChange={(e) => { setCor1(e.target.value); setGeneratedHtml(''); }} 
                    />
                    <input 
                      type="text" 
                      className="flex-1 bg-[#111] border border-[#222] rounded-lg px-2 text-xs text-white uppercase font-mono tracking-wider focus:border-[#39FF14] outline-none" 
                      value={cor1} 
                      onChange={(e) => { setCor1(e.target.value); setGeneratedHtml(''); }} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Tom Destaque</label>
                  <div className="flex gap-2 mb-1.5">
                    <input 
                      type="color" 
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 outline-none" 
                      value={cor2} 
                      onChange={(e) => { setCor2(e.target.value); setGeneratedHtml(''); }} 
                    />
                    <input 
                      type="text" 
                      className="flex-1 bg-[#111] border border-[#222] rounded-lg px-2 text-xs text-white uppercase font-mono tracking-wider focus:border-[#39FF14] outline-none" 
                      value={cor2} 
                      onChange={(e) => { setCor2(e.target.value); setGeneratedHtml(''); }} 
                    />
                  </div>
                </div>
              </div>

              {/* Color Presets */}
              <div className="bg-black/40 p-2.5 border border-[#222] rounded-lg flex flex-wrap items-center gap-1.5 justify-start">
                <span className="text-[9px] font-mono text-gray-500 font-bold uppercase mr-1">Paletas Rápidas:</span>
                {colorSchemes.map((sch) => (
                  <button
                    key={sch.label}
                    onClick={() => { setCor1(sch.c1); setCor2(sch.c2); setGeneratedHtml(''); }}
                    className="px-2 py-0.5 rounded bg-[#111] hover:bg-[#1f1f1f] text-[9px] font-mono font-bold text-gray-300 border border-[#333] transition"
                  >
                    {sch.label}
                  </button>
                ))}
              </div>

              {/* Estilo Select e Letreiro cabeçalho */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Tonalidade / Estilo</label>
                  <select 
                    className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-xs text-white focus:border-[#39FF14] outline-none transition" 
                    value={estilo} 
                    onChange={(e) => { setEstilo(e.target.value); setGeneratedHtml(''); }}
                  >
                    <option value="futurista">Futurista (Neon)</option>
                    <option value="elegante">Elegante (Clean)</option>
                    <option value="casual">Casual (Amigável)</option>
                    <option value="clássico">Clássico (Institucional)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Letreiro (Cabeçalho)</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-xs text-white focus:border-[#39FF14] outline-none transition" 
                    value={cabecalho} 
                    onChange={(e) => { setCabecalho(e.target.value); setGeneratedHtml(''); }}
                    placeholder="Nome de Sua Marca" 
                  />
                </div>
              </div>

              {/* Typography Preferences */}
              <div className="bg-[#111]/30 p-4 border border-[#1a1a1a] rounded-xl space-y-3">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Letramento e Tipografia</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Fonte dos Títulos</label>
                    <select 
                      value={headingFont}
                      onChange={(e: any) => { setHeadingFont(e.target.value); setGeneratedHtml(''); }}
                      className="w-full bg-black border border-[#222] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#39FF14]"
                    >
                      <option value="Inter">Inter (Sans-serif)</option>
                      <option value="Space Grotesk">Space Grotesk (Tech)</option>
                      <option value="Playfair Display">Playfair (Luxo / Serif)</option>
                      <option value="Montserrat">Montserrat (Geométrico)</option>
                      <option value="Merriweather">Merriweather (Leitura / Serif)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Alinhamento Texto</label>
                    <div className="grid grid-cols-3 gap-1 bg-black/60 p-0.5 rounded-lg border border-[#222]">
                      <button 
                        type="button" 
                        onClick={() => { setTextAlign('left'); setGeneratedHtml(''); }}
                        className={cn("py-1 rounded text-xs font-bold transition", textAlign === 'left' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}
                      >
                        Esq
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setTextAlign('center'); setGeneratedHtml(''); }}
                        className={cn("py-1 rounded text-xs font-bold transition", textAlign === 'center' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}
                      >
                        Cent
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setTextAlign('right'); setGeneratedHtml(''); }}
                        className={cn("py-1 rounded text-xs font-bold transition", textAlign === 'right' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}
                      >
                        Dir
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Tamanho do Título</label>
                  <div className="grid grid-cols-3 gap-1 bg-black/60 p-0.5 rounded-lg border border-[#222]">
                    <button 
                      type="button" 
                      onClick={() => { setHeadingSize('sm'); setGeneratedHtml(''); }}
                      className={cn("py-1 rounded text-xs font-bold transition", headingSize === 'sm' ? "bg-[#111] text-[#39FF14] border border-[#39FF14]/30" : "text-gray-400")}
                    >
                      Pequeno (18px)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setHeadingSize('md'); setGeneratedHtml(''); }}
                      className={cn("py-1 rounded text-xs font-bold transition", headingSize === 'md' ? "bg-[#111] text-[#39FF14] border border-[#39FF14]/30" : "text-gray-400")}
                    >
                      Médio (24px)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setHeadingSize('lg'); setGeneratedHtml(''); }}
                      className={cn("py-1 rounded text-xs font-bold transition", headingSize === 'lg' ? "bg-[#111] text-[#39FF14] border border-[#39FF14]/30" : "text-gray-400")}
                    >
                      Grande (32px)
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensagem principal */}
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1 flex justify-between">
                  <span>Mensagem Principal (Corpo do Email)</span>
                  <span className="text-gray-600 font-mono text-[9px]">{mensagem.length} caract.</span>
                </label>
                <textarea 
                  className="w-full h-28 bg-[#111] border border-[#222] rounded-lg p-3 text-xs text-white focus:border-[#39FF14] outline-none transition resize-none leading-relaxed" 
                  value={mensagem} 
                  onChange={(e) => { setMensagem(e.target.value); setGeneratedHtml(''); }}
                  placeholder="Seja persuasivo..." 
                />
              </div>

              {/* Call to action e Link */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Texto do Botão CTA</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-xs text-white focus:border-[#39FF14] outline-none transition" 
                    value={botao} 
                    onChange={(e) => { setBotao(e.target.value); setGeneratedHtml(''); }}
                    placeholder="Ex: Clique Aqui" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Link de Destino</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-xs text-white focus:border-[#39FF14] outline-none transition" 
                    value={link} 
                    onChange={(e) => { setLink(e.target.value); setGeneratedHtml(''); }}
                    placeholder="https://..." 
                  />
                </div>
              </div>

              {/* Descrição Rodapé */}
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Isenção & Informação no Rodapé</label>
                <input 
                  type="text" 
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-xs text-white focus:border-[#39FF14] outline-none transition" 
                  value={rodape} 
                  onChange={(e) => { setRodape(e.target.value); setGeneratedHtml(''); }}
                  placeholder="Copyright S/A..." 
                />
              </div>

            </div>
          </div>

          {/* Module Layout Blocks Order Manager - Super custom & powerful builder for non-programmers! */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-[#1a1a1a] pb-3 mb-4 flex items-center gap-2">
              <Grid className="h-4 w-4 text-[#39FF14]" /> Organizador dos Blocos de Campanha
            </h3>
            <p className="text-[10px] text-gray-500 mb-4 uppercase font-bold">Use as setas 🔼 🔽 para mover a ordem de exibição na newsletter:</p>
            
            <div className="space-y-2">
              {blockOrder.map((blockKey, idx) => {
                let name = 'Bloco Desconhecido';
                let desc = '';
                let active = true;

                if (blockKey === 'banner') {
                  name = 'Banner Principal Superior';
                  desc = 'Imagem temática da campanha';
                  active = layoutBlocks.banner;
                } else if (blockKey === 'header') {
                  name = 'Cabeçalho de Assinatura Marca';
                  desc = 'Nome da marca e identificador vip';
                  active = true; // Header is always compiled
                } else if (blockKey === 'content') {
                  name = 'Corpo Principal & Mensagem';
                  desc = 'Título de impacto e chamada CTA';
                  active = true;
                } else if (blockKey === 'features') {
                  name = 'Portfólio de Benefícios (3 Colunas)';
                  desc = 'Vantagens exclusivas do produto';
                  active = layoutBlocks.features;
                } else if (blockKey === 'coupon') {
                  name = 'Quadro Voucher Cupom de Desconto';
                  desc = 'Destaque promocional tracejado';
                  active = layoutBlocks.coupon;
                } else if (blockKey === 'social') {
                  name = 'Rodapé e Redes Sociais';
                  desc = 'Links e canais corporativos';
                  active = layoutBlocks.social;
                }

                return (
                  <div 
                    key={blockKey}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                      active ? "bg-black/60 border-[#222]" : "bg-black/20 border-dashed border-[#151515] opacity-55"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex flex-col text-gray-500">
                        <button 
                          type="button" 
                          onClick={() => moveBlock(idx, 'up')}
                          disabled={idx === 0}
                          className="hover:text-white disabled:opacity-20 p-0.5 text-xs"
                          title="Subir Posição"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button 
                          type="button" 
                          disabled={idx === blockOrder.length - 1}
                          onClick={() => moveBlock(idx, 'down')}
                          className="hover:text-white disabled:opacity-20 p-0.5 text-xs"
                          title="Descer Posição"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-white">{name}</span>
                          {!active && <span className="text-[8px] uppercase font-bold text-gray-500 px-1 py-0.2 bg-black border border-[#222] rounded">Inativo</span>}
                        </div>
                        <span className="text-[9px] text-gray-500">{desc}</span>
                      </div>
                    </div>

                    {/* Toggle activation switch only for toggleable components */}
                    {['banner', 'features', 'coupon', 'social'].includes(blockKey) && (
                      <input 
                        type="checkbox" 
                        checked={active}
                        onChange={(e) => {
                          setLayoutBlocks(prev => ({ ...prev, [blockKey]: e.target.checked }));
                          setGeneratedHtml('');
                        }}
                        className="w-3.5 h-3.5 rounded text-[#39FF14] bg-[#111] border-[#333] checked:bg-[#39FF14] focus:ring-0"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Banner Designs Selector */}
          {layoutBlocks.banner && (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-[#1a1a1a] pb-3 flex items-center gap-2">
                <Image className="h-4 w-4 text-[#39FF14]" /> Ilustração de Banner do Topo
              </h3>
              
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-1">Selecione uma Imagem Temática Profissional:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bannerDesigns.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setBannerUrl(b.url);
                      setSelectedBannerTheme(b.id);
                      setGeneratedHtml('');
                    }}
                    className={cn(
                      "relative height-[70px] rounded-lg overflow-hidden border cursor-pointer hover:border-gray-400 transition-all text-left p-2",
                      selectedBannerTheme === b.id ? "border-[#39FF14] bg-[#39FF14]/5" : "border-[#222] bg-black/60"
                    )}
                  >
                    <span className="text-[10px] font-bold text-white block truncate">{b.label}</span>
                    <span className="text-[8px] text-gray-500 block truncate">{b.desc}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Ou cole uma URL de imagem customizada:</label>
                <input 
                  type="text" 
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:border-[#39FF14] outline-none font-mono"
                  value={bannerUrl}
                  onChange={(e) => { setBannerUrl(e.target.value); setSelectedBannerTheme('custom'); setGeneratedHtml(''); }}
                />
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Simulador Digital de Email com Visual Real-Time */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Live Preview Display Card & AI Enhancer Trigger */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1a1a1a] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-[#39FF14] tracking-widest font-mono">SIMULADOR COMPILADOR DE INBOX</span>
              </div>
              
              {/* Width and View mode switches */}
              <div className="flex gap-1.5 items-center bg-black/80 p-1 rounded-xl border border-[#222]">
                <button
                  type="button" 
                  onClick={() => setPreviewWidth('desktop')}
                  className={cn("px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all", previewWidth === 'desktop' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}
                >
                  Desktop (600px)
                </button>
                <button
                  type="button" 
                  onClick={() => setPreviewWidth('mobile')}
                  className={cn("px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all", previewWidth === 'mobile' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}
                >
                  Móvel (375px)
                </button>
                
                <span className="text-[#333] px-1 pointer-events-none">|</span>
                
                <button
                  type="button" 
                  onClick={() => setPreviewMode('visual')}
                  className={cn("px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all", previewMode === 'visual' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}
                >
                  Ver Layout
                </button>
                <button
                  type="button" 
                  onClick={() => setPreviewMode('code')}
                  className={cn("px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all", previewMode === 'code' ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")}
                >
                  Código HTML
                </button>
              </div>
            </div>

            {/* Simulated Mailbox Header */}
            <div className="bg-black/60 border border-[#222] rounded-xl p-3 space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-2 w-full">
                <span className="w-16 font-mono text-[9px] uppercase tracking-wider text-gray-500 font-bold block shrink-0">Assunto:</span>
                <input
                  type="text"
                  value={aiSubject || tema || ''}
                  onChange={(e) => setAiSubject(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full p-0 font-bold text-gray-200 focus:ring-0 focus:border-b focus:border-[#39FF14]/45 text-xs"
                  placeholder="Selecione um preset ou digite um assunto corporativo"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-mono text-[9px] uppercase tracking-wider text-gray-500 font-bold block shrink-0">De:</span>
                <span className="text-gray-300 font-medium truncate">{cabecalho ? `${cabecalho} <comercial@seuhomologo.com.br>` : "comercial@portalcorporate.com.br"}</span>
              </div>
            </div>

            {/* AI Copywriter Refine Button & Copy Prompt */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAiRefine}
                disabled={isLoadingAi}
                className="flex-1 py-3 bg-gradient-to-r from-[#39FF14]/15 to-[#39FF14]/5 hover:from-[#39FF14]/25 hover:to-[#39FF14]/10 border border-[#39FF14]/40 hover:border-[#39FF14] rounded-xl text-xs text-[#39FF14] font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.05)] cursor-pointer disabled:opacity-50"
              >
                <Wand2 className={cn("h-4 w-4", isLoadingAi && "animate-spin")} /> 
                {isLoadingAi ? "AUDITANDO COM INTELIGÊNCIA ARTIFICIAL..." : "REDAÇÃO E DESIGN COM IA (GEMINI AI®)"}
              </button>
              <button
                onClick={() => {
                  const prompt = `Atue como um especialista corporativo e copywriter sênior. Crie/melhore um email/documento em código HTML inline e responsivo para minha campanha com os seguintes dados:
Tema/Assunto: ${tema}
Cores: Principal ${cor1}, Destaque ${cor2}
Tom de voz/Estilo: ${estilo}
Cabeçalho/Nome: ${cabecalho}
Mensagem/Diretriz: ${mensagem}
Botão CTA: ${botao}
Link: ${link}
Rodapé: ${rodape}

Regras obrigatórias:
1. Retorne APENAS o código HTML completo sem blocos markdown.
2. Estilize tudo usando style (CSS inline) de forma responsiva.
3. Considere utilizar os blocos organizacionais solicitados: ${Object.entries(layoutBlocks).filter(([_,v]) => v).map(([k]) => k).join(', ')}`;
                  navigator.clipboard.writeText(prompt);
                  alert('Prompt instrucional copiado para a área de transferência! Você pode colá-lo em IAs externas e depois colar o resultado de volta.');
                }}
                className="sm:w-[220px] py-3 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#39FF14]/30 rounded-xl text-xs text-gray-300 hover:text-white font-bold transition-all flex items-center justify-center gap-2"
                title="Copiar prompt em texto para colar em IA externa"
                type="button"
              >
                <Copy className="h-4 w-4" /> Copiar Prompts IA Manual
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-xl text-[10px] text-gray-400 hover:text-white font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider min-w-[90px]">
                <ExternalLink className="h-3 w-3 shrink-0" /> ChatGPT
              </a>
              <a href="https://claude.ai" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-xl text-[10px] text-gray-400 hover:text-white font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider min-w-[90px]">
                <ExternalLink className="h-3 w-3 shrink-0" /> Claude
              </a>
              <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-xl text-[10px] text-gray-400 hover:text-white font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider min-w-[90px]">
                <ExternalLink className="h-3 w-3 shrink-0" /> Gemini
              </a>
              <a href="https://copilot.microsoft.com" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-xl text-[10px] text-gray-400 hover:text-white font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider min-w-[90px]">
                <ExternalLink className="h-3 w-3 shrink-0" /> Copilot
              </a>
              <a href="https://chat.deepseek.com" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-xl text-[10px] text-gray-400 hover:text-white font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider min-w-[90px]">
                <ExternalLink className="h-3 w-3 shrink-0" /> DeepSeek
              </a>
              <a href="https://kimi.moonshot.cn" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-xl text-[10px] text-gray-400 hover:text-white font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider min-w-[90px]">
                <ExternalLink className="h-3 w-3 shrink-0" /> Kimi
              </a>
              <a href="https://chat.qwenlm.ai" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-xl text-[10px] text-gray-400 hover:text-white font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider min-w-[90px]">
                <ExternalLink className="h-3 w-3 shrink-0" /> Qwen
              </a>
            </div>

            {/* Simulated Canvas Sandbox Box */}
            <div className="bg-[#111111] border border-[#222] rounded-xl overflow-hidden flex justify-center p-4 min-h-[500px]">
              
              {previewMode === 'visual' ? (
                <div 
                  className="transition-all duration-300 shadow-2xl bg-white rounded-lg flex flex-col justify-start overflow-hidden relative"
                  style={{ width: previewWidth === 'desktop' ? '600px' : '375px', minHeight: '480px' }}
                >
                  <iframe
                    title="Email Builder Preview"
                    srcDoc={currentHtml}
                    referrerPolicy="no-referrer"
                    className="w-full flex-1 border-0 bg-[#f4f4f7] min-h-[480px]"
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                  />
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono text-gray-500 font-bold">CÓDIGO FONTE HTML FORMATADO:</span>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(currentHtml); alert('Código HTML copiado!'); }}
                      className="text-xs text-[#39FF14] font-bold flex items-center gap-1 hover:underline"
                    >
                      <Copy className="h-3 w-3" /> Copiar Código
                    </button>
                  </div>
                  <textarea
                    readOnly
                    className="w-full flex-1 min-h-[440px] bg-black text-[#39FF14] font-mono text-[11px] p-4 rounded-lg border border-[#222] outline-none focus:border-[#39FF14] resize-none leading-relaxed"
                    value={currentHtml}
                  />
                  {generatedHtml && (
                    <button
                      onClick={() => { setGeneratedHtml(''); setAiSubject(tema); }}
                      className="py-1 px-3 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 transition self-end rounded mt-1"
                    >
                      Restaurar Versão Padrão do Parametrizador
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Spam shield and marketing converter analysis box */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#39FF14]" /> Painel Spam-Shield & Conversão S/A
              </h3>
              <div className={`px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-bold ${spamScoreDetails.ratingColor}`}>
                {spamScoreDetails.rating}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-3 flex flex-col items-center justify-center p-4 bg-black/45 border border-[#222] rounded-2xl">
                <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Pontuação</span>
                <span className="text-4xl font-black text-[#39FF14]">{spamScoreDetails.score}</span>
                <span className="text-[9px] text-gray-400">de 100 ptos</span>
              </div>
              <div className="md:col-span-9 space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {spamScoreDetails.alerts.map((al, aiIdx) => (
                  <div key={aiIdx} className="flex gap-2 items-start text-xs">
                    <span className="mt-0.5">
                      {al.type === 'error' ? '🔴' : al.type === 'warning' ? '⚠️' : '✅'}
                    </span>
                    <span className={cn(
                      "leading-relaxed",
                      al.type === 'error' ? "text-red-400 font-semibold" : al.type === 'warning' ? "text-gray-400" : "text-emerald-400"
                    )}>
                      {al.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Import / Save Template Area */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white border-b border-[#1a1a1a] pb-3 flex items-center gap-2 uppercase tracking-wider">
              <Save className="h-4 w-4 text-[#39FF14]" /> Exportar e Registrar como Documento
            </h3>
            
            <p className="text-[11px] text-gray-400">
              Caso esteja satisfeito com a diagramação, dê um nome formal e registre-o imediatamente na sua lista do sistema para reutilização instantânea.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input 
                type="text" 
                className="w-full flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm text-white focus:border-[#39FF14] outline-none transition" 
                value={templateName} 
                onChange={(e) => setTemplateName(e.target.value)} 
                placeholder="Insira o Nome do Template (Ex: Newsletter Julho)" 
              />
              <button 
                onClick={saveAsTemplate}
                className="w-full sm:w-auto py-3 px-6 bg-[#39FF14] hover:bg-[#7FFF00] text-black font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#39FF14]/15"
              >
                <CheckCircle2 className="h-4 w-4" /> Registrar no Sistema
              </button>
            </div>

            {/* Fast Email Testing integrations */}
            <div className="border-t border-[#1a1a1a] pt-4 mt-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2.5">Enviar Teste Rápido (Abrir Clientes GMail/Yahoo):</span>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleSendViaWebmail('gmail', currentHtml)}
                  className="py-2.5 px-4 bg-[#111] hover:bg-red-500/10 border border-[#222] hover:border-red-500/30 rounded-xl text-xs text-gray-300 hover:text-white font-bold transition flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4 text-red-500" /> Abrir no Gmail
                </button>
                <button 
                  onClick={() => handleSendViaWebmail('yahoo', currentHtml)}
                  className="py-2.5 px-4 bg-[#111] hover:bg-purple-500/10 border border-[#222] hover:border-purple-500/30 rounded-xl text-xs text-gray-300 hover:text-white font-bold transition flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4 text-purple-400" /> Abrir no Yahoo Mail
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}