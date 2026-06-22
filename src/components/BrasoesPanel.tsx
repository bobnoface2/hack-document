import React, { useState, useMemo } from 'react';
import { BRASOES_DATA, BrasaoInfo } from '../data/brasoes';
import { 
  Search, ShieldAlert, CheckCircle, Copy, FileText, ArrowDown, ArrowUp, Zap, HelpCircle, RefreshCw, Layers 
} from 'lucide-react';

interface BrasoesPanelProps {
  editing: any;
  setEditing: (editing: any) => void;
  vars: Record<string, string>;
  setVars: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function BrasoesPanel({ editing, setEditing, vars, setVars }: BrasoesPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrasaoId, setSelectedBrasaoId] = useState<string>('federacao');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter brasoes
  const filteredBrasoes = useMemo(() => {
    return BRASOES_DATA.filter(b => 
      b.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.uf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.capital.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const selectedBrasao = useMemo(() => {
    return BRASOES_DATA.find(b => b.id === selectedBrasaoId) || BRASOES_DATA[0];
  }, [selectedBrasaoId]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCopyImg = async (url: string, name: string) => {
    const htmlTag = `<img src="${url}" alt="Brasão de ${name}" style="height: 80px; width: auto; margin: 0 auto; display: block;" referrerpolicy="no-referrer" />`;
    try {
      await navigator.clipboard.writeText(htmlTag);
      showFeedback(`Tag HTML do Brasão de ${name} copiada!`);
    } catch (e) {
      showFeedback('Erro ao copiar tag.');
    }
  };

  const handleCopyHeader = async (html: string, name: string) => {
    try {
      await navigator.clipboard.writeText(html);
      showFeedback(`Cabeçalho Oficial de ${name} copiado!`);
    } catch (e) {
      showFeedback('Erro ao copiar cabeçalho.');
    }
  };

  // Direct injection into editing.content (Editor)
  const injectHeaderDirect = () => {
    if (!editing) return;
    const strippedContent = editing.content;
    const headerCode = selectedBrasao.headerHtml + '\n\n';
    
    // Check if it already has a header container
    if (strippedContent.includes('id="brasao-header-container"')) {
      showFeedback('Dica: O template já possui um contêiner oficial de brasão!');
      return;
    }

    setEditing({
      ...editing,
      content: headerCode + strippedContent
    });
    showFeedback(`Cabeçalho de ${selectedBrasao.nome} injetado no início do editor!`);
  };

  const injectFooterDirect = () => {
    if (!editing) return;
    const strippedContent = editing.content;
    const footerCode = '\n\n' + selectedBrasao.footerHtml;

    if (strippedContent.includes('id="brasao-footer-container"')) {
      showFeedback('Dica: O template já possui um contêiner oficial de rodapé!');
      return;
    }

    setEditing({
      ...editing,
      content: strippedContent + footerCode
    });
    showFeedback(`Rodapé de ${selectedBrasao.nome} injetado no final do editor!`);
  };

  // Auto-fill template variables
  const applyStateToVariables = () => {
    const today = new Date();
    const dataExtenso = today.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const capitalData = `${selectedBrasao.capital}, ${dataExtenso}`;

    const newVars = {
      ...vars,
      brasao_brasil_estado_header: selectedBrasao.headerHtml,
      brasao_brasil_estado_footer: selectedBrasao.footerHtml,
      estado_nome: selectedBrasao.nome,
      estado_nome_maiusculo: selectedBrasao.nome.toUpperCase(),
      estado_capital: selectedBrasao.capital,
      estado_id: selectedBrasao.id,
      estado_capital_e_data: capitalData,
      data_decreto: today.toLocaleDateString('pt-BR'),
      data_decreto_extenso: dataExtenso,
      data_publicacao: today.toLocaleDateString('pt-BR')
    };

    setVars(newVars);
    showFeedback(`Design de ${selectedBrasao.nome} aplicado às variáveis do documento!`);
  };

  return (
    <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-5 h-full">
      <div className="flex flex-row items-center justify-between border-b border-[#1e1e1e] pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#39FF14]" />
            Brasões de Estados & Federação
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Integração oficial para documentos governamentais do Brasil</p>
        </div>
        {feedback && (
          <span className="text-[10px] font-bold text-black bg-[#39FF14] px-2.5 py-1 rounded-md animate-fade-in transition-all">
            {feedback}
          </span>
        )}
      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0 flex-1">
        
        {/* Selector Panel (2/5 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-3 min-h-0 border-r border-[#1a1a1a] pr-4 max-h-[480px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
            <input 
              type="text"
              placeholder="Pesquisar Estado, UF ou Capital..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black/60 border border-[#222] hover:border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-200 outline-none focus:border-[#39FF14] transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin max-h-[380px]">
            {filteredBrasoes.map((b) => {
              const isSelected = selectedBrasaoId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrasaoId(b.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14]' 
                      : 'bg-black/20 border-transparent hover:bg-[#111] hover:border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <img 
                    src={b.imagemUrl} 
                    alt={b.nome}
                    className="w-8 h-8 object-contain rounded-sm bg-white/5 p-1 shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="truncate flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate pr-1">{b.nome}</span>
                      <span className="text-[9px] font-mono px-1 bg-white/10 text-neutral-300 rounded shrink-0">{b.uf}</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5 truncate">Cap: {b.capital}</p>
                  </div>
                </button>
              );
            })}
            {filteredBrasoes.length === 0 && (
              <p className="text-center text-xs text-neutral-500 font-mono py-8">Nenhum brasão encontrado.</p>
            )}
          </div>
        </div>

        {/* Action Panel (3/5 columns) */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
          <div className="bg-black/50 border border-[#1e1e1e] rounded-xl p-4 flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white p-3 rounded-xl max-w-[110px] flex items-center justify-center shrink-0 shadow-lg">
              <img 
                src={selectedBrasao.imagemUrl} 
                alt={selectedBrasao.nome}
                className="w-20 h-20 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-xs font-mono font-bold bg-[#39FF14]/20 text-[#39FF14] px-2 py-0.5 rounded-full uppercase">
                  {selectedBrasao.id === 'federacao' ? 'Nacional' : 'Estado'}
                </span>
                <span className="text-neutral-500 text-xs font-semibold">• UF: {selectedBrasao.uf}</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">{selectedBrasao.nome}</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Capital: <span className="font-medium text-neutral-200">{selectedBrasao.capital}</span></p>
              {selectedBrasao.lema && (
                <p className="text-[10px] italic text-neutral-500 mt-2 font-mono">
                  Slogan/Motto: &quot;{selectedBrasao.lema}&quot;
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Template Connection Card */}
            <div className="border border-[#1e1e1e] bg-[#0d0d0d] p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <h5 className="text-[11.5px] font-bold text-white flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-[#39FF14]" />
                  Variáveis Inteligentes
                </h5>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Aplica automaticamente o brasão, rodapé, capitais e datas deste estado nas variáveis do template.
                </p>
              </div>
              <button
                onClick={applyStateToVariables}
                className="w-full mt-3 py-2 bg-[#39FF14] text-black font-extrabold rounded-lg text-[11px] uppercase tracking-wide hover:bg-[#7FFF00] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 shrink-0" />
                Aplicar ao Documento
              </button>
            </div>

            {/* Quick HTML Injection Card */}
            <div className="border border-[#1e1e1e] bg-[#0d0d0d] p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <h5 className="text-[11.5px] font-bold text-white flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-[#39FF14]" />
                  Injeção Direta
                </h5>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Insere o código de cabeçalho ou rodapé formatado de {selectedBrasao.nome} diretamente no editor de código.
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={injectHeaderDirect}
                  disabled={!editing}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3 shrink-0 text-[#39FF14]" /> Inserir Cabeçalho
                </button>
                <button
                  onClick={injectFooterDirect}
                  disabled={!editing}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowDown className="w-3 h-3 shrink-0 text-[#39FF14]" /> Inserir Rodapé
                </button>
              </div>
            </div>
          </div>

          {/* Copy Tools */}
          <div className="flex flex-col gap-2 bg-[#090909] border border-[#161616] rounded-xl p-3">
            <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Área de Transferência</h5>
            <div className="flex flex-col md:flex-row gap-2">
              <button
                onClick={() => handleCopyImg(selectedBrasao.imagemUrl, selectedBrasao.nome)}
                className="flex-1 py-1.5 bg-black/40 border border-[#222] hover:border-neutral-700 text-neutral-300 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3 h-3 text-neutral-500" /> Copiar Tag da Imagem (SVG)
              </button>
              <button
                onClick={() => handleCopyHeader(selectedBrasao.headerHtml, selectedBrasao.nome)}
                className="flex-1 py-1.5 bg-black/40 border border-[#222] hover:border-neutral-700 text-neutral-300 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3 h-3 text-[#39FF14]" /> Copiar Bloco Cabeçalho HTML
              </button>
            </div>
            <p className="text-[9.5px] text-neutral-500 text-center mt-1 font-mono">
              Use <code className="text-[#39FF14] bg-white/5 px-1 rounded">{"{{brasao_brasil_estado_header}}"}</code> e <code className="text-[#39FF14] bg-white/5 px-1 rounded">{"{{brasao_brasil_estado_footer}}"}</code> em seus templates personalizados.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
