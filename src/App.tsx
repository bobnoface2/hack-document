import React, { useState } from 'react';
import { useAppStore } from './store';
import { Code, FileText, History, Settings, Printer, Download, Save, Plus, Trash2, Mail, TerminalSquare } from 'lucide-react';
import { generateId, extractVariables, replaceVariables, cn } from './lib/utils';
import { Template, GeneratedDocument } from './types';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

type Tab = 'generate' | 'templates' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const store = useAppStore();

  return (
    <div className="flex flex-col h-screen bg-[#0F1115] text-[#E2E8F0] font-sans">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#1A202C] border-r border-[#2D3748] flex flex-col items-center py-6 shadow-2xl">
          <h1 className="text-xl font-bold mb-8 text-[#3182CE] flex items-center gap-2">
            <TerminalSquare className="h-6 w-6 text-[#48BB78]" />
            <span className="font-mono tracking-wider">Hack Document</span>
          </h1>
          <nav className="flex-1 w-full px-4 space-y-2">
            <NavItem
              icon={<FileText />}
              label="Gerar Documento"
              active={activeTab === 'generate'}
              onClick={() => setActiveTab('generate')}
            />
            <NavItem
              icon={<Settings />}
              label="Templates"
              active={activeTab === 'templates'}
              onClick={() => setActiveTab('templates')}
            />
            <NavItem
              icon={<History />}
              label="Histórico"
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
            />
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto h-full p-8">
          {activeTab === 'generate' && <GenerateView store={store} />}
          {activeTab === 'templates' && <TemplatesView store={store} />}
          {activeTab === 'history' && <HistoryView store={store} />}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="h-8 bg-[#1A202C] border-t border-[#2D3748] flex items-center justify-center px-4 text-xs font-mono text-[#718096]">
        Criado e desenvolvido por <a href="https://wa.me/5521993367328" target="_blank" rel="noopener noreferrer" className="ml-1 text-[#3182CE] hover:text-[#63B3ED] hover:underline transition-colors">Wallace Arão</a>
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

  const handleCopyToEmail = async () => {
    try {
      const isHtml = template?.format === 'html';
      const htmlContent = isHtml 
        ? finalContent 
        : `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap; font-size: 14px;">${finalContent}</pre>`;
      const textFallback = isHtml ? finalContent.replace(/<[^>]+>/g, ' ') : finalContent;

      const data = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([textFallback], { type: 'text/plain' })
      });
      await navigator.clipboard.write([data]);
      
      setShowEmailModal(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao copiar. Tente selecionar o texto e copiar manualmente livre de bloqueios do navegador.');
    }
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
    return <div className="text-[#718096] p-4 bg-[#1A202C] rounded-xl border border-[#2D3748]">Nenhum template disponível. Crie um na aba "Templates".</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center bg-[#1A202C] p-4 rounded-xl border border-[#2D3748]">
        <div>
          <h2 className="text-sm font-bold uppercase text-[#718096] tracking-widest">1. Escolha o Modelo</h2>
          <select 
            className="mt-2 block w-96 rounded-md border-[#2D3748] focus:border-[#3182CE] focus:ring-[#3182CE] border p-2 bg-[#13171F] text-[#E2E8F0] shadow-inner"
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
          <button onClick={handleSaveToHistory} className="flex items-center gap-2 px-4 py-2 bg-[#3182CE] text-white font-bold rounded-md hover:bg-[#2B6CB0] shadow-lg shadow-blue-900/20 transition">
            <Save className="h-4 w-4" /> Salvar no Histórico
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-[#1A202C] border border-[#4A5568] text-white font-bold rounded-md hover:bg-[#2D3748] transition">
            <Printer className="h-4 w-4" /> Imprimir / PDF
          </button>
          <button onClick={handleCopyToEmail} className="flex items-center gap-2 px-4 py-2 bg-[#1A202C] border border-[#4A5568] text-[#48BB78] font-bold rounded-md hover:bg-[#2D3748] transition">
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
            }} className="flex items-center gap-2 px-4 py-2 bg-[#13171F] border border-[#4A5568] text-[#3182CE] font-bold rounded-md hover:bg-[#2D3748] transition">
              <Download className="h-4 w-4" /> Baixar HTML
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
        <div className="bg-[#1A202C] p-6 rounded-xl border border-[#2D3748] flex flex-col overflow-y-auto">
          <h3 className="text-xs uppercase font-bold text-[#718096] tracking-widest mb-4 border-b border-[#2D3748] pb-2">2. Preencha os Dados (Variáveis)</h3>
          {detectedVars.length === 0 ? (
            <p className="text-sm text-[#718096]">Este modelo não possui variáveis (marcadas com {'{{variavel}}'}).</p>
          ) : (
            <div className="space-y-4">
              {detectedVars.map(v => (
                <div key={v}>
                  <label className="block text-xs font-mono text-[#E2E8F0] mb-1"><span className="text-[#3182CE]">$</span> {v}</label>
                  {v.toLowerCase().includes('descricao') || v.toLowerCase().includes('conteudo') ? (
                    <textarea 
                      className="w-full rounded-md border border-[#2D3748] bg-[#13171F] text-[#E2E8F0] p-2 focus:border-[#3182CE] focus:ring-[#3182CE] text-xs font-mono"
                      rows={3}
                      value={variables[v] || ''}
                      onChange={(e) => handleVarChange(v, e.target.value)}
                    />
                  ) : (
                    <input 
                      type="text"
                      className="w-full rounded-md border border-[#2D3748] bg-[#13171F] text-[#E2E8F0] p-2 focus:border-[#3182CE] focus:ring-[#3182CE] text-xs font-mono"
                      value={variables[v] || ''}
                      onChange={(e) => handleVarChange(v, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 border-t border-[#2D3748] pt-6 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs uppercase font-bold text-[#718096] tracking-widest">Assinaturas Adicionais</h3>
              <button 
                onClick={() => setSignatures(prev => [...prev, { id: generateId(), name: '', role: '' }])}
                className="flex items-center gap-1 px-3 py-1 bg-[#2D3748] text-white text-xs font-bold rounded hover:bg-[#3182CE] transition"
              >
                <Plus className="h-3 w-3" /> Adicionar Assinatura
              </button>
            </div>
            
            <div className="space-y-4">
              {signatures.map(sig => (
                <div key={sig.id} className="flex gap-4 p-4 rounded-md border border-[#2D3748] bg-[#13171F] relative group">
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
                      className="w-full rounded-md border border-[#2D3748] bg-[#0F1115] text-[#E2E8F0] p-2 focus:border-[#3182CE] focus:ring-[#3182CE] text-xs font-mono"
                      value={sig.name}
                      onChange={e => setSignatures(v => v.map(s => s.id === sig.id ? {...s, name: e.target.value} : s))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-mono text-[#718096] mb-1">Cargo/Função</label>
                    <input 
                      placeholder="Ex: Diretor"
                      className="w-full rounded-md border border-[#2D3748] bg-[#0F1115] text-[#E2E8F0] p-2 focus:border-[#3182CE] focus:ring-[#3182CE] text-xs font-mono"
                      value={sig.role}
                      onChange={e => setSignatures(v => v.map(s => s.id === sig.id ? {...s, role: e.target.value} : s))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white text-[#1A202C] p-0 rounded-xl shadow-2xl flex flex-col relative overflow-hidden border border-[#2D3748] min-h-0">
          <div className="absolute top-4 right-4 flex gap-2">
             <span className="px-2 py-1 bg-[#1A202C] text-white rounded-[4px] text-[10px] font-bold border border-[#2D3748] uppercase">Preview Mode</span>
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

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A202C] border border-[#2D3748] p-6 rounded-xl shadow-2xl max-w-sm w-full">
            <h3 className="text-white text-lg font-bold mb-2">Conteúdo Copiado! ✅</h3>
            <p className="text-[#718096] text-sm mb-6">O documento está na sua área de transferência. Escolha onde deseja abrir para colar (Ctrl+V):</p>
            <div className="space-y-3">
              <a href="https://mail.google.com/mail/?view=cm&fs=1" target="_blank" rel="noreferrer" onClick={() => setShowEmailModal(false)} className="block w-full text-center py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded hover:bg-red-600/20 font-bold transition">Gmail</a>
              <a href="https://outlook.live.com/mail/0/deeplink/compose" target="_blank" rel="noreferrer" onClick={() => setShowEmailModal(false)} className="block w-full text-center py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded hover:bg-blue-600/20 font-bold transition">Outlook</a>
              <a href="https://compose.mail.yahoo.com/" target="_blank" rel="noreferrer" onClick={() => setShowEmailModal(false)} className="block w-full text-center py-2 bg-purple-600/10 text-purple-500 border border-purple-500/20 rounded hover:bg-purple-600/20 font-bold transition">Yahoo Mail</a>
              <a href={`mailto:?subject=${encodeURIComponent(template?.name || 'Documento')}`} onClick={() => setShowEmailModal(false)} className="block w-full text-center py-2 bg-gray-600/10 text-gray-300 border border-gray-500/20 rounded hover:bg-gray-600/20 font-bold transition">App Padrão (Mail/Windows)</a>
            </div>
            <button onClick={() => setShowEmailModal(false)} className="mt-6 w-full py-2 text-[#718096] hover:text-white text-sm transition">Fechar</button>
          </div>
        </div>
      )}
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
      <div className="w-80 bg-[#1A202C] border border-[#2D3748] rounded-xl flex flex-col shadow-xl">
        <div className="p-4 border-b border-[#2D3748] flex justify-between items-center">
          <h3 className="text-xs uppercase font-bold text-[#718096] tracking-widest">Meus Templates</h3>
          <button onClick={handleNew} className="p-2 hover:bg-[#2D3748]/50 rounded-md text-[#3182CE] transition">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {store.templates.map(t => (
            <div 
              key={t.id} 
              onClick={() => setEditingTemplate({...t})}
              className={cn(
                "p-3 rounded-md cursor-pointer flex justify-between items-center group border border-transparent",
                editingTemplate?.id === t.id ? "bg-[#2D3748] border-[#4A5568]" : "hover:bg-[#2D3748]/50"
              )}
            >
              <div>
                <div className="font-medium text-sm text-[#E2E8F0]">{t.name}</div>
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

      <div className="flex-1 bg-[#1A202C] border border-[#2D3748] rounded-xl shadow-xl p-6 flex flex-col">
        {editingTemplate ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold uppercase text-[#718096] tracking-widest">Editar Template</h2>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-[#3182CE] text-white font-bold rounded-md hover:bg-[#2B6CB0] shadow-lg shadow-blue-900/20 transition">
                <Save className="h-4 w-4" /> Salvar Template
              </button>
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-mono text-[#E2E8F0] mb-1">NOME DO TEMPLATE</label>
                  <input 
                    className="w-full border p-2 rounded-md focus:border-[#3182CE] focus:ring-[#3182CE] border-[#2D3748] bg-[#13171F] text-[#E2E8F0] text-sm" 
                    value={editingTemplate.name} 
                    onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} 
                  />
                </div>
                <div className="w-48">
                  <label className="block text-xs font-mono text-[#E2E8F0] mb-1">TIPO DE DOCUMENTO</label>
                  <select 
                    className="w-full border p-2 rounded-md bg-[#13171F] border-[#2D3748] text-[#E2E8F0] text-sm focus:border-[#3182CE] focus:ring-[#3182CE]"
                    value={editingTemplate.type}
                    onChange={e => setEditingTemplate({...editingTemplate, type: e.target.value as any})}
                  >
                    <option value="documento">Documento Genérico</option>
                    <option value="nota">Nota Fiscal / Recibo</option>
                    <option value="recibo">Recibo Simples</option>
                  </select>
                </div>
                <div className="w-48">
                  <label className="block text-xs font-mono text-[#E2E8F0] mb-1">FORMATO</label>
                  <select 
                    className="w-full border p-2 rounded-md bg-[#13171F] border-[#2D3748] text-[#E2E8F0] text-sm focus:border-[#3182CE] focus:ring-[#3182CE]"
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
                  <label className="block text-xs font-mono text-[#E2E8F0] mb-1 flex justify-between items-end mt-4">
                    <span>CONTEÚDO DO MODELO</span>
                    <span className="text-[10px] font-bold text-[#E2E8F0] bg-blue-600/30 border border-blue-500/50 px-2 py-0.5 rounded">Dica: Use {'{{nome}}'} para variáveis</span>
                  </label>
                  {editingTemplate.format === 'html' ? (
                     <div className="flex-1 bg-white text-black rounded-md overflow-hidden mt-1 shadow-inner h-full flex flex-col">
                       <ReactQuill 
                          theme="snow"
                          value={editingTemplate.content}
                          onChange={(content) => setEditingTemplate({...editingTemplate, content})}
                          className="h-full flex-1 flex flex-col [&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto"
                       />
                     </div>
                  ) : (
                    <textarea 
                      className="flex-1 w-full border border-[#2D3748] bg-[#0F1115] text-[#E2E8F0] font-mono text-[13px] p-4 rounded-md focus:border-[#3182CE] focus:ring-[#3182CE] resize-none shadow-inner"
                      value={editingTemplate.content}
                      onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                    />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col mt-4">
                  <label className="block text-xs font-mono text-[#E2E8F0] mb-1 uppercase">
                    Preview do Template
                  </label>
                  <div className="flex-1 w-full bg-white text-black p-4 rounded-md overflow-y-auto border border-[#2D3748] shadow-inner text-sm">
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
      <div className="w-80 bg-[#1A202C] border border-[#2D3748] rounded-xl flex flex-col shadow-xl">
        <div className="p-4 border-b border-[#2D3748]">
          <h3 className="text-xs uppercase font-bold text-[#718096] tracking-widest">Salvos Recentemente</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {store.documents.map(d => (
            <div 
              key={d.id} 
              onClick={() => setSelectedDoc(d)}
              className={cn(
                "p-3 rounded-md cursor-pointer flex justify-between items-center group border border-transparent",
                selectedDoc?.id === d.id ? "bg-[#2D3748] border-[#4A5568]" : "hover:bg-[#2D3748]/50"
              )}
            >
              <div className="truncate pr-2">
                <div className="font-medium text-sm truncate text-[#E2E8F0]">{d.templateName}</div>
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

      <div className="flex-1 bg-[#1A202C] border border-[#2D3748] rounded-xl shadow-xl flex flex-col overflow-hidden">
        {selectedDoc ? (
          <>
            <div className="flex justify-between items-center p-4 border-b border-[#2D3748] bg-[#1A202C]">
              <div>
                <h2 className="text-sm font-bold uppercase text-[#E2E8F0] tracking-widest">{selectedDoc.templateName}</h2>
                <p className="text-[10px] font-mono text-[#718096] mt-1">Gerado em {new Date(selectedDoc.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={async () => {
                  try {
                    const isHtml = selectedDoc.format === 'html';
                    const htmlContent = isHtml 
                      ? selectedDoc.finalContent 
                      : `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap; font-size: 14px;">${selectedDoc.finalContent}</pre>`;
                    const textFallback = isHtml ? selectedDoc.finalContent.replace(/<[^>]+>/g, ' ') : selectedDoc.finalContent;

                    const data = new ClipboardItem({
                      'text/html': new Blob([htmlContent], { type: 'text/html' }),
                      'text/plain': new Blob([textFallback], { type: 'text/plain' })
                    });
                    await navigator.clipboard.write([data]);
                    
                    setShowEmailModal(true);
                  } catch (err) {
                    console.error(err);
                    alert('Erro ao copiar. Tente selecionar o texto e copiar manualmente livre de bloqueios do navegador.');
                  }
                }} className="flex items-center gap-2 px-4 py-2 bg-[#1A202C] border border-[#4A5568] text-[#48BB78] font-bold text-xs rounded-md hover:bg-[#2D3748] transition">
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
                  className="flex items-center gap-2 px-4 py-2 bg-[#1A202C] border border-[#4A5568] text-white font-bold text-xs rounded-md hover:bg-[#2D3748] transition"
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
                  }} className="flex items-center gap-2 px-4 py-2 bg-[#1A202C] border border-[#4A5568] text-[#3182CE] font-bold text-xs rounded-md hover:bg-[#2D3748] transition">
                    <Download className="h-4 w-4" /> Baixar HTML
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 bg-white text-[#1A202C] select-text cursor-text">
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

      {showEmailModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A202C] border border-[#2D3748] p-6 rounded-xl shadow-2xl max-w-sm w-full">
            <h3 className="text-white text-lg font-bold mb-2">Conteúdo Copiado! ✅</h3>
            <p className="text-[#718096] text-sm mb-6">O documento está na sua área de transferência. Escolha onde deseja abrir para colar (Ctrl+V):</p>
            <div className="space-y-3">
              <a href="https://mail.google.com/mail/?view=cm&fs=1" target="_blank" rel="noreferrer" onClick={() => setShowEmailModal(false)} className="block w-full text-center py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded hover:bg-red-600/20 font-bold transition">Gmail</a>
              <a href="https://outlook.live.com/mail/0/deeplink/compose" target="_blank" rel="noreferrer" onClick={() => setShowEmailModal(false)} className="block w-full text-center py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded hover:bg-blue-600/20 font-bold transition">Outlook</a>
              <a href="https://compose.mail.yahoo.com/" target="_blank" rel="noreferrer" onClick={() => setShowEmailModal(false)} className="block w-full text-center py-2 bg-purple-600/10 text-purple-500 border border-purple-500/20 rounded hover:bg-purple-600/20 font-bold transition">Yahoo Mail</a>
              <a href={`mailto:?subject=${encodeURIComponent(selectedDoc.templateName || 'Documento')}`} onClick={() => setShowEmailModal(false)} className="block w-full text-center py-2 bg-gray-600/10 text-gray-300 border border-gray-500/20 rounded hover:bg-gray-600/20 font-bold transition">App Padrão (Mail/Windows)</a>
            </div>
            <button onClick={() => setShowEmailModal(false)} className="mt-6 w-full py-2 text-[#718096] hover:text-white text-sm transition">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Components ---

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors border border-transparent",
        active 
          ? "bg-[#2D3748] text-white border-[#4A5568]" 
          : "text-[#718096] hover:bg-[#2D3748]/50 hover:text-white"
      )}
    >
      <span className={cn(active ? "text-[#3182CE]" : "text-[#718096]")}>
        {icon}
      </span>
      {label}
    </button>
  );
}

