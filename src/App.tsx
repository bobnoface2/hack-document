import React, { useState } from 'react';
import { useAppStore } from './store';
import { Code, FileText, History, Settings, Printer, Download, Save, Plus, Trash2, Mail, TerminalSquare, Menu, X } from 'lucide-react';
import { generateId, extractVariables, replaceVariables, cn } from './lib/utils';
import { Template, GeneratedDocument } from './types';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

type Tab = 'generate' | 'templates' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const store = useAppStore();

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-white font-sans">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile/Toggle Sidebar Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md text-[#39FF14]"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Hamburger Toggle (Optional but adds to the theme) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="hidden lg:flex absolute top-4 left-4 z-50 p-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md text-[#39FF14] hover:bg-[#1a1a1a] transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

        {/* Sidebar */}
        <div className={cn(
          "bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col items-center py-6 shadow-2xl transition-all duration-300 z-40",
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-0 overflow-hidden"
        )}>
          <div className="flex items-center justify-between w-full px-4 mb-8">
            <h1 className="text-xl font-bold text-[#39FF14] flex items-center gap-2 truncate">
              <img src="/imagem.ico" alt="Icon" className="h-6 w-6" />
              <span className="font-mono tracking-wider">Hack Document</span>
            </h1>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-[#1a1a1a] rounded-md text-[#718096] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 w-full px-4 space-y-2">
            <NavItem
              icon={<FileText />}
              label="Gerar Documento"
              active={activeTab === 'generate'}
              onClick={() => { setActiveTab('generate'); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
            />
            <NavItem
              icon={<Settings />}
              label="Templates"
              active={activeTab === 'templates'}
              onClick={() => { setActiveTab('templates'); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
            />
            <NavItem
              icon={<History />}
              label="Histórico"
              active={activeTab === 'history'}
              onClick={() => { setActiveTab('history'); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
            />
          </nav>
        </div>

        {/* Main Content */}
        <div className={cn(
          "flex-1 overflow-auto h-full p-8 transition-all duration-300",
          !isSidebarOpen && "lg:pl-16" // Give some space for the toggle button
        )}>
          {activeTab === 'generate' && <GenerateView store={store} />}
          {activeTab === 'templates' && <TemplatesView store={store} />}
          {activeTab === 'history' && <HistoryView store={store} />}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="h-8 bg-[#0a0a0a] border-t border-[#1a1a1a] flex items-center justify-center px-4 text-xs font-mono text-[#718096]">
        Criado e desenvolvido por <a href="https://wa.me/5521993367328" target="_blank" rel="noopener noreferrer" className="ml-1 text-[#39FF14] hover:text-[#7FFF00] hover:underline transition-colors">Wallace Arão</a>
      </footer>
    </div>
  );
}

// --- Views ---

function GenerateView({ store }: { store: ReturnType<typeof useAppStore> }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(store.templates[0]?.id || '');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [signatures, setSignatures] = useState<{id: string, name: string, role: string}[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const template = store.templates.find(t => t.id === selectedTemplateId);
  const detectedVars = template ? extractVariables(template.content) : [];
  
  let finalContent = template 
    ? replaceVariables(template.content, variables) 
    : '';

  if (template && signatures.length > 0) {
    let signatureBlock = '';
    if (template.format === 'html') {
      const sigsHtml = signatures.map(s => `
        <div style="text-align: center; width: 40%; min-width: 200px; margin-bottom: 20px;">
          <div style="border-top: 1px solid #000; padding-top: 10px; font-weight: bold; color: inherit;">
            ${s.name || '_________________________'}
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">
            ${s.role || 'Cargo/Função'}
          </div>
        </div>
      `).join('');
      signatureBlock = `<div style="display: flex; justify-content: space-around; flex-wrap: wrap; margin-top: 50px; gap: 20px;">${sigsHtml}</div>`;
    } else {
      signatureBlock = '\n\n' + signatures.map(s => `\n_____________________________________________________\n${s.name || '_________________________'}\n${s.role || 'Cargo/Função'}\n`).join('\n');
    }
    
    if (template.format === 'html' && finalContent.trim().endsWith('</div>')) {
      finalContent = finalContent.replace(/(<\/div>\s*)$/i, signatureBlock + '$1');
    } else {
      finalContent += signatureBlock;
    }
  }

  const handleVarChange = (name: string, value: string) => {
    setVariables(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveToHistory = () => {
    if (!template) return;
    const doc: GeneratedDocument = {
      id: generateId(),
      templateId: template.id,
      templateName: template.name,
      type: template.type,
      format: template.format || 'text',
      variables,
      finalContent,
      createdAt: new Date().toISOString()
    };
    store.saveDocument(doc);
    alert('Documento salvo no histórico com sucesso!');
  };

  const handleOpenEmailModal = () => {
    setShowEmailModal(true);
  };

  const handlePrint = () => {
    let printIframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'print-iframe';
      printIframe.style.position = 'absolute';
      printIframe.style.width = '0px';
      printIframe.style.height = '0px';
      printIframe.style.border = 'none';
      document.body.appendChild(printIframe);
    }

    const css = template?.format === 'html' 
      ? 'body { padding: 20px; font-family: sans-serif; } @page { size: A4; margin: 20mm; }'
      : 'body { font-family: Arial, sans-serif; padding: 20px; white-space: pre-wrap; line-height: 1.5; } @page { size: A4; margin: 20mm; }';

    const doc = printIframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>${template?.name || 'Documento'}</title>
            <style>${css}</style>
          </head>
          <body>${finalContent}</body>
        </html>
      `);
      doc.close();
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    }
  };

  if (!template) {
    return <div className="text-[#718096] p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">Nenhum template disponível. Crie um na aba "Templates".</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center bg-[#0a0a0a] p-4 rounded-xl border border-[#1a1a1a]">
        <div>
          <h2 className="text-sm font-bold uppercase text-[#718096] tracking-widest">1. Escolha o Modelo</h2>
          <select 
            className="mt-2 block w-96 rounded-md border-[#1a1a1a] focus:border-[#39FF14] focus:ring-[#39FF14] border p-2 bg-[#050505] text-[#ffffff] shadow-inner"
            value={selectedTemplateId}
            onChange={(e) => {
              setSelectedTemplateId(e.target.value);
              setVariables({});
              setSignatures([]);
            }}
          >
            {store.templates.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <button onClick={handleSaveToHistory} className="flex items-center gap-2 px-4 py-2 bg-[#39FF14] text-black font-bold rounded-md hover:bg-[#32CD32] shadow-lg shadow-green-900/20 transition">
            <Save className="h-4 w-4" /> Salvar no Histórico
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#222222] text-white font-bold rounded-md hover:bg-[#1a1a1a] transition">
            <Printer className="h-4 w-4" /> Imprimir / PDF
          </button>
          <button onClick={handleOpenEmailModal} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#222222] text-[#39FF14] font-bold rounded-md hover:bg-[#1a1a1a] transition">
            <Mail className="h-4 w-4" /> Enviar por E-mail
          </button>
          {template.format === 'html' && (
            <button onClick={() => {
              const blob = new Blob([finalContent], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${template.name.replace(/\s+/g, '_')}.html`;
              a.click();
              URL.revokeObjectURL(url);
            }} className="flex items-center gap-2 px-4 py-2 bg-[#050505] border border-[#222222] text-[#39FF14] font-bold rounded-md hover:bg-[#1a1a1a] transition">
              <Download className="h-4 w-4" /> Baixar HTML
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
        <div className="bg-[#0a0a0a] p-6 rounded-xl border border-[#1a1a1a] flex flex-col overflow-y-auto">
          <h3 className="text-xs uppercase font-bold text-[#718096] tracking-widest mb-4 border-b border-[#1a1a1a] pb-2">2. Preencha os Dados (Variáveis)</h3>
          {detectedVars.length === 0 ? (
            <p className="text-sm text-[#718096]">Este modelo não possui variáveis (marcadas com {'{{variavel}}'}).</p>
          ) : (
            <div className="space-y-4">
              {detectedVars.map(v => (
                <div key={v}>
                  <label className="block text-xs font-mono text-[#ffffff] mb-1"><span className="text-[#39FF14]">$</span> {v}</label>
                  {v.toLowerCase().includes('descricao') || v.toLowerCase().includes('conteudo') ? (
                    <textarea 
                      className="w-full rounded-md border border-[#1a1a1a] bg-[#050505] text-[#ffffff] p-2 focus:border-[#39FF14] focus:ring-[#39FF14] text-xs font-mono"
                      rows={3}
                      value={variables[v] || ''}
                      onChange={(e) => handleVarChange(v, e.target.value)}
                    />
                  ) : (
                    <input 
                      type="text"
                      className="w-full rounded-md border border-[#1a1a1a] bg-[#050505] text-[#ffffff] p-2 focus:border-[#39FF14] focus:ring-[#39FF14] text-xs font-mono"
                      value={variables[v] || ''}
                      onChange={(e) => handleVarChange(v, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 border-t border-[#1a1a1a] pt-6 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs uppercase font-bold text-[#718096] tracking-widest">Assinaturas Adicionais</h3>
              <button 
                onClick={() => setSignatures(prev => [...prev, { id: generateId(), name: '', role: '' }])}
                className="flex items-center gap-1 px-3 py-1 bg-[#1a1a1a] text-white text-xs font-bold rounded hover:bg-[#39FF14] transition"
              >
                <Plus className="h-3 w-3" /> Adicionar Assinatura
              </button>
            </div>
            
            <div className="space-y-4">
              {signatures.map(sig => (
                <div key={sig.id} className="flex gap-4 p-4 rounded-md border border-[#1a1a1a] bg-[#050505] relative group">
                  <button 
                    onClick={() => setSignatures(prev => prev.filter(s => s.id !== sig.id))}
                    className="absolute top-2 right-2 text-[#718096] hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-mono text-[#718096] mb-1">Nome</label>
                    <input 
                      placeholder="Ex: João Silva"
                      className="w-full rounded-md border border-[#1a1a1a] bg-[#000000] text-[#ffffff] p-2 focus:border-[#39FF14] focus:ring-[#39FF14] text-xs font-mono"
                      value={sig.name}
                      onChange={e => setSignatures(v => v.map(s => s.id === sig.id ? {...s, name: e.target.value} : s))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-mono text-[#718096] mb-1">Cargo/Função</label>
                    <input 
                      placeholder="Ex: Diretor"
                      className="w-full rounded-md border border-[#1a1a1a] bg-[#000000] text-[#ffffff] p-2 focus:border-[#39FF14] focus:ring-[#39FF14] text-xs font-mono"
                      value={sig.role}
                      onChange={e => setSignatures(v => v.map(s => s.id === sig.id ? {...s, role: e.target.value} : s))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white text-[#0a0a0a] p-0 rounded-xl shadow-2xl flex flex-col relative overflow-hidden border border-[#1a1a1a] min-h-0">
          <div className="absolute top-4 right-4 flex gap-2">
             <span className="px-2 py-1 bg-[#0a0a0a] text-white rounded-[4px] text-[10px] font-bold border border-[#1a1a1a] uppercase">Preview Mode</span>
          </div>
          <div className="flex-1 overflow-y-auto p-12 select-text cursor-text">
            <div className="max-w-2xl mx-auto">
              {template.format === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: finalContent }} />
              ) : (
                <pre className="font-serif whitespace-pre-wrap text-sm text-justify leading-relaxed break-words">
                  {finalContent}
                </pre>
              )}
            </div>
          </div>
          <div className="h-10 bg-gray-50 border-t border-gray-200 flex items-center px-6 gap-6">
             <div className="text-[10px] font-bold text-gray-500 uppercase">Document Generated via Schema</div>
          </div>
        </div>
      </div>

      <EmailModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        documentTitle={template.name}
        htmlContent={template.format === 'html' ? finalContent : `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap; font-size: 14px; color: #333;">${finalContent}</pre>`}
        smtpUser={store.smtpUser}
        setSmtpUser={store.setSmtpUser}
        smtpPass={store.smtpPass}
        setSmtpPass={store.setSmtpPass}
      />
    </div>
  );
}

function TemplatesView({ store }: { store: ReturnType<typeof useAppStore> }) {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleNew = () => {
    setEditingTemplate({
      id: generateId(),
      name: 'Novo Template',
      type: 'documento',
      format: 'text',
      content: 'Escreva seu texto aqui.\\nInsira variáveis usando {{nome_da_variavel}}.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    if (store.templates.some(t => t.id === editingTemplate.id)) {
      store.updateTemplate(editingTemplate.id, editingTemplate);
    } else {
      store.addTemplate(editingTemplate);
    }
    setEditingTemplate(null);
  };

  return (
    <div className="h-full flex gap-8">
      <div className="w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl flex flex-col shadow-xl">
        <div className="p-4 border-b border-[#1a1a1a] flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase font-bold text-[#718096] tracking-widest">Meus Templates</h3>
          </div>
          <button 
            onClick={handleNew} 
            className="w-full flex items-center justify-center gap-2 p-3 bg-[#39FF14]/10 text-[#39FF14] hover:bg-[#39FF14]/20 border border-[#39FF14]/20 rounded-md transition font-bold text-xs uppercase tracking-wider"
            title="Clique aqui para criar um novo template em branco"
          >
            <Plus className="h-4 w-4" />
            Criar Novo Template
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {store.templates.map(t => (
            <div 
              key={t.id} 
              onClick={() => setEditingTemplate({...t})}
              className={cn(
                "p-3 rounded-md cursor-pointer flex justify-between items-center group border border-transparent",
                editingTemplate?.id === t.id ? "bg-[#1a1a1a] border-[#222222]" : "hover:bg-[#1a1a1a]/50"
              )}
            >
              <div>
                <div className="font-medium text-sm text-[#ffffff]">{t.name}</div>
                <div className="text-xs text-[#718096] uppercase mt-1">{t.type}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); store.deleteTemplate(t.id); if(editingTemplate?.id === t.id) setEditingTemplate(null); }}
                className="text-[#718096] hover:text-red-400 hidden group-hover:block transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl shadow-xl p-6 flex flex-col">
        {editingTemplate ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold uppercase text-[#718096] tracking-widest">Editar Template</h2>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-[#39FF14] text-black font-bold rounded-md hover:bg-[#2B6CB0] shadow-lg shadow-green-900/20 transition">
                <Save className="h-4 w-4" /> Salvar Template
              </button>
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-mono text-[#ffffff] mb-1">NOME DO TEMPLATE</label>
                  <input 
                    className="w-full border p-2 rounded-md focus:border-[#39FF14] focus:ring-[#39FF14] border-[#1a1a1a] bg-[#050505] text-[#ffffff] text-sm" 
                    value={editingTemplate.name} 
                    onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} 
                  />
                </div>
                <div className="w-48">
                  <label className="block text-xs font-mono text-[#ffffff] mb-1">TIPO DE DOCUMENTO</label>
                  <select 
                    className="w-full border p-2 rounded-md bg-[#050505] border-[#1a1a1a] text-[#ffffff] text-sm focus:border-[#39FF14] focus:ring-[#39FF14]"
                    value={editingTemplate.type}
                    onChange={e => setEditingTemplate({...editingTemplate, type: e.target.value as any})}
                  >
                    <option value="documento">Documento Genérico</option>
                    <option value="nota">Nota Fiscal / Recibo</option>
                    <option value="recibo">Recibo Simples</option>
                  </select>
                </div>
                <div className="w-48">
                  <label className="block text-xs font-mono text-[#ffffff] mb-1">FORMATO</label>
                  <select 
                    className="w-full border p-2 rounded-md bg-[#050505] border-[#1a1a1a] text-[#ffffff] text-sm focus:border-[#39FF14] focus:ring-[#39FF14]"
                    value={editingTemplate.format || 'text'}
                    onChange={e => setEditingTemplate({...editingTemplate, format: e.target.value as any})}
                  >
                    <option value="text">Texto Simples</option>
                    <option value="html">Código HTML</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 flex gap-4 min-h-0">
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-mono text-[#ffffff] mb-1 flex justify-between items-end mt-4">
                    <span>CONTEÚDO DO MODELO</span>
                    <span className="text-[10px] font-bold text-[#ffffff] bg-green-500/30 border border-green-500/50 px-2 py-0.5 rounded">Dica: Use {'{{nome}}'} para variáveis</span>
                  </label>
                  {editingTemplate.format === 'html' ? (
                     <div className="flex-1 bg-white text-white rounded-md overflow-hidden mt-1 shadow-inner h-full flex flex-col">
                       <ReactQuill 
                          theme="snow"
                          value={editingTemplate.content}
                          onChange={(content) => setEditingTemplate({...editingTemplate, content})}
                          className="h-full flex-1 flex flex-col [&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto"
                       />
                     </div>
                  ) : (
                    <textarea 
                      className="flex-1 w-full border border-[#1a1a1a] bg-[#000000] text-[#ffffff] font-mono text-[13px] p-4 rounded-md focus:border-[#39FF14] focus:ring-[#39FF14] resize-none shadow-inner"
                      value={editingTemplate.content}
                      onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                    />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col mt-4">
                  <label className="block text-xs font-mono text-[#ffffff] mb-1 uppercase">
                    Preview do Template
                  </label>
                  <div className="flex-1 w-full bg-white text-white p-4 rounded-md overflow-y-auto border border-[#1a1a1a] shadow-inner text-sm">
                    {editingTemplate.format === 'html' ? (
                      <div dangerouslySetInnerHTML={{ __html: editingTemplate.content }} />
                    ) : (
                      <pre className="font-serif whitespace-pre-wrap leading-relaxed break-words">
                        {editingTemplate.content}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#718096] flex-col gap-4">
            <Settings className="h-12 w-12 opacity-20" />
            <p className="font-mono text-sm">Selecione um template à esquerda ou crie um novo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryView({ store }: { store: ReturnType<typeof useAppStore> }) {
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDocument | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  if (store.documents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#718096]">
        <History className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-sm uppercase tracking-widest font-bold">Nenhum documento gerado</h2>
        <p className="font-mono text-xs mt-2">Gere e salve documentos para vê-los aqui.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-8">
      <div className="w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl flex flex-col shadow-xl">
        <div className="p-4 border-b border-[#1a1a1a]">
          <h3 className="text-xs uppercase font-bold text-[#718096] tracking-widest">Salvos Recentemente</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {store.documents.map(d => (
            <div 
              key={d.id} 
              onClick={() => setSelectedDoc(d)}
              className={cn(
                "p-3 rounded-md cursor-pointer flex justify-between items-center group border border-transparent",
                selectedDoc?.id === d.id ? "bg-[#1a1a1a] border-[#222222]" : "hover:bg-[#1a1a1a]/50"
              )}
            >
              <div className="truncate pr-2">
                <div className="font-medium text-sm truncate text-[#ffffff]">{d.templateName}</div>
                <div className="text-[10px] uppercase font-mono text-[#718096] mt-1">{new Date(d.createdAt).toLocaleString()}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); store.deleteDocument(d.id); if(selectedDoc?.id === d.id) setSelectedDoc(null); }}
                className="text-[#718096] hover:text-red-400 hidden group-hover:block transition shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl shadow-xl flex flex-col overflow-hidden">
        {selectedDoc ? (
          <>
            <div className="flex justify-between items-center p-4 border-b border-[#1a1a1a] bg-[#0a0a0a]">
              <div>
                <h2 className="text-sm font-bold uppercase text-[#ffffff] tracking-widest">{selectedDoc.templateName}</h2>
                <p className="text-[10px] font-mono text-[#718096] mt-1">Gerado em {new Date(selectedDoc.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#222222] text-[#39FF14] font-bold text-xs rounded-md hover:bg-[#1a1a1a] transition">
                  <Mail className="h-4 w-4" /> Enviar por E-mail
                </button>
                <button
                  onClick={() => {
                    let printIframe = document.getElementById('print-iframe-history') as HTMLIFrameElement;
                    if (!printIframe) {
                      printIframe = document.createElement('iframe');
                      printIframe.id = 'print-iframe-history';
                      printIframe.style.position = 'absolute';
                      printIframe.style.width = '0px';
                      printIframe.style.height = '0px';
                      printIframe.style.border = 'none';
                      document.body.appendChild(printIframe);
                    }
                    
                    const css = selectedDoc.format === 'html'
                      ? 'body { padding: 20px; font-family: sans-serif; } @page { size: A4; margin: 20mm; }'
                      : 'body { font-family: Arial, sans-serif; padding: 20px; white-space: pre-wrap; line-height: 1.5; } @page { size: A4; margin: 20mm; }';
                      
                    const doc = printIframe.contentWindow?.document;
                    if (doc) {
                      doc.open();
                      doc.write(`
                        <html>
                          <head><style>${css}</style></head>
                          <body>${selectedDoc.finalContent}</body>
                        </html>
                      `);
                      doc.close();
                      printIframe.contentWindow?.focus();
                      printIframe.contentWindow?.print();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#222222] text-white font-bold text-xs rounded-md hover:bg-[#1a1a1a] transition"
                >
                  <Printer className="h-4 w-4" /> Imprimir
                </button>
                {selectedDoc.format === 'html' && (
                  <button onClick={() => {
                     const blob = new Blob([selectedDoc.finalContent], { type: 'text/html' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = `${selectedDoc.templateName.replace(/\s+/g, '_')}.html`;
                     a.click();
                     URL.revokeObjectURL(url);
                  }} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#222222] text-[#39FF14] font-bold text-xs rounded-md hover:bg-[#1a1a1a] transition">
                    <Download className="h-4 w-4" /> Baixar HTML
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 bg-white text-[#0a0a0a] select-text cursor-text">
              <div className="max-w-2xl mx-auto">
                {selectedDoc.format === 'html' ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedDoc.finalContent }} />
                ) : (
                  <pre className="font-serif whitespace-pre-wrap text-sm text-justify leading-relaxed break-words">
                    {selectedDoc.finalContent}
                  </pre>
                )}
              </div>
            </div>

            <div className="h-10 bg-gray-50 border-t border-gray-200 flex items-center px-6 gap-6">
               <div className="text-[10px] font-bold text-gray-500 uppercase">Document From History</div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#718096] font-mono text-sm p-6">
            Selecione um histórico à esquerda para visualizar.
          </div>
        )}
      </div>

      <EmailModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        documentTitle={selectedDoc.templateName}
        htmlContent={selectedDoc.format === 'html' ? selectedDoc.finalContent : `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap; font-size: 14px; color: #333;">${selectedDoc.finalContent}</pre>`}
        smtpUser={store.smtpUser}
        setSmtpUser={store.setSmtpUser}
        smtpPass={store.smtpPass}
        setSmtpPass={store.setSmtpPass}
      />
    </div>
  );
}

// --- Components ---

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  htmlContent: string;
  smtpUser: string;
  setSmtpUser: (v: string) => void;
  smtpPass: string;
  setSmtpPass: (v: string) => void;
}

function EmailModal({ isOpen, onClose, documentTitle, htmlContent, smtpUser, setSmtpUser, smtpPass, setSmtpPass }: EmailModalProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(documentTitle);
  const [showConfig, setShowConfig] = useState(!smtpUser || !smtpPass);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !smtpUser || !smtpPass) {
      if (!smtpUser || !smtpPass) {
        setShowConfig(true);
        setStatus('error');
        setErrorMessage('Por favor, preencha as credenciais SMTP antes de enviar.');
      }
      return;
    }

    setIsSending(true);
    setStatus('idle');
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: email, 
          subject: subject, 
          html: htmlContent,
          smtpUser: smtpUser,
          smtpPass: smtpPass
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setEmail('');
        }, 2000);
      } else {
        throw new Error(data.error || 'Erro ao enviar e-mail');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Falha na conexão com o servidor');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-bold flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#39FF14]" />
            Enviar via SMTP Seguro
          </h3>
          <button onClick={onClose} className="text-[#718096] hover:text-white transition">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="py-8 text-center bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-green-500 text-4xl mb-2">✓</div>
            <p className="text-green-400 font-bold">E-mail enviado com sucesso!</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            
            <div className="border border-[#1a1a1a] rounded-md p-3 bg-[#050505]">
              <button 
                type="button" 
                onClick={() => setShowConfig(!showConfig)}
                className="w-full flex items-center justify-between text-xs font-mono text-[#718096] hover:text-white uppercase tracking-wider mb-2 transition"
              >
                <span>Configurações do Remetente (SMTP Yahoo)</span>
                <Settings className="h-4 w-4" />
              </button>
              
              {showConfig && (
                <div className="space-y-3 pt-2 border-t border-[#1a1a1a] mt-2">
                  <div>
                    <label className="block text-xs text-[#718096] mb-1">Seu E-mail (Yahoo)</label>
                    <input 
                      type="email"
                      required
                      placeholder="seuemail@yahoo.com"
                      className="w-full rounded border border-[#222222] bg-[#0a0a0a] text-white p-2 text-sm focus:border-[#39FF14] outline-none transition"
                      value={smtpUser}
                      onChange={e => setSmtpUser(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#718096] mb-1">Senha de Aplicativo</label>
                    <input 
                      type="password"
                      required
                      placeholder="sjwjqekotkxkazjj"
                      className="w-full rounded border border-[#222222] bg-[#0a0a0a] text-white p-2 text-sm focus:border-[#39FF14] outline-none transition"
                      value={smtpPass}
                      onChange={e => setSmtpPass(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-[#A0AEC0] italic leading-tight">
                    * Estas credenciais ficam salvas localmente apenas no seu navegador, mantendo a privacidade da sua senha.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-mono text-[#718096] mb-1 uppercase tracking-wider">E-mail do Destinatário</label>
              <input 
                type="email"
                required
                placeholder="exemplo@email.com"
                className="w-full rounded-md border border-[#1a1a1a] bg-[#050505] text-[#ffffff] p-3 focus:border-[#39FF14] focus:ring-[#39FF14] outline-none transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#718096] mb-1 uppercase tracking-wider">Assunto</label>
              <input 
                type="text"
                required
                className="w-full rounded-md border border-[#1a1a1a] bg-[#050505] text-[#ffffff] p-3 focus:border-[#39FF14] focus:ring-[#39FF14] outline-none transition"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>

            {status === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSending}
                className={cn(
                  "w-full py-3 rounded-md font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                  isSending ? "bg-gray-600 cursor-not-allowed" : "bg-[#39FF14] hover:bg-[#2B6CB0] active:scale-[0.98]"
                )}
              >
                {isSending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" /> Enviar Agora
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-[#1a1a1a]">
              <p className="text-[10px] text-[#718096] text-center italic">
                O e-mail será enviado decorado com o layout original através do servidor seguro SMTP Yahoo.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors border border-transparent",
        active 
          ? "bg-[#1a1a1a] text-white border-[#222222]" 
          : "text-[#718096] hover:bg-[#1a1a1a]/50 hover:text-white"
      )}
    >
      <span className={cn(active ? "text-[#39FF14]" : "text-[#718096]")}>
        {icon}
      </span>
      {label}
    </button>
  );
}

