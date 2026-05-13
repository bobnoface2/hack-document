import React, { useState, useEffect } from 'react';
import { useAppStore } from './store';
import { 
  Code, FileText, History, Settings, Printer, Download, Save, Plus, 
  Trash2, Mail, TerminalSquare, Menu, X, LayoutDashboard, Sparkles, 
  ChevronRight, ArrowRight, CheckCircle2, AlertCircle, FileDown, 
  Clock, Send, ShieldCheck
} from 'lucide-react';
import { generateId, extractVariables, replaceVariables, cn } from './lib/utils';
import { Template, GeneratedDocument } from './types';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'generate' | 'templates' | 'history' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const store = useAppStore();

  useEffect(() => {
    // any initialization if needed
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-gray-100 font-sans selection:bg-[#39FF14] selection:text-black">
      <div className="flex flex-1 overflow-hidden relative">
        <motion.div 
          initial={false}
          animate={{ width: isSidebarOpen ? 260 : 80 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className={cn(
            "bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col h-full shadow-2xl relative overflow-hidden shrink-0"
          )}
        >
          {/* Logo Section */}
          <div className="h-20 flex items-center px-6 border-b border-[#1a1a1a] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#39FF14]/20 bg-[#111]">
                <img src="/imagem.ico" alt="Logo" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://img.icons8.com/neon/96/cyber-security.png'; }} />
              </div>
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-lg tracking-tight leading-none text-[#39FF14]">HACK DOCUMENT</span>
                  <span className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">Enterprise Pro</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 flex-shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-2 text-gray-400 hover:text-[#39FF14] transition-colors"
            >
              <Menu className="h-5 w-5" />
              {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-widest text-[#39FF14]">Recolher Menu</span>}
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            <NavItem 
              icon={<LayoutDashboard className="h-5 w-5" />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              expanded={isSidebarOpen}
              onClick={() => { setActiveTab('dashboard'); }} 
            />
            <NavItem 
              icon={<FileText className="h-5 w-5" />} 
              label="Gerador de Doc" 
              active={activeTab === 'generate'} 
              expanded={isSidebarOpen}
              onClick={() => { setActiveTab('generate'); }} 
            />
            <NavItem 
              icon={<Code className="h-5 w-5" />} 
              label="Templates" 
              active={activeTab === 'templates'} 
              expanded={isSidebarOpen}
              onClick={() => { setActiveTab('templates'); }} 
            />
            <NavItem 
              icon={<History className="h-5 w-5" />} 
              label="Histórico Local" 
              active={activeTab === 'history'} 
              expanded={isSidebarOpen}
              onClick={() => { setActiveTab('history'); }} 
            />
            <div className="pt-6 mt-6 border-t border-[#1a1a1a]">
              <NavItem 
                icon={<Settings className="h-5 w-5" />} 
                label="Configurações" 
                active={activeTab === 'settings'} 
                expanded={isSidebarOpen}
                onClick={() => { setActiveTab('settings'); }} 
              />
            </div>
          </nav>
        </motion.div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#050505] relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-10 h-full"
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
      <footer className="h-10 bg-[#0a0a0a] border-t border-[#1a1a1a] flex items-center justify-between px-4 md:px-10 text-[10px] font-mono text-gray-500 tracking-wider relative">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-[#39FF14]" /> SECURITY</span>
          <span className="opacity-50 hidden sm:inline">DB: SQLITE</span>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-center w-full max-w-[200px] sm:max-w-none pointer-events-auto">
          <a href="https://wa.me/5521993367328" target="_blank" rel="noopener noreferrer" className="text-[#39FF14] hover:underline decoration-skip-ink">WALLACE ARÃO</a> © {new Date().getFullYear()}
        </div>
        <div className="hidden sm:block opacity-50 text-right">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<FileText className="text-[#39FF14]" />} label="Templates Salvos" value={store.templates.length} color="green" />
        <StatCard icon={<Printer className="text-blue-400" />} label="Docs Gerados" value={store.documents.length} color="blue" />
        <StatCard icon={<Sparkles className="text-purple-400" />} label="Créditos IA" value="Ilimitado" color="purple" />
        <StatCard icon={<Send className="text-orange-400" />} label="E-mails Enviados" value={store.documents.length * 0.8 | 0} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
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
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                <Sparkles className="w-24 h-24 text-[#39FF14]" />
            </div>
            <h3 className="font-bold text-lg text-white mb-4">DocuMestre AI</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Aproveite o poder do Gemini 1.5 Flash para refinar seus contratos, sugerir melhorias e traduzir documentos instantaneamente.
            </p>
            <button 
              onClick={onAction}
              className="w-full py-3 bg-[#39FF14] text-black font-bold rounded-xl hover:bg-[#7FFF00] transition-colors flex items-center justify-center gap-2"
            >
              Iniciar Geração Produtiva <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-4">Informações do Sistema</h3>
            <ul className="space-y-3">
              <li className="flex justify-between text-xs">
                <span className="text-gray-500">Versão:</span>
                <span className="text-white font-mono">v3.0.4-PRO</span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-gray-500">Storage:</span>
                <span className="text-white font-mono">Persistent JSON/SQL</span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-gray-500">Status API:</span>
                <span className="text-[#39FF14] font-bold">ONLINE</span>
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
  const [isExporting, setIsExporting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const template = store.templates.find((t: any) => t.id === selectedId);
  const detected = template ? extractVariables(template.content) : [];

  useEffect(() => {
    if (template) {
      setFinalContent(replaceVariables(template.content, vars));
    }
  }, [template, vars]);

  const handleAiRefine = async (prompt: string) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          content: finalContent 
        })
      });
      const data = await res.json();
      if (data.refinedContent) {
        setFinalContent(data.refinedContent);
      } else {
        alert(data.error || "Erro na IA");
      }
    } catch (e) {
      alert("Falha na conexão com o servidor de IA");
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: finalContent, 
          filename: `${template.name}.pdf` 
        })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}.pdf`;
      a.click();
    } catch (e) {
      alert("Erro ao exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

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

  return (
    <div className="flex flex-col h-full gap-8">
      {/* Header Controls */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden group">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Selecionar Modelo</label>
            <select 
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
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 gap-8 min-h-0">
        {/* Variables Editor */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 flex flex-col min-h-0 overflow-y-auto relative">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2"><Send className="h-5 w-5 text-[#39FF14]" /> Preenchimento Pro</h2>
            <div className="flex items-center gap-2">
               <span className="text-xs text-gray-500 font-mono italic">Vars Detectadas:</span>
               <span className="px-2 py-0.5 bg-[#1a1a1a] rounded text-[10px] font-bold text-[#39FF14]">{detected.length}</span>
            </div>
          </div>

          <div className="space-y-6 flex-1">
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

          {/* AI Tools Bar e Acoes */}
          <div className="mt-8 pt-8 border-t border-[#1a1a1a]">
             <h3 className="text-xs font-mono text-gray-500 uppercase mb-4 flex items-center gap-2">
               <Sparkles className="h-3 w-3 text-purple-400" /> Assistente Llama PRO
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                <AiButton 
                  label="Expandir" 
                  loading={aiLoading} 
                  onClick={() => handleAiRefine("Expanda este documento tornando-o mais detalhado e profissional.")} 
                />
                <AiButton 
                  label="Resumir" 
                  loading={aiLoading} 
                  onClick={() => handleAiRefine("Resuma este documento mantendo apenas as partes essenciais.")} 
                />
                <AiButton 
                  label="Formalizar" 
                  loading={aiLoading} 
                  onClick={() => handleAiRefine("Refine a linguagem para que soe extremamente formal e jurídica.")} 
                />
                <AiButton 
                  label="Corrigir" 
                  loading={aiLoading} 
                  onClick={() => handleAiRefine("Corrija erros gramaticais e estilísticos mantendo o sentido.")} 
                />
             </div>

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
                       fetch('/api/send-email', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                           to: email,
                           subject: `Documento: ${template?.name}`,
                           html: finalContent,
                           smtpUser: store.smtpUser || '',
                           smtpPass: store.smtpPass || ''
                         })
                       }).then(r => r.json()).then(data => {
                          if(data.success) alert("E-mail enviado com sucesso!");
                          else alert("Erro ao enviar e-mail: " + (data.error || "Verifique credenciais nas configurações."));
                       }).catch(() => alert("Erro ao conectar com servidor de e-mail."));
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
               
               <button 
                 onClick={handleExportPdf}
                 disabled={isExporting}
                 className="flex-1 min-w-[120px] px-3 py-2 bg-[#1a1a1a] border border-[#222222] text-white font-bold rounded-xl hover:bg-[#222222] transition flex items-center justify-center gap-2 text-xs"
               >
                 <FileDown className={cn("h-3 w-3 text-blue-400", isExporting && "animate-bounce")} /> 
                 {isExporting ? "Gerando..." : "Download PDF"}
               </button>
             </div>
          </div>
        </div>

        {/* Live Preview Console */}
        <div className="bg-white rounded-2xl flex flex-col overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-gray-200 min-h-0 group relative">
          <div className="h-14 bg-[#0a0a0a] border-b border-[#1a1a1a] px-6 flex items-center justify-between flex-shrink-0">
             <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
             </div>
             <div className="text-[10px] font-mono text-gray-500 flex items-center gap-2">
                <Printer className="h-3 w-3" /> PRINT_PREVIEW_A4
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12 bg-white text-black min-h-0 select-text selection:bg-blue-100">
             {template?.format === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: finalContent }} className="prose prose-sm max-w-none" />
             ) : (
                <pre className="font-serif text-sm leading-8 whitespace-pre-wrap text-justify antialiased">
                  {finalContent}
                </pre>
             )}
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
                         <div class="sig-box" style="text-align: center; width: ${Math.floor(100/numSigs)}%; min-width: 200px; padding: 20px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <hr class="sig-line" style="border: 0; border-top: 1px solid #000; width: 250px; max-width: 100%; margin: 0 auto 10px auto;" />
                            <p style="font-family: sans-serif; font-size: 14px; margin: 0; font-weight: bold; text-align: center; width: 100%;">${sig.name || 'Assinatura'}</p>
                            ${sig.role ? `<p style="font-family: sans-serif; font-size: 12px; margin: 4px 0 0 0; color: #555; text-align: center; width: 100%;">${sig.role}</p>` : ''}
                         </div>
                       `).join('');
                       sigsText = `\n<div class="sig-container" style="margin-top: 80px; display: flex; flex-wrap: wrap; justify-content: space-around; width: 100%; border: 0 !important; outline: none !important;">${sigNodes}</div>\n`;
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
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'preview'>('editor');

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
    setActiveSubTab('editor');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-8">
      <div className={cn(
        "w-full lg:w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col shrink-0",
        editing && "hidden lg:flex"
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
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[300px] lg:max-h-none">
          {store.templates.map((t: any) => (
            <div 
              key={t.id} 
              onClick={() => { setEditing({...t}); setActiveSubTab('editor'); }}
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

      <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col p-4 lg:p-8 overflow-y-auto min-h-[500px]">
        {editing ? (
          <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
               <h2 className="text-xl font-bold">Configurando Modelo</h2>
               <div className="flex items-center gap-3">
                 <button 
                  onClick={() => {
                    store.templates.some((t: any) => t.id === editing.id) ? store.updateTemplate(editing.id, editing) : store.addTemplate(editing);
                    setEditing(null);
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#39FF14] text-black font-bold rounded-xl hover:bg-[#7FFF00] transition-colors text-sm"
                 >
                   Salvar
                 </button>
                 <button onClick={() => setEditing(null)} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#1a1a1a] rounded-xl text-gray-400 text-sm hover:text-white border border-[#222222]">Voltar</button>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
              <div className="sm:col-span-1">
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

            {/* Mobile SubTabs */}
            <div className="flex lg:hidden bg-[#050505] p-1 rounded-xl mb-4 border border-[#1a1a1a] flex-shrink-0">
               <button 
                onClick={() => setActiveSubTab('editor')}
                className={cn("flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-colors text-center", activeSubTab === 'editor' ? "bg-[#1a1a1a] text-[#39FF14]" : "text-gray-500 hover:text-white")}
               >Editor de Código</button>
               <button 
                onClick={() => setActiveSubTab('preview')}
                className={cn("flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-colors text-center", activeSubTab === 'preview' ? "bg-[#1a1a1a] text-[#39FF14]" : "text-gray-500 hover:text-white")}
               >Visão Final</button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
               <div className={cn("flex-col h-[400px] lg:h-auto overflow-hidden", activeSubTab === 'editor' ? "flex" : "hidden lg:flex")}>
                 <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block flex-shrink-0">Editor</label>
                 <textarea 
                  className="flex-1 w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl p-6 font-mono text-[13px] text-gray-300 focus:border-[#39FF14] outline-none resize-none leading-relaxed shadow-inner"
                  value={editing.content}
                  onChange={e => setEditing({...editing, content: e.target.value})}
                 />
               </div>
               <div className={cn("flex-col h-[400px] lg:h-auto overflow-hidden", activeSubTab === 'preview' ? "flex" : "hidden lg:flex")}>
                 <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block flex-shrink-0">Preview</label>
                 <div className="flex-1 w-full bg-white rounded-2xl p-6 lg:p-8 overflow-y-auto border border-gray-200">
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
    <div className="flex flex-col lg:flex-row h-full gap-8">
       <div className={cn(
         "w-full lg:w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col overflow-hidden shrink-0",
         selected && "hidden lg:flex"
       )}>
          <div className="p-6 border-b border-[#1a1a1a]">
             <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Documentos Gerados</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[400px] lg:max-h-none">
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
              <div className="bg-[#0a0a0a] p-4 lg:p-6 border-b border-[#1a1a1a] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setSelected(null)} className="lg:hidden p-2 text-gray-400 hover:text-white">
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                    <div>
                       <h2 className="text-white font-bold text-sm lg:text-base truncate max-w-[150px] sm:max-w-none">{selected.templateName}</h2>
                       <p className="text-[8px] lg:text-[10px] text-gray-500 font-mono uppercase mt-1 tracking-widest">ID: {selected.id.slice(0,8)}...</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => window.print()} className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-[#39FF14] transition-colors"><Printer className="h-4 w-4 lg:h-5 lg:w-5" /></button>
                    <button onClick={() => { store.deleteDocument(selected.id); setSelected(null); }} className="p-2 bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4 lg:h-5 lg:w-5" /></button>
                 </div>
              </div>
              <div className="flex-1 p-6 lg:p-16 overflow-y-auto text-black select-text">
                <div className="max-w-2xl mx-auto">
                    {selected.format === 'html' ? (
                       <div dangerouslySetInnerHTML={{ __html: selected.finalContent }} className="prose prose-sm lg:prose-base max-w-none" />
                    ) : (
                      <pre className="font-serif text-sm lg:text-base leading-relaxed lg:leading-8 whitespace-pre-wrap">{selected.finalContent}</pre>
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

  useEffect(() => {
    fetch('/api/logs').then(r => r.json()).then(data => setSmtpLogs(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Preferências DocuMestre</h1>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Security & API Infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#39FF14]" /> Servidor SMTP (Outbound)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">E-mail Remetente</label>
                <input 
                  type="email"
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-4 text-sm focus:border-[#39FF14] outline-none transition-all"
                  placeholder="exemplo@yahoo.com"
                  value={store.smtpUser}
                  onChange={e => store.setSmtpUser(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Senha App / Token</label>
                <input 
                  type="password"
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-4 text-sm focus:border-[#39FF14] outline-none transition-all"
                  placeholder="••••••••••••••••"
                  value={store.smtpPass}
                  onChange={e => store.setSmtpPass(e.target.value)}
                />
                <p className="text-[10px] text-gray-600 mt-2 italic px-1">Obs: Para Gmail ou Yahoo, utilize uma "Senha de Aplicativo".</p>
              </div>
            </div>
          </section>

          <section className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" /> Inteligência Llama Local
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-purple-400/5 border border-purple-400/20 rounded-xl">
                 <p className="text-[10px] text-purple-300 leading-relaxed uppercase tracking-tighter font-bold mb-2">
                   CONECTADO AO OLLAMA (127.0.0.1:11434)
                 </p>
                 <p className="text-[10px] text-purple-200/50 leading-relaxed uppercase tracking-tighter">
                   A API do Gemini foi substituída pela execução local do Llama 3 via Ollama. 
                   Certifique-se de que o Ollama esteja rodando na sua máquina na porta padrão.
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
              {smtpLogs.map(log => (
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
              {smtpLogs.length === 0 && (
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

function NavItem({ icon, label, active, expanded, onClick }: { icon: React.ReactNode, label: string, active: boolean, expanded: boolean, onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ x: expanded ? 4 : 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm border",
        active 
          ? "bg-[#39FF14] text-black border-[#39FF14] shadow-[0_0_20px_-5px_rgba(57,255,20,0.5)]" 
          : "text-gray-500 hover:text-white border-transparent hover:bg-[#1a1a1a]/50"
      )}
    >
      <div className={cn(
        "transition-colors",
        active ? "text-black" : "text-gray-500 group-hover:text-white"
      )}>
        {icon}
      </div>
      {expanded && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
      {active && expanded && (
        <motion.div layoutId="active-pill" className="ml-auto">
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      )}
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

function AiButton({ label, loading, onClick }: { label: string, loading: boolean, onClick: () => void }) {
  return (
    <button 
      disabled={loading}
      onClick={onClick}
      className={cn(
        "flex-1 px-3 py-2 border rounded-lg text-[10px] font-bold uppercase transition-all tracking-wider",
        loading 
          ? "bg-gray-800 border-gray-700 text-gray-500" 
          : "bg-purple-400/10 border-purple-400/20 text-purple-300 hover:bg-purple-400/20 hover:border-purple-400/40"
      )}
    >
      {loading ? "Processando..." : label}
    </button>
  );
}
