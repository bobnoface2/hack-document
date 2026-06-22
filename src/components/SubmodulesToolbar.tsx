import React, { useState } from 'react';
import { 
  Palette, Brush, Table, Sparkles, Fingerprint, X, ZoomIn, ZoomOut, Eraser,
  Minus, ArrowRight, Square, Circle, StickyNote, UploadCloud, ShieldCheck, CheckCircle2,
  Sliders, Plus, Columns, ListOrdered, Clock, Trash2, Code, Mail, AlertCircle, FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface SubmodulesToolbarProps {
  controls: {
    applyFontColorToSelection: (color: string) => void;
    applyTextHighlightToSelection: (color: string) => void;
    applyFontFamilyToSelection: (font: string) => void;
    applyClassToSelection: (className: string) => void;
    applyLineHeightToSelection: (height: string) => void;
    applyLetterSpacingToSelection: (spacing: string) => void;
    
    docPadding: string;
    setDocPadding: (padding: string) => void;
    
    zoomLevel: number;
    setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
    
    watermarkText: string;
    setWatermarkText: (text: string) => void;
    
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    
    replaceTerm: string;
    setReplaceTerm: (term: string) => void;
    
    handleFindAndReplace: () => void;
    handleClearSelectionFormatting: () => void;
    
    paintShape: 'line' | 'arrow' | 'rect' | 'circle' | 'callout';
    setPaintShape: (shape: 'line' | 'arrow' | 'rect' | 'circle' | 'callout') => void;
    
    paintThickness: number;
    setPaintThickness: (thickness: number) => void;
    
    paintStyle: 'solid' | 'dashed' | 'dotted' | 'double';
    setPaintStyle: (style: 'solid' | 'dashed' | 'dotted' | 'double') => void;
    
    paintFill: boolean;
    setPaintFill: (fill: boolean) => void;
    
    paintWidth: number;
    setPaintWidth: (width: number) => void;
    
    paintHeight: number;
    setPaintHeight: (height: number) => void;
    
    paintColor: string;
    setPaintColor: (color: string) => void;
    
    insertPaintShape: () => void;
    
    insertImgWidth: number;
    setInsertImgWidth: (width: number) => void;
    
    insertImgHeight: number;
    setInsertImgHeight: (height: number) => void;
    
    insertImgShape: 'rect' | 'rounded' | 'circle';
    setInsertImgShape: (shape: 'rect' | 'rounded' | 'circle') => void;
    
    insertImgBorder: 'none' | 'solid' | 'dashed' | 'double';
    setInsertImgBorder: (border: 'none' | 'solid' | 'dashed' | 'double') => void;
    
    insertImgBorderColor: string;
    setInsertImgBorderColor: (color: string) => void;
    
    insertImgPlacement: 'inline' | 'absolute';
    setInsertImgPlacement: (placement: 'inline' | 'absolute') => void;
    
    insertImgCaption: string;
    setInsertImgCaption: (caption: string) => void;
    
    insertCustomImageOrIcon: (opts: { type: 'upload' | 'icon' | 'badge'; iconSvg?: string; badgeText?: string }) => void;
    
    pontoRows: number;
    setPontoRows: (rows: number) => void;
    
    pontoCols: number;
    setPontoCols: (cols: number) => void;
    
    customRows: number;
    setCustomRows: (rows: number) => void;
    
    customCols: number;
    setCustomCols: (cols: number) => void;
    
    insertHtmlAtCursor: (html: string) => void;
    
    handleSetCellAlignment: (align: 'left' | 'center' | 'right' | 'justify') => void;
    handleMergeActiveCellColspan: () => void;
    handleFillSequence: () => void;
    handleSetTableBorderStyles: (style: string, color: string, width: string) => void;
    
    handleAddRow: (below: boolean) => void;
    handleAddColumn: (right: boolean) => void;
    handleDeleteRow: () => void;
    handleDeleteColumn: () => void;
    
    handleToggleCellBackground: (color: string) => void;
    handleForceBorders: () => void;
    
    insertFinancialBudgetTable: () => void;
    applyExecutiveTimbradoLayout: () => void;
    insertAutomaticTableOfContents: () => void;
    insertExecutiveOrgChart: () => void;
    insertSigningInitialsBlock: () => void;
    insertSecurityQrSeal: () => void;
    insertMilestonesTimeline: () => void;
    insertAdministrativeStamp: (val: 'APROVADO' | 'CONFIDENCIAL' | 'RECUSADO') => void;
    insertStandardClause: (val: 'NDA' | 'PROP_INT' | 'COMPLIANCE' | 'FORO') => void;
    applyCurrencySpellingOutToSelection: () => void;
    
    extensoInputVal: string;
    setExtensoInputVal: (val: string) => void;
    
    numToExtensoBRL: (val: number) => string;
    
    elapsedSeconds: number;
    setElapsedSeconds: (val: number) => void;
    
    timerActive: boolean;
    setTimerActive: (val: boolean) => void;
    
    chancelarTempoSla: () => void;
    
    finalContent: string;
    setFinalContent: (val: string) => void;
    
    focusOnText: (text: string) => void;
    resolvePlaceholder: (pattern: string | RegExp, value: string) => void;
    applyVocabularyOptimiseAll: () => void;
    resolveVocabularyOptimiseByKey: (key: string) => void;
    generateCorporateToc: () => void;
    insertLgpdDisclaimer: () => void;
    insertBlockchainCustodyStamp: () => void;
    insertAuditLogTable: () => void;
    
    showHtmlRawEditor: boolean;
    setShowHtmlRawEditor: (val: boolean) => void;
    
    rawHtmlTextList: string;
    setRawHtmlTextList: (val: string) => void;
    
    insertComplianceChecklist: () => void;
    applyCustomPrecisionSpellingOut: (type: 'percent' | 'prazo' | 'data') => void;
    
    setShowManualTools: (val: boolean) => void;

    xeroxBackground: string | null;
    setXeroxBackground: (val: string | null) => void;
    xeroxOpacity: number;
    setXeroxOpacity: (val: number) => void;
    xeroxScale: number;
    setXeroxScale: (val: number) => void;
    xeroxOffset: { x: number, y: number };
    setXeroxOffset: (val: { x: number; y: number }) => void;
    xeroxPrintWithBg: boolean;
    setXeroxPrintWithBg: (val: boolean) => void;
    xeroxExtractedText: string;
    setXeroxExtractedText: (val: string) => void;
    handleXeroxUpload: (file: File) => void;
    addXeroxOverlay: (type: 'text' | 'signature' | 'stamp' | 'badge') => void;
  };
  aiPanel?: React.ReactNode;
}

export const SubmodulesToolbar: React.FC<SubmodulesToolbarProps> = ({ controls, aiPanel }) => {
  const [activeSubmodule, setActiveSubmodule] = useState<'style' | 'draw' | 'tables' | 'corp' | 'audit' | 'ai' | 'xerox'>('ai');
  const [customFontColorValue, setCustomFontColorValue] = useState('#000000');

  const {
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
  } = controls;

  const formatSlaTime = (totalSecs: number) => {
    const hh = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const mm = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const ss = (totalSecs % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="w-full border-b border-[#1a1a1a] bg-[#050505] text-white flex flex-col flex-1 font-sans select-none z-40 transform-gpu shadow-xl rounded-2xl h-auto overflow-hidden">
      {/* Tabs header */}
      <div className="flex items-center justify-between border-b border-[#151515] px-6 py-2.5 bg-[#020202] shrink-0">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#39FF14] flex items-center gap-1.5 border-r border-[#222] pr-4 shrink-0">
            <Brush className="w-3.5 h-3.5" /> SUB-MÓDULOS ATIVOS (S/A)
          </span>
          <div className="flex flex-nowrap shrink-0 gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'ai', label: 'IA', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'style', label: 'Estilo', icon: <Palette className="w-3.5 h-3.5" /> },
              { id: 'draw', label: 'Desenho', icon: <Brush className="w-3.5 h-3.5" /> },
              { id: 'tables', label: 'Tabelas', icon: <Table className="w-3.5 h-3.5" /> },
              { id: 'corp', label: 'Componentes', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'audit', label: 'Revisão', icon: <Fingerprint className="w-3.5 h-3.5" /> },
              { id: 'xerox', label: 'Xerox & Scanner', icon: <UploadCloud className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubmodule(tab.id as any)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer whitespace-nowrap",
                  activeSubmodule === tab.id
                    ? "bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_8px_rgba(57,255,20,0.25)]"
                    : "bg-[#111] hover:bg-[#1a1a1a] border-[#222] text-gray-400 hover:text-white"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => setShowManualTools(false)}
          className="text-gray-500 hover:text-white transition-colors cursor-pointer bg-neutral-900 border border-[#222] p-1 rounded hover:border-[#39FF14]"
          title="Ocultar Painel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active Module Panel Container with vertical stretch */}
      <div className="flex-1 p-4 bg-[#050505] h-auto">
        {activeSubmodule === 'ai' && aiPanel && (
          <div className="animate-fade-in-down w-full">
            {aiPanel}
          </div>
        )}

        {activeSubmodule === 'style' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-down">
            {/* Column 1: Cores de Fonte Corporativas S/A */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" /> Cores Corporativas S/A (Neutros)
                </span>
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {[
                    { color: '#000000', label: 'PR', title: 'Preto Óptico' },
                    { color: '#111827', label: 'GF', title: 'Grafite Escuro' },
                    { color: '#374151', label: 'CE', title: 'Cinza Executivo' },
                    { color: '#4b5563', label: 'CN', title: 'Cinza Nobre' },
                    { color: '#6b7280', label: 'CM', title: 'Cinza Médio' },
                    { color: '#9ca3af', label: 'CC', title: 'Cinza Claro' }
                  ].map((c) => (
                    <button 
                      key={c.color}
                      type="button"
                      onClick={() => applyFontColorToSelection(c.color)}
                      className="h-6 rounded border border-[#222] hover:border-white transition-all text-[8px] font-bold flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      style={{ backgroundColor: c.color, color: ['#9ca3af'].includes(c.color) ? '#000' : '#fff' }}
                      title={`${c.title} (${c.color})`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-1">Jurídicos e Governamental (Azuis)</div>
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {[
                    { color: '#0f172a', label: 'MZ', title: 'Azul Midnight' },
                    { color: '#1e3a8a', label: 'MN', title: 'Azul Colonial / Marinho' },
                    { color: '#1d4ed8', label: 'RY', title: 'Azul Royal Fiel' },
                    { color: '#2563eb', label: 'AZ', title: 'Azul Corporativo' },
                    { color: '#3b82f6', label: 'AL', labelColor: '#000', title: 'Azul Claro' },
                    { color: '#60a5fa', label: 'AS', labelColor: '#000', title: 'Azul Celeste' }
                  ].map((c: any) => (
                    <button 
                      key={c.color}
                      type="button"
                      onClick={() => applyFontColorToSelection(c.color)}
                      className="h-6 rounded border border-[#222] hover:border-white transition-all text-[8px] font-bold flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      style={{ backgroundColor: c.color, color: c.labelColor || '#fff' }}
                      title={`${c.title} (${c.color})`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-1">Avisos e Penalidades (Vermelhos)</div>
                <div className="grid grid-cols-6 gap-1">
                  {[
                    { color: '#4c0519', label: 'VG', title: 'Burgundy Imperial' },
                    { color: '#7f1d1d', label: 'VN', title: 'Vinho Tinto' },
                    { color: '#991b1b', label: 'RF', title: 'Fogo Escuro' },
                    { color: '#b91c1c', label: 'VM', title: 'Vermelho Alerta' },
                    { color: '#dc2626', label: 'VR', title: 'Vermelho Vivo' },
                    { color: '#ef4444', label: 'VA', title: 'Aviso Alerta' }
                  ].map((c) => (
                    <button 
                      key={c.color}
                      type="button"
                      onClick={() => applyFontColorToSelection(c.color)}
                      className="h-6 rounded border border-[#222] hover:border-white transition-all text-[8px] font-bold flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      style={{ backgroundColor: c.color, color: '#fff' }}
                      title={`${c.title} (${c.color})`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Outras Cores & Marca-texto */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Outras Cores & Marca-Texto</span>
                <div className="text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-1">Prazos e Prestígio (Dourados/Verdes)</div>
                <div className="grid grid-cols-6 gap-1 mb-2.5">
                  {[
                    { color: '#78350f', label: 'AM', title: 'Âmbar Nobre' },
                    { color: '#b45309', label: 'OU', title: 'Ouro Queimado' },
                    { color: '#d97706', label: 'DO', title: 'Dourado Clássico' },
                    { color: '#064e3b', label: 'VF', title: 'Verde Floresta' },
                    { color: '#15803d', label: 'VD', title: 'Verde Médico' },
                    { color: '#16a34a', label: 'VS', title: 'Verde Segurança S/A' }
                  ].map((c) => (
                    <button 
                      key={c.color}
                      type="button"
                      onClick={() => applyFontColorToSelection(c.color)}
                      className="h-6 rounded border border-[#222] hover:border-white transition-all text-[8px] font-bold flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      style={{ backgroundColor: c.color, color: '#fff' }}
                      title={`${c.title} (${c.color})`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-1">Tons Modernos e Tecnologia</div>
                <div className="grid grid-cols-6 gap-1 mb-3">
                  {[
                    { color: '#312e81', label: 'ID', title: 'Índigo Profundo' },
                    { color: '#4338ca', label: 'IN', title: 'Índigo Nobre' },
                    { color: '#5850ec', label: 'IT', title: 'Índigo Tech' },
                    { color: '#4a044e', label: 'RP', title: 'Roxo Imperial' },
                    { color: '#0f766e', label: 'TL', title: 'Teal Moderno' },
                    { color: '#0369a1', label: 'OC', title: 'Oceano B2B' }
                  ].map((c) => (
                    <button 
                      key={c.color}
                      type="button"
                      onClick={() => applyFontColorToSelection(c.color)}
                      className="h-6 rounded border border-[#222] hover:border-white transition-all text-[8px] font-bold flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      style={{ backgroundColor: c.color, color: '#fff' }}
                      title={`${c.title} (${c.color})`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Custom Color Selector */}
                <div className="bg-[#111] border border-[#222] rounded-xl p-2 mb-2">
                  <div className="text-[8px] text-gray-400 font-mono uppercase tracking-wider mb-1 flex justify-between items-center">
                    <span>Seletor Customizado S/A</span>
                    <span className="text-[7px] text-[#39FF14] bg-[#39FF14]/10 px-1 rounded font-bold">Infinite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center w-7 h-7 rounded border border-[#333] hover:border-white cursor-pointer overflow-hidden">
                      <input 
                        type="color" 
                        value={customFontColorValue}
                        onChange={(e) => {
                          setCustomFontColorValue(e.target.value);
                          applyFontColorToSelection(e.target.value);
                        }}
                        className="absolute inset-0 w-[150%] h-[150%] -translate-x-[20%] -translate-y-[20%] cursor-pointer p-0 border-0 outline-none bg-transparent"
                      />
                    </div>
                    <input 
                      type="text"
                      value={customFontColorValue}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (!val.startsWith('#') && val.length > 0 && /^[0-9A-F]{0,6}$/i.test(val)) {
                          val = '#' + val;
                        }
                        setCustomFontColorValue(val);
                        if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
                          applyFontColorToSelection(val);
                        }
                      }}
                      className="flex-1 bg-black border border-[#222] rounded px-1.5 py-0.5 text-[10px] text-white font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-[8px] text-gray-400 uppercase font-mono block mb-1">Marca-Texto / Destaque de Fundo</div>
                <div className="flex gap-1">
                  {[
                    { color: '#fff5c2', title: 'Amarelo Suave' },
                    { color: '#d1fae5', title: 'Verde Claro' },
                    { color: '#dbeafe', title: 'Azul Suave' },
                    { color: '#fce7f3', title: 'Rosa Pastel' },
                    { color: '#ffedd5', title: 'Laranja Claro' },
                  ].map((hl) => (
                    <button 
                      key={hl.color}
                      onClick={() => applyTextHighlightToSelection(hl.color)}
                      className="w-6 h-6 rounded border border-[#222] transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: hl.color }}
                      title={hl.title}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: Tipografia & Dimensionamento */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block tracking-wider">Tipografia & Família</span>
              <div>
                <label className="text-[8px] text-gray-400 uppercase font-mono block mb-1 font-bold">Fonte / Família de Letra</label>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {[
                    { label: 'Serif Clássica', font: '"Times New Roman", Times, serif' },
                    { label: 'Sans Moderna', font: 'system-ui, -apple-system, sans-serif' },
                    { label: 'Código Mono', font: '"Courier New", Courier, monospace' },
                    { label: 'Arial Padrão', font: 'Arial, sans-serif' },
                  ].map((ft) => (
                    <button 
                      key={ft.font}
                      onClick={() => applyFontFamilyToSelection(ft.font)}
                      className="py-1 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-[8px] text-gray-300 font-bold truncate text-center cursor-pointer"
                    >
                      {ft.label}
                    </button>
                  ))}
                </div>

                <label className="text-[8px] text-gray-400 uppercase font-mono block mb-1 font-bold">Tamanho da Fonte</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    { size: 'text-[10px]', label: 'Micro' },
                    { size: 'text-xs', label: 'Pequeno' },
                    { size: 'text-sm', label: 'Normal' },
                    { size: 'text-base', label: 'Médio' },
                    { size: 'text-lg font-bold', label: 'Título' },
                  ].map((s) => (
                    <button 
                      key={s.size}
                      onClick={() => applyClassToSelection(s.size)}
                      className="px-1.5 py-0.5 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-[9px] text-gray-300 font-bold cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <label className="text-[8px] text-gray-400 uppercase font-mono block mb-1 font-bold">Espaçamento de Linhas (A4)</label>
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {[
                    { value: '1', label: '1.0x' },
                    { value: '1.25', label: '1.25' },
                    { value: '1.5', label: '1.5' },
                    { value: '2', label: '2.0' },
                  ].map((e) => (
                    <button 
                      key={e.value}
                      onClick={() => applyLineHeightToSelection(e.value)}
                      className="py-0.5 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-[9px] text-gray-300 font-bold text-center cursor-pointer"
                    >
                      {e.label}
                    </button>
                  ))}
                </div>

                <label className="text-[8px] text-gray-400 uppercase font-mono block mb-1 font-bold">Kerning de Letras (Kerning)</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { value: '-0.05em', label: 'Apert.' },
                    { value: '0px', label: 'Pad.' },
                    { value: '0.05em', label: 'Esp.' },
                    { value: '0.15em', label: 'Larg.' },
                  ].map((k) => (
                    <button 
                      key={k.value}
                      onClick={() => applyLetterSpacingToSelection(k.value)}
                      className="py-0.5 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-[9px] text-gray-300 font-bold text-center cursor-pointer"
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 4: Configurações de Margem, Zoom & Pesquisa */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block tracking-wider">Visualização & Pesquisa</span>
              <div className="space-y-2">
                <div>
                  <span className="text-[8px] text-gray-400 font-bold block mb-1 uppercase">Margens do Documento (A4)</span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'Norm.', value: 'p-12', detail: '48px' },
                      { label: 'Méd.', value: 'p-8', detail: '32px' },
                      { label: 'Estr.', value: 'p-4', detail: '16px' },
                      { label: 'Sem', value: 'p-0', detail: '0px' }
                    ].map((margin) => (
                      <button
                        key={margin.value}
                        onClick={() => setDocPadding(margin.value)}
                        className={cn(
                          "py-0.5 rounded text-[8px] font-bold text-center border transition-all cursor-pointer",
                          docPadding === margin.value 
                            ? "bg-[#39FF14] text-black border-[#39FF14]" 
                            : "bg-[#111] hover:bg-[#1a1a1a] border-[#222] text-gray-300"
                        )}
                        title={margin.detail}
                      >
                        {margin.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[8px] text-gray-400 font-bold block mb-1 uppercase">Zoom</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))} className="p-0.5 bg-[#111] border border-[#222] text-gray-300 rounded text-center cursor-pointer"><ZoomOut className="w-3 h-3" /></button>
                      <div className="text-[9px] font-mono text-center font-bold px-1 bg-[#111] border border-[#222] py-0.5 rounded flex-1">
                        {zoomLevel}%
                      </div>
                      <button onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))} className="p-0.5 bg-[#111] border border-[#222] text-gray-300 rounded text-center cursor-pointer"><ZoomIn className="w-3 h-3" /></button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[8px] text-gray-400 font-bold block mb-1 uppercase">Marca d'Água</span>
                    <input 
                      type="text" 
                      placeholder="Ex: COPIA" 
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] rounded px-1.5 py-0.5 text-[9px] text-white outline-none" 
                    />
                  </div>
                </div>

                {/* Find and Replace inline */}
                <div className="bg-[#111] p-2 rounded-xl border border-[#222] space-y-1">
                  <div className="grid grid-cols-2 gap-1.5">
                    <input 
                      type="text" 
                      placeholder="Localizar..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-black border border-[#222] hover:border-[#39FF14]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none" 
                    />
                    <input 
                      type="text" 
                      placeholder="Substituir..." 
                      value={replaceTerm}
                      onChange={(e) => setReplaceTerm(e.target.value)}
                      className="bg-black border border-[#222] hover:border-[#39FF14]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <button onClick={handleFindAndReplace} className="py-0.5 bg-[#39FF14] text-black font-bold text-[8px] uppercase rounded-md text-center cursor-pointer">Subst. Tudo</button>
                    <button onClick={handleClearSelectionFormatting} className="py-0.5 bg-black hover:bg-red-950/20 text-red-300 border border-[#222] text-[8px] rounded-md text-center flex items-center justify-center gap-0.5 cursor-pointer"><Eraser className="w-2 h-2" /> Limpar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubmodule === 'draw' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-down">
            {/* Column 1: Paint Shape & Traço */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Paint S/A - Forma & Traço</span>
                <span className="text-[8px] text-gray-500 uppercase font-mono block mb-1 font-bold">1. Escolha a Forma</span>
                <div className="grid grid-cols-5 gap-1 mb-2 font-sans">
                  {[
                    { id: 'line', label: 'Linha', icon: <Minus className="w-3.5 h-3.5" /> },
                    { id: 'arrow', label: 'Seta', icon: <ArrowRight className="w-3.5 h-3.5" /> },
                    { id: 'rect', label: 'Retâng.', icon: <Square className="w-3.5 h-3.5" /> },
                    { id: 'circle', label: 'Círc.', icon: <Circle className="w-3.5 h-3.5" /> },
                    { id: 'callout', label: 'Quadro', icon: <StickyNote className="w-3.5 h-3.5" /> },
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => setPaintShape(shape.id as any)}
                      className={cn(
                        "flex flex-col items-center justify-center p-1 rounded border text-[8px] font-bold transition-all cursor-pointer",
                        paintShape === shape.id
                          ? "bg-[#39FF14] text-black border-[#39FF14]"
                          : "bg-[#222]/80 text-gray-300 border-[#222]"
                      )}
                      title={shape.label}
                    >
                      {shape.icon}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] text-gray-500 uppercase font-mono block font-bold">2. Espessura</span>
                  <span className="text-[9px] font-mono text-white font-bold bg-[#222] px-1.5 py-0.2 rounded border border-[#333]">
                    {paintThickness}px
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#0a0a0a] p-1 rounded border border-[#222] mb-2">
                  <button type="button" onClick={() => setPaintThickness(Math.max(1, paintThickness - 1))} className="w-6 h-6 bg-[#222] hover:bg-[#333] border border-[#333] rounded text-xs font-bold font-mono transition-all flex items-center justify-center cursor-pointer">-</button>
                  <div className="flex-grow h-2 flex items-center justify-center bg-black rounded relative overflow-hidden mx-1">
                    <div className="bg-[#39FF14] rounded-full transition-all" style={{ height: `${Math.min(8, paintThickness)}px`, width: '80%' }} />
                  </div>
                  <button type="button" onClick={() => setPaintThickness(Math.min(25, paintThickness + 1))} className="w-6 h-6 bg-[#222] hover:bg-[#333] border border-[#333] rounded text-xs font-bold font-mono transition-all flex items-center justify-center cursor-pointer">+</button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-mono block mb-0.5">Estilo Traço</label>
                    <select
                      value={paintStyle}
                      onChange={(e: any) => setPaintStyle(e.target.value)}
                      className="w-full bg-black border border-[#222] rounded py-0.5 px-1 text-[10px] text-white outline-none"
                    >
                      <option value="solid">Sólido</option>
                      <option value="dashed">Tracejado</option>
                      <option value="dotted">Pontilhado</option>
                      <option value="double">Duplo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-mono block mb-0.5">Preenchimento</label>
                    <button
                      type="button"
                      disabled={!['rect', 'circle', 'callout'].includes(paintShape)}
                      onClick={() => setPaintFill(!paintFill)}
                      className={cn(
                        "w-full py-0.5 text-[10px] font-bold rounded border transition-all cursor-pointer",
                        !['rect', 'circle', 'callout'].includes(paintShape)
                          ? "bg-black/30 text-gray-600 border-[#222] cursor-not-allowed"
                          : paintFill
                          ? "bg-[#39FF14] text-black"
                          : "bg-[#222]/75 text-gray-400"
                      )}
                    >
                      {paintFill ? 'Com Fundo' : 'Sem Fundo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Paint Color & Draw Action */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Paint S/A - Paleta & Desenhar</span>
                <span className="text-[8px] text-gray-500 uppercase font-mono block mb-1 font-bold">3. Escolha a Cor</span>
                <div className="grid grid-cols-6 gap-1 mb-1.5">
                  {[
                    { name: 'Preto', hex: '#000000' },
                    { name: 'Vermelho', hex: '#dc2626' },
                    { name: 'Laranja', hex: '#f97316' },
                    { name: 'Ouro', hex: '#eab308' },
                    { name: 'Verde', hex: '#16a34a' },
                    { name: 'Azul Corp.', hex: '#2563eb' },
                  ].map((pct) => (
                    <button
                      key={pct.hex}
                      type="button"
                      onClick={() => setPaintColor(pct.hex)}
                      className={cn(
                        "h-5 rounded border transition-all cursor-pointer",
                        paintColor === pct.hex ? "border-white scale-110" : "border-[#333]"
                      )}
                      style={{ backgroundColor: pct.hex }}
                      title={pct.name}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-black/50 p-1 rounded border border-[#222] mb-3">
                  <div className="relative w-6 h-6 rounded border border-[#333] overflow-hidden cursor-pointer">
                    <input 
                      type="color" 
                      value={paintColor}
                      onChange={(e) => setPaintColor(e.target.value)}
                      className="absolute inset-0 w-[150%] h-[150%] -translate-x-[20%] -translate-y-[20%] cursor-pointer p-0 border-0 outline-none bg-transparent"
                    />
                  </div>
                  <input 
                    type="text"
                    value={paintColor}
                    onChange={(e) => setPaintColor(e.target.value)}
                    className="flex-grow w-1 bg-black border border-[#222] rounded px-1.5 py-0.5 text-xs text-white font-mono uppercase focus:outline-none"
                  />
                </div>

                {['rect', 'circle', 'callout'].includes(paintShape) && (
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded border border-[#222] mb-3">
                    <div>
                      <label className="text-[7.5px] text-gray-500 block">Largura (%)</label>
                      <input type="number" value={paintWidth} onChange={(e) => setPaintWidth(Math.min(100, Math.max(10, parseInt(e.target.value) || 100)))} className="w-full bg-black text-xs text-white text-center rounded border border-[#222] py-0.5" />
                    </div>
                    <div>
                      <label className="text-[7.5px] text-gray-500 block">Altura (px)</label>
                      <input type="number" value={paintHeight} onChange={(e) => setPaintHeight(Math.max(20, parseInt(e.target.value) || 80))} className="w-full bg-black text-xs text-white text-center rounded border border-[#222] py-0.5" />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={insertPaintShape}
                  className="w-full py-1.5 px-3 bg-[#39FF14] text-black font-extrabold text-[10px] uppercase rounded-lg hover:bg-[#7FFF00] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Brush className="w-3.5 h-3.5 text-black" /> Desenhar Forma Paint
                </button>
              </div>
            </div>

            {/* Column 3: Imagens e Tamanho */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Mídia & Formato S/A</span>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-mono block mb-0.5">Largura (px)</label>
                    <input 
                      type="number" 
                      value={insertImgWidth} 
                      onChange={(e) => setInsertImgWidth(Math.max(30, parseInt(e.target.value) || 140))} 
                      className="w-full bg-black border border-[#222] rounded text-center py-0.5 text-xs text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-mono block mb-0.5">Altura (px)</label>
                    <input 
                      type="number" 
                      value={insertImgHeight} 
                      onChange={(e) => setInsertImgHeight(Math.max(30, parseInt(e.target.value) || 140))} 
                      className="w-full bg-black border border-[#222] rounded text-center py-0.5 text-xs text-white" 
                    />
                  </div>
                </div>

                <div className="flex gap-1 mb-2">
                  <button onClick={() => { setInsertImgWidth(64); setInsertImgHeight(64); }} className="px-1 py-0.5 bg-[#222] hover:bg-[#333] text-[8px] rounded cursor-pointer">Ícone (64)</button>
                  <button onClick={() => { setInsertImgWidth(120); setInsertImgHeight(120); }} className="px-1 py-0.5 bg-[#222] hover:bg-[#333] text-[8px] rounded cursor-pointer">Perfil (120)</button>
                  <button onClick={() => { setInsertImgWidth(180); setInsertImgHeight(100); }} className="px-1 py-0.5 bg-[#222] hover:bg-[#333] text-[8px] rounded cursor-pointer">Assin. (180)</button>
                  <button onClick={() => { setInsertImgWidth(250); setInsertImgHeight(180); }} className="px-1 py-0.5 bg-[#222] hover:bg-[#333] text-[8px] rounded cursor-pointer">Foto (250)</button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <div>
                    <label className="text-[8px] text-gray-500 font-mono block mb-0.5">Formato</label>
                    <select 
                      value={insertImgShape} 
                      onChange={(e: any) => setInsertImgShape(e.target.value)}
                      className="w-full bg-black border border-[#222] rounded py-0.5 px-1 text-[10px] text-white"
                    >
                      <option value="rect">Retang.</option>
                      <option value="rounded">Arredond.</option>
                      <option value="circle">Circular</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-500 font-mono block mb-0.5">Borda</label>
                    <select 
                      value={insertImgBorder} 
                      onChange={(e: any) => setInsertImgBorder(e.target.value)}
                      className="w-full bg-black border border-[#222] rounded py-0.5 px-1 text-[10px] text-white"
                    >
                      <option value="none">Sem Borda</option>
                      <option value="solid">Simples</option>
                      <option value="dashed">Tracejada</option>
                      <option value="double">Dupla</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5 bg-black/45 p-1 rounded border border-[#222]">
                  <span className="text-[7.5px] text-gray-400 font-mono">Cor da Borda/Ícone</span>
                  <div className="flex items-center gap-1">
                    <input type="color" value={insertImgBorderColor} onChange={(e) => setInsertImgBorderColor(e.target.value)} className="w-5 h-5 rounded bg-transparent border-0 cursor-pointer p-0" />
                    <span className="text-[9px] font-mono text-gray-300 uppercase">{insertImgBorderColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: Dimension Actions & Presets */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-1.5 tracking-wider">Inserir Elementos Mídia</span>
                <div className="mb-2">
                  <label className="text-[8px] text-gray-500 uppercase font-mono block mb-0.5">Legenda / Rótulo</label>
                  <input type="text" placeholder="Legenda..." value={insertImgCaption} onChange={(e) => setInsertImgCaption(e.target.value)} className="w-full bg-black border border-[#222] hover:border-[#39FF14]/30 rounded px-1.5 py-0.5 text-xs text-white" />
                </div>

                <div className="grid grid-cols-2 gap-1 mb-2">
                  <button onClick={() => setInsertImgPlacement('inline')} className={cn("text-[8px] py-1 font-bold rounded cursor-pointer", insertImgPlacement === 'inline' ? "bg-[#39FF14] text-black" : "bg-[#222] text-gray-300")}>Embutido</button>
                  <button onClick={() => setInsertImgPlacement('absolute')} className={cn("text-[8px] py-1 font-bold rounded cursor-pointer", insertImgPlacement === 'absolute' ? "bg-[#39FF14] text-black" : "bg-[#222] text-gray-300")}>Flutuante</button>
                </div>

                <button 
                  onClick={() => insertCustomImageOrIcon({ type: 'upload' })}
                  className="w-full py-1.5 bg-gradient-to-r from-[#39FF14] to-indigo-500 text-black font-extrabold rounded-lg text-[9px] flex items-center justify-center gap-1 cursor-pointer hover:opacity-90"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Enviar Foto ou Logo do PC
                </button>

                <div className="grid grid-cols-2 gap-1 mt-2">
                  <button onClick={() => insertCustomImageOrIcon({ type: 'icon', iconSvg: `<svg viewBox="0 0 24 24" width="100%" height="100%" stroke="${insertImgBorderColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` })} className="py-1 px-1 bg-black rounded text-[8px] text-white flex items-center gap-1 border border-[#222] hover:border-white cursor-pointer"><ShieldCheck className="w-3 h-3 text-[#39FF14]" /> Escudo S/A</button>
                  <button onClick={() => insertCustomImageOrIcon({ type: 'icon', iconSvg: `<svg viewBox="0 0 24 24" width="100%" height="100%" stroke="${insertImgBorderColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>` })} className="py-1 px-1 bg-black rounded text-[8px] text-white flex items-center gap-1 border border-[#222] hover:border-white cursor-pointer"><CheckCircle2 className="w-3 h-3 text-blue-400" /> Aprovado</button>
                  <button onClick={() => insertCustomImageOrIcon({ type: 'badge', badgeText: 'CONFIDENCIAL S/A' })} className="py-1 px-1 bg-black rounded text-[8px] text-white flex items-center gap-1 border border-[#222] hover:border-white cursor-pointer"><Sparkles className="w-3 h-3 text-fuchsia-400" /> Confidencial</button>
                  <button onClick={() => insertCustomImageOrIcon({ type: 'badge', badgeText: 'CÓPIA CONTROLADA S/A' })} className="py-1 px-1 bg-black rounded text-[8px] text-white flex items-center gap-1 border border-[#222] hover:border-white cursor-pointer"><Sliders className="w-3 h-3 text-amber-500" /> Controle</button>
                </div>
                
                <div className="mt-2">
                  <select
                    className="w-full bg-[#151515] hover:bg-[#222] border border-[#39FF14]/30 hover:border-[#39FF14] text-slate-300 text-[8px] py-1.5 px-2 rounded cursor-pointer outline-none uppercase font-bold appearance-none text-center"
                    onChange={async (e) => {
                      if (!e.target.value) return;
                      const val = e.target.value;
                      e.target.value = "";
                      
                      try {
                        const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${val}?width=200`;
                        const res = await fetch(url);
                        const blob = await res.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const htmlStr = insertImgPlacement === 'absolute' 
                            ? `<div class="absolute-draggable" style="position: absolute; left: 50%; top: 50%; padding: 4px; border: 2px dashed rgba(0,0,0,0.2);" contenteditable="false"><img src="${reader.result}" alt="Brasão" style="width: 80px; height: auto;" /></div>`
                            : `<img src="${reader.result}" alt="Brasão" style="width: 80px; height: auto; display: inline-block; margin: 4px;" />`;
                          insertHtmlAtCursor(htmlStr);
                        };
                        reader.readAsDataURL(blob);
                      } catch (err) {
                        alert("Erro ao carregar o brasão. Tente novamente.");
                        console.error(err);
                      }
                    }}
                  >
                    <option value="">+ INSERIR BRASÃO DO ESTADO</option>
                    <option value="Coat_of_arms_of_Brazil.svg">BR - República Federativa do Brasil</option>
                    <option value="Bras%C3%A3o_do_Acre.svg">AC - Acre</option>
                    <option value="Bras%C3%A3o_de_Alagoas.svg">AL - Alagoas</option>
                    <option value="Bras%C3%A3o_do_Amap%C3%A1.svg">AP - Amapá</option>
                    <option value="Bras%C3%A3o_do_Amazonas.svg">AM - Amazonas</option>
                    <option value="Bras%C3%A3o_da_Bahia.svg">BA - Bahia</option>
                    <option value="Bras%C3%A3o_do_Cear%C3%A1.svg">CE - Ceará</option>
                    <option value="Bras%C3%A3o_do_Distrito_Federal_%28Brasil%29.svg">DF - Distrito Federal</option>
                    <option value="Bras%C3%A3o_do_Esp%C3%ADrito_Santo.svg">ES - Espírito Santo</option>
                    <option value="Bras%C3%A3o_de_Goi%C3%A1s.svg">GO - Goiás</option>
                    <option value="Bras%C3%A3o_do_Maranh%C3%A3o.svg">MA - Maranhão</option>
                    <option value="Bras%C3%A3o_de_Mato_Grosso.svg">MT - Mato Grosso</option>
                    <option value="Bras%C3%A3o_de_Mato_Grosso_do_Sul.svg">MS - Mato Grosso do Sul</option>
                    <option value="Bras%C3%A3o_de_Minas_Gerais.svg">MG - Minas Gerais</option>
                    <option value="Bras%C3%A3o_do_Par%C3%A1.svg">PA - Pará</option>
                    <option value="Bras%C3%A3o_da_Para%C3%ADba.svg">PB - Paraíba</option>
                    <option value="Bras%C3%A3o_do_Paran%C3%A1.svg">PR - Paraná</option>
                    <option value="Bras%C3%A3o_de_Pernambuco.svg">PE - Pernambuco</option>
                    <option value="Bras%C3%A3o_do_Piau%C3%AD.svg">PI - Piauí</option>
                    <option value="Bras%C3%A3o_do_estado_do_Rio_de_Janeiro.svg">RJ - Rio de Janeiro</option>
                    <option value="Bras%C3%A3o_do_Rio_Grande_do_Norte.svg">RN - Rio Grande do Norte</option>
                    <option value="Bras%C3%A3o_do_Rio_Grande_do_Sul.svg">RS - Rio Grande do Sul</option>
                    <option value="Bras%C3%A3o_de_Rond%C3%B4nia.svg">RO - Rondônia</option>
                    <option value="Bras%C3%A3o_de_Roraima.svg">RR - Roraima</option>
                    <option value="Bras%C3%A3o_de_Santa_Catarina.svg">SC - Santa Catarina</option>
                    <option value="Bras%C3%A3o_do_estado_de_S%C3%A3o_Paulo.svg">SP - São Paulo</option>
                    <option value="Bras%C3%A3o_de_Sergipe.svg">SE - Sergipe</option>
                    <option value="Bras%C3%A3o_do_Tocantins.svg">TO - Tocantins</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubmodule === 'tables' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-down">
            {/* Column 1: Criar Tabelas */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Planilhas & Criação</span>
                <div className="bg-[#111] border border-[#222] rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-white">Folha de Ponto</span>
                    <div className="flex gap-1">
                      <input type="number" value={pontoRows} onChange={(e) => setPontoRows(parseInt(e.target.value) || 12)} className="w-8 bg-black text-center text-[10px] text-white py-0.5 rounded border border-[#222]" title="Linhas" />
                      <input type="number" value={pontoCols} onChange={(e) => setPontoCols(parseInt(e.target.value) || 7)} className="w-8 bg-black text-center text-[10px] text-white py-0.5 rounded border border-[#222]" title="Colunas" />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const defaultHeaders = ["Data", "Entrada 1", "Saída 1", "Entrada 2", "Saída 2", "Assinatura", "Obs"];
                      const headers = Array.from({length: pontoCols}).map((_, i) => defaultHeaders[i] || `Extra ${i + 1}`);
                      const timesheetHtml = `
                        <div style="font-family: sans-serif; font-size: 10px; margin-bottom: 2px; border: 1.5px solid black; padding: 4px; line-height: 1.2;">
                          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed black; padding-bottom: 3px; margin-bottom: 3px;">
                            <div style="width: 60%;">
                              <strong>Empresa:</strong> <span contenteditable="true">BEST VIGILANCIA E SEGURANCA LTDA</span><br>
                              <strong>Endereço:</strong> <span contenteditable="true">TRAVESSA LEONOR MASCARENHAS, 87</span><br>
                              <strong>Bairro:</strong> <span contenteditable="true">RAMOS</span><br>
                              <strong>CNPJ:</strong> <span contenteditable="true">05.234.289/0001-27</span>
                            </div>
                            <div style="width: 40%; text-align: right;">
                              <strong>Competência:</strong> <span contenteditable="true">Maio/2026</span><br>
                            </div>
                          </div>
                          <div style="display: flex; justify-content: space-between;">
                            <div style="width: 50%;">
                              <strong>Nome:</strong> <span contenteditable="true">WALLACE ARAO DO CARMO CARDOSO</span><br>
                              <strong>CTPS:</strong> <span contenteditable="true">00043 00146</span> &nbsp;&nbsp;&nbsp; <strong>Matrícula:</strong> <span contenteditable="true">1 2000</span><br>
                              <strong>Função:</strong> <span contenteditable="true">Vigilante</span>
                            </div>
                            <div style="width: 50%;">
                              <strong>Posto:</strong> <span contenteditable="true">1 25132 TJRJ-SÃO JOÃO DE MERITI ANEXO</span><br>
                              <strong>Horário:</strong> <span contenteditable="true">10:00 as 19:00</span><br>
                              <strong>Escala:</strong> <span contenteditable="true">05 X 02 10:00 AS 19:00 1h para refeição</span>
                            </div>
                          </div>
                        </div>
                        <table class="w-full border-collapse border border-black text-[9px] mb-2" style="border: 1.5px solid black; border-collapse: collapse; width: 100%;">
                          <thead>
                            <tr class="bg-gray-100" style="background-color: #f3f4f6;">
                              ${headers.map((h, i) => `
                                <th class="border border-black text-center font-bold" style="border: 1px solid black; width: ${100/pontoCols}%; padding: 2px;">${h}</th>
                              `).join('')}
                            </tr>
                          </thead>
                          <tbody>
                            ${Array.from({length: pontoRows}).map((_, i) => `
                            <tr>
                              ${headers.map((h, j) => `
                                <td class="border border-black ${j === 0 ? 'text-center font-mono font-bold' : ''}" style="border: 1px solid black; height: 16px; padding: 1px 4px;">${j === 0 && h === 'Data' ? i + 1 : ''}</td>
                              `).join('')}
                            </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      `;
                      insertHtmlAtCursor(timesheetHtml);
                    }}
                    className="w-full py-1 bg-[#222] hover:bg-[#39FF14] text-gray-300 hover:text-black font-bold text-[9px] uppercase rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> Gerar Folha de Ponto
                  </button>
                </div>

                <button 
                  onClick={() => {
                    const reportHtml = `
                      <table class="w-full border-collapse border border-black text-xs my-4" style="border: 2px solid black; border-collapse: collapse; width: 100%;">
                        <thead>
                          <tr class="bg-gray-100">
                            <th class="border border-black p-1.5 text-center font-bold" style="border: 1px solid black; width: 10%;">Item</th>
                            <th class="border border-black p-1.5 text-left font-bold" style="border: 1px solid black; width: 50%;">Descrição</th>
                            <th class="border border-black p-1.5 text-center font-bold" style="border: 1px solid black; width: 12%;">Quant.</th>
                            <th class="border border-black p-1.5 text-right font-bold" style="border: 1px solid black; width: 14%;">Unitário</th>
                            <th class="border border-black p-1.5 text-right font-bold" style="border: 1px solid black; width: 14%;">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${Array.from({length: 4}).map((_, i) => `
                          <tr>
                            <td class="border border-black p-1.5 text-center font-mono" style="border: 1px solid black; height: 26px;">${i+1}</td>
                            <td class="border border-black p-1.5" style="border: 1px solid black;"></td>
                            <td class="border border-black p-1.5 text-center" style="border: 1px solid black;"></td>
                            <td class="border border-black p-1.5 text-right" style="border: 1px solid black;"></td>
                            <td class="border border-black p-1.5 text-right" style="border: 1px solid black;"></td>
                          </tr>
                          `).join('')}
                          <tr class="font-bold bg-gray-50">
                            <td colspan="4" class="border border-black p-1.5 text-right" style="border: 1px solid black;">Valor Total Geral:</td>
                            <td class="border border-black p-1.5 text-right" style="border: 1px solid black;">R$ </td>
                          </tr>
                        </tbody>
                      </table>
                      <p>&nbsp;</p>
                    `;
                    insertHtmlAtCursor(reportHtml);
                  }}
                  className="w-full mt-2 py-1 px-2.5 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] rounded-lg text-left text-[9px] text-gray-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Table className="w-3.5 h-3.5 text-blue-400" />
                  <div>
                    <span className="font-bold block text-white text-[9.5px]">Tabela de Itens</span>
                    <span className="text-[7.5px] text-gray-500">Faturas, recibos, orçamentos</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Column 2: Tabela Personalizada & Alinhamento */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Personalização & Mescla</span>
                <div className="p-2 bg-[#0a0a0a] border border-[#222] rounded-xl mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-gray-400 font-bold">Personalizar NxM</span>
                    <div className="flex gap-1">
                      <input type="number" value={customRows} onChange={(e) => setCustomRows(parseInt(e.target.value) || 5)} className="w-7 bg-[#111] text-center text-[10px] py-0.5 rounded border border-[#222]" title="Linhas" />
                      <input type="number" value={customCols} onChange={(e) => setCustomCols(parseInt(e.target.value) || 4)} className="w-7 bg-[#111] text-center text-[10px] py-0.5 rounded border border-[#222]" title="Colunas" />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const customTableHtml = `
                        <table class="w-full border-collapse border border-black text-sm my-4" style="border: 1.5px solid black; border-collapse: collapse; width: 100%;">
                          <tbody>
                            ${Array.from({length: customRows}).map(() => `
                              <tr>
                                ${Array.from({length: customCols}).map(() => `
                                  <td class="border border-black p-2 min-w-[60px]" style="border: 1px solid black; height: 32px;">&nbsp;</td>
                                `).join('')}
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                        <p>&nbsp;</p>
                      `;
                      insertHtmlAtCursor(customTableHtml);
                    }}
                    className="w-full py-0.5 bg-[#39FF14] text-black font-bold text-[8.5px] uppercase rounded cursor-pointer"
                  >
                    Criar Tabela {customRows}x{customCols}
                  </button>
                  <button 
                    onClick={() => {
                      const editor = document.getElementById('editable-document-body');
                      if (editor) {
                        editor.classList.toggle('table-resizer-active');
                        
                        // Try to focus editor context if needed
                        if (editor.classList.contains('table-resizer-active')) {
                          alert('Função Ativada: Arraste as bordas das células da tabela para esticar para os lados ou para baixo (redimensionamento manual).');
                        }
                      }
                    }}
                    className="w-full mt-2 py-0.5 border border-[#39FF14] text-[#39FF14] font-bold text-[8px] uppercase rounded cursor-pointer hover:bg-[#39FF14] hover:text-black transition-colors"
                  >
                    Habilitar Arrastar Tamanho (Lados/Baixo)
                  </button>
                </div>

                <div className="p-2 bg-[#090909] rounded-xl border border-[#1a1a1a] space-y-1">
                  <span className="text-[8px] text-gray-400 uppercase font-bold tracking-wider block">Alinhamento e Mesclagem</span>
                  <div className="flex bg-[#111] border border-[#222] rounded p-0.5 justify-around mb-1">
                    <button onClick={() => handleSetCellAlignment('left')} className="px-1.5 py-0.2 text-[8px] hover:bg-[#222] text-gray-300 rounded font-bold cursor-pointer">Esq</button>
                    <button onClick={() => handleSetCellAlignment('center')} className="px-1.5 py-0.2 text-[8px] hover:bg-[#222] text-gray-300 rounded font-bold cursor-pointer">Cen</button>
                    <button onClick={() => handleSetCellAlignment('right')} className="px-1.5 py-0.2 text-[8px] hover:bg-[#222] text-gray-300 rounded font-bold cursor-pointer">Dir</button>
                    <button onClick={() => handleSetCellAlignment('justify')} className="px-1.5 py-0.2 text-[8px] hover:bg-[#222] text-gray-300 rounded font-bold cursor-pointer">Just</button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={handleMergeActiveCellColspan} className="py-0.5 bg-[#151515] hover:bg-[#222] rounded border border-[#222] text-[8px] font-bold text-gray-300 flex items-center justify-center gap-0.5 cursor-pointer">
                      <Columns className="w-2.5 h-2.5 text-orange-400" /> Mesclar D.
                    </button>
                    <button onClick={handleFillSequence} className="py-0.5 bg-[#151515] hover:bg-[#222] rounded border border-[#222] text-[8px] font-bold text-gray-300 flex items-center justify-center gap-0.5 cursor-pointer">
                      <ListOrdered className="w-2.5 h-2.5 text-[#39FF14]" /> Nros
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Operações & Grade */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Operações de Estrutura</span>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  <button onClick={() => handleAddRow(false)} className="py-1 px-1 bg-[#111] hover:bg-[#222] text-[8.5px] rounded text-left flex items-center gap-0.5 border border-[#222] cursor-pointer"><Plus className="w-2.5 h-2.5 text-green-400" /> Linha Acima</button>
                  <button onClick={() => handleAddRow(true)} className="py-1 px-1 bg-[#111] hover:bg-[#222] text-[8.5px] rounded text-left flex items-center gap-0.5 border border-[#222] cursor-pointer"><Plus className="w-2.5 h-2.5 text-green-400" /> Linha Abaixo</button>
                  <button onClick={() => handleAddColumn(false)} className="py-1 px-1 bg-[#111] hover:bg-[#222] text-[8.5px] rounded text-left flex items-center gap-0.5 border border-[#222] cursor-pointer"><Plus className="w-2.5 h-2.5 text-blue-400" /> Col. Esq</button>
                  <button onClick={() => handleAddColumn(true)} className="py-1 px-1 bg-[#111] hover:bg-[#222] text-[8.5px] rounded text-left flex items-center gap-0.5 border border-[#222] cursor-pointer"><Plus className="w-2.5 h-2.5 text-blue-400" /> Col. Dir</button>
                  <button onClick={handleDeleteRow} className="py-1 px-1 bg-[#111] hover:bg-red-950/20 text-[8.5px] rounded text-left flex items-center gap-0.5 border border-[#222] cursor-pointer"><Trash2 className="w-2.5 h-2.5 text-red-500" /> Excl. Linha</button>
                  <button onClick={handleDeleteColumn} className="py-1 px-1 bg-[#111] hover:bg-red-950/20 text-[8.5px] rounded text-left flex items-center gap-0.5 border border-[#222] cursor-pointer"><Trash2 className="w-2.5 h-2.5 text-red-500" /> Excl. Col.</button>
                </div>

                <div className="space-y-1 p-1.5 bg-[#090909] rounded-xl border border-[#222]">
                  <span className="text-[7px] text-gray-400 uppercase font-bold block">Estilo de Linhas</span>
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => handleSetTableBorderStyles('solid', '#000000', '2px')} className="py-0.5 bg-[#111] text-[8px] rounded cursor-pointer">Sólido Grosso</button>
                    <button onClick={() => handleSetTableBorderStyles('dashed', '#7f8c8d', '1px')} className="py-0.5 bg-[#111] text-[8px] rounded cursor-pointer">Trac. Cinza</button>
                    <button onClick={() => handleSetTableBorderStyles('dotted', '#000000', '1px')} className="py-0.5 bg-[#111] text-[8px] rounded cursor-pointer">Pontilhado</button>
                    <button onClick={() => handleSetTableBorderStyles('none', '#000000', '0px')} className="py-0.5 bg-red-950/20 text-red-300 text-[8px] rounded cursor-pointer">Ocultar</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: Orçamentos & Destaques */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-1.5 tracking-wider">Ações de Planilha S/A</span>
                <button 
                  onClick={() => handleToggleCellBackground('#f3f4f6')}
                  className="w-full py-1 px-2.5 bg-[#111] hover:bg-[#222] rounded-lg text-left text-[9px] text-gray-300 flex items-center justify-between mb-1.5 border border-[#222] cursor-pointer"
                >
                  <span className="flex items-center gap-1"><Palette className="w-3 w-3 text-yellow-400" /> Destacar Linha (Cinza)</span>
                  <span className="w-2.5 h-2.5 rounded bg-gray-200 border border-gray-400"></span>
                </button>

                <button 
                  onClick={handleForceBorders}
                  className="w-full py-1 px-2.5 bg-[#111] hover:bg-[#1a2d1a] border border-[#39FF14]/20 rounded-lg text-left text-[9px] text-gray-200 flex items-center gap-1 mb-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 w-3 text-[#39FF14]" />
                  <span className="font-bold">Forçar Grades Fortes</span>
                </button>

                <button 
                  onClick={insertFinancialBudgetTable}
                  className="w-full p-2 bg-[#111] hover:bg-[#39FF14] hover:text-black border border-[#222] rounded-xl text-left text-[9px] text-gray-300 flex flex-col gap-0.5 cursor-pointer"
                  title="Insere planilha de orçamento com recálculo automático inline de células"
                >
                  <span className="font-bold text-white block">Planilha Orçamentária</span>
                  <span className="text-[8px] text-gray-400 font-mono">Auto-Recálculo inline</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubmodule === 'corp' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-down">
            {/* Column 1: Papel & Layout Timbrado */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Papel & Identidade Timbrado</span>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button 
                    onClick={applyExecutiveTimbradoLayout}
                    className="p-2 bg-[#111] hover:bg-[#39FF14] hover:text-black border border-[#222] rounded-xl text-left text-[9.5px] text-gray-300 transition-all flex flex-col gap-0.5 cursor-pointer text-ellipsis overflow-hidden"
                  >
                    <span className="font-bold text-white block">Papel Timbrado</span>
                    <span className="text-[7.5px] text-gray-500">Logo e CNPJ S/A</span>
                  </button>

                  <button 
                    onClick={insertAutomaticTableOfContents}
                    className="p-2 bg-[#111] hover:bg-[#39FF14] hover:text-black border border-[#222] rounded-xl text-left text-[9.5px] text-gray-300 transition-all flex flex-col gap-0.5 cursor-pointer text-ellipsis overflow-hidden"
                  >
                    <span className="font-bold text-white block">Sumário Executivo</span>
                    <span className="text-[7.5px] text-gray-500">Auto-TOC de títulos</span>
                  </button>

                  <button 
                    onClick={insertExecutiveOrgChart}
                    className="p-2 bg-[#111] hover:bg-[#39FF14] hover:text-black border border-[#222] rounded-xl text-left text-[9.5px] text-gray-300 transition-all flex flex-col gap-0.5 cursor-pointer animate-pulse text-ellipsis overflow-hidden"
                  >
                    <span className="font-bold text-white block">Organograma S/A</span>
                    <span className="text-[7.5px] text-gray-500">Hierarquia operacional</span>
                  </button>

                  <button 
                    onClick={() => {
                      const pageBreakHtml = `<div style="page-break-before: always; height: 1px; clear: both; margin-top: 10px; margin-bottom: 10px;" class="page-break-indicator border-t border-dashed border-red-300" contenteditable="false"></div>`;
                      insertHtmlAtCursor(pageBreakHtml);
                    }}
                    className="p-2 bg-[#111] hover:bg-[#222] border border-[#222] rounded-xl text-left text-[9.5px] text-gray-300 transition-all flex flex-col gap-0.5 cursor-pointer text-ellipsis overflow-hidden"
                  >
                    <span className="font-bold text-white block">Saltar Página A4</span>
                    <span className="text-[7.5px] text-gray-500">Inserir quebra</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Componentes Rápidos */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Componentes para Redação</span>
                <div className="grid grid-cols-2 gap-1.5 font-sans">
                  <button 
                    onClick={() => {
                      const sigHtml = `
                        <div class="text-center mt-6 w-52 mx-auto" style="text-align: center; margin-left: auto; margin-right: auto; margin-top: 24px;">
                          <div class="border-t border-black w-48 mx-auto mb-1" style="border-top: 1.5px solid black; width: 180px; margin-left: auto; margin-right: auto; margin-bottom: 4px;"></div>
                          <p class="text-xs font-bold uppercase leading-tight" style="font-size: 11px; font-weight: bold;">Assinatura</p>
                        </div>
                      `;
                      insertHtmlAtCursor(sigHtml);
                    }}
                    className="p-1.5 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-left text-[8.5px] text-gray-300 flex flex-col cursor-pointer"
                  >
                    <span className="font-bold text-white">Assinatura Única</span>
                    <span className="text-[7px] text-gray-500">Linha centrada</span>
                  </button>

                  <button 
                    onClick={() => {
                      const doubleSigHtml = `
                        <div class="flex justify-between items-end mt-8" style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px;">
                          <div class="text-center w-48" style="text-align: center; width: 180px;">
                            <div class="border-t border-black w-44 mx-auto mb-1" style="border-top: 1.5px solid black; width: 160px; margin-left: auto; margin-right: auto; margin-bottom: 4px;"></div>
                            <p class="text-xs font-bold uppercase leading-tight" style="font-size: 11px; font-weight: bold;">Assinatura Contratante</p>
                          </div>
                          <div class="text-center w-48" style="text-align: center; width: 180px;">
                            <div class="border-t border-black w-44 mx-auto mb-1" style="border-top: 1.5px solid black; width: 160px; margin-left: auto; margin-right: auto; margin-bottom: 4px;"></div>
                            <p class="text-xs font-bold uppercase leading-tight" style="font-size: 11px; font-weight: bold;">Assinatura Contratado</p>
                          </div>
                        </div>
                      `;
                      insertHtmlAtCursor(doubleSigHtml);
                    }}
                    className="p-1.5 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-left text-[8.5px] text-gray-300 flex flex-col cursor-pointer"
                  >
                    <span className="font-bold text-white">Dupla Assinatura</span>
                    <span className="text-[7px] text-gray-500">Duas alinhadas</span>
                  </button>

                  <button 
                    onClick={() => {
                      const varName = prompt("Qual o nome desejado para a nova variável?", "nome_completo");
                      if (varName) {
                        const formattedName = varName.trim().toLowerCase().replace(/[^a-z0-9_]/gi, '_');
                        insertHtmlAtCursor(`{{${formattedName}}}`);
                      }
                    }}
                    className="p-1.5 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-left text-[8.5px] text-gray-300 flex flex-col cursor-pointer"
                  >
                    <span className="font-bold text-white">Inserir Variável</span>
                    <span className="text-[7px] text-gray-500">{"Chaves {{nome}}"}</span>
                  </button>

                  <button 
                    onClick={() => {
                      insertHtmlAtCursor(' __________________________ ');
                    }}
                    className="p-1.5 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-left text-[8.5px] text-gray-300 flex flex-col cursor-pointer"
                  >
                    <span className="font-bold text-white">Linha Vazia</span>
                    <span className="text-[7px] text-gray-500">Traço para caneta</span>
                  </button>

                  <button 
                    onClick={() => {
                      insertHtmlAtCursor(`
                        <div class="flex items-center gap-2 my-1" style="display: flex; align-items: center; gap: 8px; margin-top: 4px; margin-bottom: 4px;">
                          <span style="border: 1.5px solid black; width: 12px; height: 12px; display: inline-block; border-radius: 2px;"></span>
                          <span class="text-xs" style="font-size: 12px;">Novo item para marcar</span>
                        </div>
                      `);
                    }}
                    className="p-1.5 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-left text-[8.5px] text-gray-300 flex flex-col cursor-pointer"
                  >
                    <span className="font-bold text-white">Quadrado List</span>
                    <span className="text-[7px] text-gray-500">Checklist A4</span>
                  </button>

                  <button 
                    onClick={insertSigningInitialsBlock}
                    className="p-1.5 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-left text-[8.5px] text-gray-300 flex flex-col cursor-pointer"
                  >
                    <span className="font-bold text-white">Rubricas Rápidas</span>
                    <span className="text-[7px] text-gray-500">Inserir Rubricas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Avançados & Selos */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Avançados & Selos S/A</span>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      const resumeHtml = `
                        <div class="my-6 p-4 rounded-lg bg-neutral-50 border-2 border-neutral-800" style="background-color: #f9f9f9; border: 2px solid #262626; padding: 16px; border-radius: 8px; font-family: sans-serif; margin-top: 16px; margin-bottom: 16px;">
                          <p class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2" style="font-size: 10px; text-transform: uppercase; color: #737373; font-weight: bold; margin: 0 0 6px 0; letter-spacing: 0.1em;">Quadro Resumo Regulamentar S/A</p>
                          <table style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.5;">
                            <tr style="border-b: 1px solid #e5e5e5;"><td style="padding: 6px 0; font-weight: bold; color: #404040; width: 35%;">Código Unificado PJ:</td><td style="padding: 6px 0; color: #171717; font-family: monospace;">#{{id_processo_pj}}</td></tr>
                            <tr style="border-b: 1px solid #e5e5e5;"><td style="padding: 6px 0; font-weight: bold; color: #404040;">Teto de Indenização:</td><td style="padding: 6px 0; color: #171717;">R$ {{teto_limite}}</td></tr>
                            <tr style="border-b: 1px solid #e5e5e5;"><td style="padding: 6px 0; font-weight: bold; color: #404040;">Foro Arbitral Eleito:</td><td style="padding: 6px 0; color: #171717;">{{tribunal_foro}}</td></tr>
                            <tr><td style="padding: 6px 0; font-weight: bold; color: #404040;">Acreditação LGPD/GDPR:</td><td style="padding: 6px 0; color: #16a34a; font-weight: bold;">CONFORME E AUDITADO</td></tr>
                          </table>
                        </div>
                        <p>&nbsp;</p>
                      `;
                      insertHtmlAtCursor(resumeHtml);
                    }}
                    className="w-full text-left py-1 px-2.5 bg-[#111] hover:bg-neutral-800 rounded-lg text-[9px] flex items-center justify-between cursor-pointer border border-[#222]"
                  >
                    <span className="flex items-center gap-1.5"><Table className="w-3 w-3 text-[#39FF14]" /> Quadro Resumo S/A</span>
                    <span className="text-[7px] text-gray-500 font-mono">Inserir</span>
                  </button>

                  <button 
                    onClick={() => {
                      const alertHtml = `
                        <div class="my-6 p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg" style="border-left: 4px solid #f59e0b; background-color: #fef3c7; padding: 16px; border-radius: 0 8px 8px 0; font-family: sans-serif; margin-top: 16px; margin-bottom: 16px; color: #78350f;">
                          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <strong style="font-size: 11.5px; text-transform: uppercase;">⚠️ CLÁUSULA DE MULTA & PENALIDADE DE INCLUSÃO</strong>
                          </div>
                          <p style="font-size: 11px; line-height: 1.5; margin: 0;">O inadimplemento corporativo nos prazos ensejará aplicação de multa penal imediata de <strong>R$ {{multa_infracao}}</strong>, cumulada com juros de 1% ao mês e perdas cambiais compensatórias.</p>
                        </div>
                        <p>&nbsp;</p>
                      `;
                      insertHtmlAtCursor(alertHtml);
                    }}
                    className="w-full text-left py-1 px-2.5 bg-[#111] hover:bg-neutral-800 rounded-lg text-[9px] flex items-center justify-between cursor-pointer border border-[#222]"
                  >
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3 w-3 text-amber-500" /> Cláusula de Multa</span>
                    <span className="text-[7px] text-gray-500 font-mono">Inserir</span>
                  </button>

                  <button 
                    onClick={() => {
                      const certHtml = `
                        <div class="my-6 p-4 rounded-xl border border-emerald-300 bg-emerald-50/50" style="border: 1px solid #a7f3d0; background-color: #f0fdf4; padding: 14px; border-radius: 12px; font-family: sans-serif; max-w: 320px; margin-top: 16px; margin-bottom: 16px;">
                          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="display: inline-block; width: 8px; height: 8px; background-color: #10b981; border-radius: 50%;"></span>
                            <span style="font-size: 10.5px; font-weight: bold; color: #065f46; text-transform: uppercase;">Assinatura Criptográfica Certificada</span>
                          </div>
                          <p style="font-size: 9.5px; color: #047857; margin: 0 0 6px 0; line-height: 1.3;">Integridade de hash do DocuMestre S/A.</p>
                          <div style="background-color: #ffffff; padding: 6px; border: 1px dashed #d1fae5; border-radius: 4px; font-family: monospace; font-size: 8.5px; color: #065f46; word-break: break-all;">
                            HASH: SHA256/{{transacao_hash_id}}
                          </div>
                        </div>
                        <p>&nbsp;</p>
                      `;
                      insertHtmlAtCursor(certHtml);
                    }}
                    className="w-full text-left py-1 px-2.5 bg-[#111] hover:bg-neutral-800 rounded-lg text-[9px] flex items-center justify-between cursor-pointer border border-[#222]"
                  >
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 w-3 text-emerald-400" /> Selo Cripto</span>
                    <span className="text-[7px] text-gray-500 font-mono">Inserir</span>
                  </button>

                  <button 
                    onClick={() => {
                      const timelinesHtml = `
                        <div class="my-6" style="font-family: sans-serif; margin-top: 16px; margin-bottom: 16px;">
                          <p style="font-size: 9px; text-transform: uppercase; color: #737373; font-weight: bold; margin-bottom: 8px; letter-spacing: 0.15em;">LINHA DO TEMPO: CRONOGRAMA S/A</p>
                          <div style="display: flex; gap: 12px; width: 100%;">
                            <div style="flex: 1; border: 1px solid #e5e5e5; padding: 10px; border-radius: 8px; background-color: #fafafa;">
                              <div style="font-weight: bold; font-size: 11px; color: #171717;">MARCO 01</div>
                              <div style="font-size: 9px; color: #ef4444; font-weight: bold; font-family: monospace; text-transform: uppercase; margin-bottom: 4px;">{{data_marco_01}}</div>
                              <p style="font-size: 10px; color: #525252; margin: 0; line-height: 1.3;">Aprovação de documentação de conselho inicial.</p>
                            </div>
                            <div style="flex: 1; border: 1px solid #e5e5e5; padding: 10px; border-radius: 8px; background-color: #fafafa;">
                              <div style="font-weight: bold; font-size: 11px; color: #171717;">MARCO 02</div>
                              <div style="font-size: 9px; color: #3b82f6; font-weight: bold; font-family: monospace; text-transform: uppercase; margin-bottom: 4px;">{{data_marco_02}}</div>
                              <p style="font-size: 10px; color: #525252; margin: 0; line-height: 1.3;">Homologação física e auditorias de compliance.</p>
                            </div>
                            <div style="flex: 1; border: 1px solid #e5e5e5; padding: 10px; border-radius: 8px; background-color: #fafafa;">
                              <div style="font-weight: bold; font-size: 11px; color: #171717;">MARCO 03</div>
                              <div style="font-size: 9px; color: #10b981; font-weight: bold; font-family: monospace; text-transform: uppercase; margin-bottom: 4px;">{{data_marco_03}}</div>
                              <p style="font-size: 10px; color: #525252; margin: 0; line-height: 1.3;">Entrega e distribuição oficial de chaves SaaS.</p>
                            </div>
                          </div>
                        </div>
                        <p>&nbsp;</p>
                      `;
                      insertHtmlAtCursor(timelinesHtml);
                    }}
                    className="w-full text-left py-1 px-2.5 bg-[#111] hover:bg-neutral-800 rounded-lg text-[9px] flex items-center justify-between cursor-pointer border border-[#222]"
                  >
                    <span className="flex items-center gap-1.5"><Clock className="w-3 w-3 text-indigo-400" /> Timeline S/A</span>
                    <span className="text-[7px] text-gray-500 font-mono">Inserir</span>
                  </button>

                  <button 
                    onClick={insertSecurityQrSeal}
                    className="w-full text-left py-1 px-2.5 bg-[#111] hover:bg-neutral-800 rounded-lg text-[9px] flex items-center justify-between cursor-pointer border border-[#222]"
                  >
                    <span className="flex items-center gap-1.5"><Fingerprint className="w-3 w-3 text-indigo-400" /> Carimbo Certificado QR</span>
                    <span className="text-[7px] text-gray-500 font-mono">Inserir</span>
                  </button>

                  <button 
                    onClick={insertMilestonesTimeline}
                    className="w-full text-left py-1 px-2.5 bg-[#111] hover:bg-neutral-800 rounded-lg text-[9px] flex items-center justify-between cursor-pointer border border-[#222]"
                  >
                    <span className="flex items-center gap-1.5"><Sliders className="w-3 w-3 text-amber-500" /> Cronograma Milestones</span>
                    <span className="text-[7px] text-gray-500 font-mono">Inserir</span>
                  </button>

                  {/* Audited Stamps */}
                  <div className="bg-[#0c0c0c] p-1.5 rounded-xl border border-[#1a1a1a] mt-1.5">
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: 'Aprovado', val: 'APROVADO' as const },
                        { label: 'Confidencial', val: 'CONFIDENCIAL' as const },
                        { label: 'Recusado', val: 'RECUSADO' as const },
                      ].map(itm => (
                        <button
                          key={itm.label}
                          onClick={() => insertAdministrativeStamp(itm.val)}
                          className="py-0.5 rounded bg-[#111] hover:bg-[#39FF14] hover:text-black text-[7.5px] font-bold text-center border border-[#222] cursor-pointer"
                        >
                          {itm.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: Boilerplate & Financeiro */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-2 tracking-wider">Automáticos & Contratos</span>
                <div className="space-y-1.5">
                  <div className="bg-[#0c0c0c] p-1.5 rounded-xl border border-[#1a1a1a] space-y-1">
                    <span className="text-[7.5px] text-gray-400 font-mono uppercase font-bold block mb-1">Cláusulas S/A</span>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { label: 'NDA', val: 'NDA' as const },
                        { label: 'Prop. Intelect.', val: 'PROP_INT' as const },
                        { label: 'Compliance', val: 'COMPLIANCE' as const },
                        { label: 'Foro Oficial', val: 'FORO' as const },
                      ].map(cl => (
                        <button
                          key={cl.label}
                          onClick={() => insertStandardClause(cl.val)}
                          className="text-left px-1 py-0.5 hover:text-[#39FF14] text-gray-300 rounded text-[7.5px] truncate cursor-pointer"
                        >
                          + {cl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conversão por Extenso */}
                  <div className="bg-[#0c0c0c] p-2 rounded-xl border border-[#1a1a1a] space-y-1.5">
                    <span className="text-[8px] text-[#39FF14] font-mono uppercase font-bold block">🧮 Moeda por Extenso BRL</span>
                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        placeholder="Ex: 15420.50" 
                        value={extensoInputVal}
                        onChange={(e) => setExtensoInputVal(e.target.value)}
                        className="flex-grow w-1 bg-[#111] border border-[#222] rounded px-1 text-[8.5px] text-white outline-none font-mono"
                      />
                      <button 
                        onClick={() => {
                          const trimVal = extensoInputVal.trim();
                          const parsed = parseFloat(trimVal);
                          if (!trimVal || isNaN(parsed)) {
                            alert("⚠️ Digite um número monetário válido!");
                            return;
                          }
                          const txt = numToExtensoBRL(parsed);
                          insertHtmlAtCursor(`R$ ${parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${txt})`);
                        }}
                        className="px-1 py-0.5 bg-[#39FF14]/10 hover:bg-[#39FF14] hover:text-black text-[#39FF14] text-[8.5px] font-bold rounded cursor-pointer"
                      >
                        Ok
                      </button>
                    </div>
                    <button 
                      onClick={applyCurrencySpellingOutToSelection}
                      className="w-full text-center py-0.5 bg-[#151515] hover:bg-[#39FF14] hover:text-black border border-[#222] rounded text-[8px] font-bold cursor-pointer"
                      title="Selecione um número no texto e clique aqui para converter"
                    >
                      Converter Seleção
                    </button>
                  </div>

                  {/* SLA Time Tracker */}
                  <div className="bg-[#0c0c0c] p-1.5 rounded-xl border border-[#1a1a1a] flex justify-between items-center">
                    <div>
                      <span className="text-[6.5px] text-gray-500 block uppercase font-mono">Trilha SLA</span>
                      <span className="text-[10px] font-bold font-mono text-white tracking-wider">
                        {formatSlaTime(elapsedSeconds)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setTimerActive(!timerActive)} className="px-1 py-0.2 text-[6.5px] bg-[#1a1a1a] hover:bg-neutral-800 text-white rounded border border-[#222] cursor-pointer">{timerActive ? "Pause" : "Girar"}</button>
                      <button onClick={chancelarTempoSla} className="px-1 py-0.2 text-[6.5px] bg-[#1a1a1a] hover:bg-[#39FF14] hover:text-black text-gray-300 rounded border border-[#222] cursor-pointer">Chancelar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubmodule === 'audit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-down">
            {/* Column 1: Score de Qualidade & Lacunas */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-1.5 tracking-wider">Metrificação & Qualidade Comercial</span>
                {(() => {
                  const textLower = finalContent.toLowerCase();
                  const cleanText = finalContent.replace(/<[^>]*>/g, ' ');

                  const placeholders: { id: string; label: string; text: string; rawText: string; pattern: string | RegExp; suggestion: string }[] = [];
                  const underscores = cleanText.match(/__{2,}/g);
                  if (underscores) {
                    placeholders.push({ id: 'gap-under', label: 'Lacuna Manual', text: 'Linha sublinhada por preencher', rawText: underscores[0], pattern: /__{2,}/, suggestion: 'Ex: Wallace' });
                  }
                  const brackets = cleanText.match(/\[([^\]]+)\]/g);
                  if (brackets) {
                    brackets.forEach((b, idx) => {
                      if (!placeholders.some(p => p.rawText === b)) {
                        placeholders.push({ id: `gap-bracket-${idx}`, label: 'Pendente', text: `Substituir colchetes "${b}"`, rawText: b, pattern: b, suggestion: 'Digitar...' });
                      }
                    });
                  }
                  if (cleanText.includes('XX/XX') || cleanText.includes('XX de XX') || cleanText.includes('__/__/____')) {
                    const matchText = cleanText.includes('XX/XX') ? 'XX/XX' : (cleanText.includes('XX de XX') ? 'XX de XX' : '__/__/____');
                    placeholders.push({ id: 'gap-date', label: 'Data', text: `Preencher data "${matchText}"`, rawText: matchText, pattern: matchText, suggestion: new Date().toLocaleDateString('pt-BR') });
                  }
                  if (cleanText.includes('00.000.000/0001-00')) {
                    placeholders.push({ id: 'gap-cnpj', label: 'Fictício', text: 'Substituir CNPJ provisório', rawText: '00.000.000/0001-00', pattern: '00.000.000/0001-00', suggestion: 'Ex: 44.766.969/0001-22' });
                  }

                  const emptyParas = (finalContent.match(/<p><br><\/p>|<p>&nbsp;<\/p>|<p>\s*<\/p>/g) || []).length;
                  const clauseChecks = [
                    { key: 'partes', label: 'Partes Qualificadas', regex: /contratant|contratad|partes|qualificad|vendedor|comprador|locador|locatári/i },
                    { key: 'objeto', label: 'Objeto de Serviços', regex: /objeto|serviço|prestação|venda|ceder/i },
                    { key: 'preco', label: 'Preços em BRL', regex: /preço|valor|honorários|r\$|pagamento|mensal/i },
                    { key: 'prazos', label: 'Prazos & Vigência', regex: /vigência|prazo|validade|rescisão|multa/i },
                    { key: 'foro', label: 'Foro de Eleição', regex: /foro|comarca|resolução|arbitragem|jurisdição/i },
                    { key: 'rubricas', label: 'Assinaturas Ativas', regex: /assinatura|assinam|rubrica|testemunhas|initial-box-container/i },
                  ];
                  const missingClauses = clauseChecks.filter(c => !c.regex.test(textLower));
                  const qualityScore = Math.max(0, 100 - (placeholders.length * 15) - (missingClauses.length * 12) - (emptyParas > 2 ? 8 : 0));

                  return (
                    <div className="space-y-2">
                      <div className="bg-[#111] border border-[#222] rounded-xl p-2.5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] uppercase font-mono text-gray-400">Score de Qualidade</span>
                          <span className={cn("text-xs font-mono font-bold", qualityScore >= 90 ? "text-[#39FF14]" : "text-amber-400")}>{qualityScore}%</span>
                        </div>
                        <div className="w-full bg-[#1b1b1b] rounded-full h-1 overflow-hidden">
                          <div className={cn("h-full transition-all", qualityScore >= 90 ? "bg-[#39FF14]" : "bg-amber-500")} style={{ width: `${qualityScore}%` }} />
                        </div>
                      </div>

                      {placeholders.length > 0 && (
                        <div className="bg-[#111] border border-[#222] rounded-xl p-2 pr-1">
                          <span className="text-[7.5px] text-gray-400 font-mono uppercase font-bold block mb-1">⚠️ Lacunas Identificadas ({placeholders.length})</span>
                          <div className="space-y-1.5">
                            {placeholders.slice(0, 2).map((p) => (
                              <div key={p.id} className="bg-black/40 p-1.5 rounded border border-[#222] flex items-center justify-between gap-1">
                                <div className="truncate flex-1">
                                  <span className="text-[7px] text-red-400 uppercase font-bold block truncate">{p.label}</span>
                                  <span className="text-[8px] text-gray-300 block truncate leading-tight">{p.text}</span>
                                </div>
                                <button onClick={() => focusOnText(p.rawText)} className="text-[7px] text-indigo-400 hover:text-white font-mono bg-indigo-950/20 px-1 py-0.2 rounded cursor-pointer shrink-0">Focar</button>
                              </div>
                            ))}
                            {placeholders.length > 2 && <span className="text-[7px] text-gray-500 block text-center">+ {placeholders.length - 2} mais lacunas...</span>}
                          </div>
                        </div>
                      )}

                      {emptyParas > 2 && (
                        <div className="bg-red-950/5 border border-red-500/20 rounded-xl p-2 flex justify-between items-center text-left">
                          <div className="pr-1">
                            <span className="text-[7.5px] font-mono text-red-400 uppercase font-bold block">Espaços Duplicados ({emptyParas})</span>
                            <span className="text-[7px] text-gray-400 block leading-tight">Remover furos vazios salvando paginação...</span>
                          </div>
                          <button 
                            onClick={() => {
                              const docBody = document.getElementById('editable-document-body');
                              if (docBody) {
                                let html = docBody.innerHTML;
                                html = html.replace(/<p><br><\/p>|<p>&nbsp;<\/p>/g, '');
                                docBody.innerHTML = html;
                                setFinalContent(html);
                                alert("✨ Espaços em branco sanados com sucesso!");
                              }
                            }}
                            className="px-1.5 py-0.5 bg-red-950 text-red-300 rounded text-[7.5px] font-bold shrink-0 cursor-pointer"
                          >
                            Sanear
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Column 2: Conformidade Comercial */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-1.5 tracking-wider">Cláusulas & Validações</span>
                {(() => {
                  const textLower = finalContent.toLowerCase();
                  const clauseChecks = [
                    { key: 'partes', label: 'Qualificação das Partes', regex: /contratant|contratad|partes|qualificad/i },
                    { key: 'objeto', label: 'Objeto de Serviços', regex: /objeto|serviço|prestação/i },
                    { key: 'preco', label: 'Preços em BRL', regex: /preço|valor|honorários|r\$/i },
                    { key: 'prazos', label: 'Prazos & Vigência', regex: /vigência|prazo|validade|rescisão/i },
                    { key: 'foro', label: 'Foro de Eleição', regex: /foro|comarca|resolução/i },
                    { key: 'rubricas', label: 'Rubricas Ativas', regex: /assinatura|assinam|rubrica|initial-box-container/i },
                  ];

                  return (
                    <div className="space-y-1 pr-1">
                      {clauseChecks.map((cl) => {
                        const active = cl.regex.test(textLower);
                        return (
                          <div key={cl.key} className="p-1 rounded bg-black/40 border border-[#202020] flex items-center justify-between text-left">
                            <span className="text-[8px] text-gray-200 font-bold flex items-center gap-1">
                              {active ? (
                                <CheckCircle2 className="w-3 h-3 text-[#39FF14]" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-yellow-500 animate-pulse" />
                              )}
                              {cl.label}
                            </span>
                            <span className={cn(
                              "text-[6.5px] font-mono uppercase font-bold px-1 rounded",
                              active ? "bg-emerald-950/50 text-[#39FF14]" : "bg-yellow-950/50 text-yellow-500"
                            )}>
                              {active ? 'OK' : 'Pendente'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Column 3: Vocabulário Executivo */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-1.5 tracking-wider">Polimento Vocabular Executivo</span>
                {(() => {
                  const cleanText = finalContent.replace(/<[^>]*>/g, ' ');
                  const foundSuggestions: { original: string; replacement: string; count: number }[] = [];
                  const VOCABULARY_SUGGESTIONS = [
                    { original: "a nível de", replacement: "em âmbito de", regex: /a\s+nível\s+de/gi },
                    { original: "através de", replacement: "por meio de", regex: /através\s+de/gi },
                    { original: "vimos por meio deste", replacement: "este instrumento estabelece", regex: /vimos\s+por\s+meio\s+deste/gi },
                    { original: "dar início", replacement: "iniciar", regex: /dar\s+início/gi }
                  ];

                  VOCABULARY_SUGGESTIONS.forEach(item => {
                    const matches = cleanText.match(item.regex);
                    if (matches) {
                      foundSuggestions.push({ original: item.original, replacement: item.replacement, count: matches.length });
                    }
                  });

                  return (
                    <div className="space-y-1.5">
                      <button 
                        type="button"
                        onClick={applyVocabularyOptimiseAll}
                        className="w-full text-center py-1 bg-blue-950/20 hover:bg-[#39FF14] hover:text-black border border-blue-900/30 transition rounded text-[#39FF14] text-[9.5px] font-bold cursor-pointer"
                      >
                        🚀 Higienizar Clichês (Ativar Todos)
                      </button>

                      {foundSuggestions.length > 0 ? (
                        <div className="space-y-1.5 pr-1">
                          {foundSuggestions.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="bg-black/60 p-1.5 rounded border border-[#222] flex items-center justify-between gap-1 text-left font-sans">
                              <div className="truncate flex-1">
                                <span className="text-[8px] text-gray-400 line-through block">"{item.original}"</span>
                                <span className="text-[8.5px] text-[#39FF14] font-bold block truncate">→ "{item.replacement}"</span>
                              </div>
                              <button type="button" onClick={() => resolveVocabularyOptimiseByKey(item.original)} className="px-1.5 py-0.5 bg-blue-950 text-blue-200 text-[7px] font-bold rounded cursor-pointer">Fix</button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-1 px-2 border border-emerald-950/40 rounded-lg bg-emerald-950/5 text-center text-emerald-400 text-[8px] font-bold font-mono">
                          ⭐ Documento sem clichês detectados!
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Column 4: Ferramentas de Revisão */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-1.5 tracking-wider">Ações de Auditoria S/A</span>
                <button 
                  type="button"
                  onClick={generateCorporateToc}
                  className="w-full text-center py-1.5 bg-[#111] hover:bg-[#39FF14] hover:text-black border border-[#222] rounded text-gray-300 text-[9.5px] font-bold mb-1.5 cursor-pointer"
                >
                  📑 Inserir Sumário Regulatório no Cursor
                </button>

                <div className="bg-[#0d0d0d] p-1.5 rounded-xl border border-[#222] space-y-1 text-[8.5px] font-mono">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>LGPD Privac.</span>
                    {finalContent.includes('LGPD') || finalContent.includes('13.709') ? (
                      <span className="text-emerald-400 font-bold">● OK</span>
                    ) : (
                      <button onClick={insertLgpdDisclaimer} className="px-1 bg-[#39FF14]/10 hover:bg-[#39FF14] text-[#39FF14] hover:text-black text-[7px] border border-[#39FF14]/30 rounded font-bold cursor-pointer">+ Fix</button>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Selo Blockchain</span>
                    {finalContent.includes('CUSTÓDIA') || finalContent.includes('blockchain-custody') ? (
                      <span className="text-emerald-400 font-bold">● OK</span>
                    ) : (
                      <button onClick={insertBlockchainCustodyStamp} className="px-1 bg-[#39FF14]/10 hover:bg-[#39FF14] text-[#39FF14] hover:text-black text-[7px] border border-[#39FF14]/30 rounded font-bold cursor-pointer">+ Fix</button>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Log Auditoria ISO</span>
                    {finalContent.includes('Auditoria') || finalContent.includes('v1.0') || finalContent.includes('ISO') ? (
                      <span className="text-emerald-400 font-bold">● OK</span>
                    ) : (
                      <button onClick={insertAuditLogTable} className="px-1 bg-[#39FF14]/10 hover:bg-[#39FF14] text-[#39FF14] hover:text-black text-[7px] border border-[#39FF14]/30 rounded font-bold cursor-pointer">+ Fix</button>
                    )}
                  </div>
                </div>

                <div className="flex gap-1.5 mt-2">
                  <button 
                    onClick={() => {
                      setRawHtmlTextList(finalContent);
                      setShowHtmlRawEditor(!showHtmlRawEditor);
                    }}
                    className="flex-1 py-1 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-center text-[9px] text-gray-300 font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Code className="w-3 w-3 text-orange-400" /> HTML
                  </button>

                  <button 
                    onClick={insertComplianceChecklist}
                    className="flex-1 py-1 bg-[#111] hover:bg-[#39FF14] hover:text-black border border-[#222] rounded text-center text-[9px] text-gray-300 font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 w-3 text-emerald-400" /> Compliance
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubmodule === 'xerox' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-down">
            {/* Column 1: Scanner de Arquivo */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-1.5 tracking-wider flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-blue-400" /> 1. Digitalizar Original S/A
                </span>
                <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
                  Envie uma foto (PNG, JPG) ou PDF do documento. O sistema colocará a imagem como gabarito sob a folha de papel para decalque 100% fiel.
                </p>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleXeroxUpload(file);
                    }}
                    className="hidden"
                    id="xerox-file-input"
                  />
                  <label
                    htmlFor="xerox-file-input"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-extrabold rounded-xl text-center text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_-3px_rgba(79,70,229,0.4)]"
                  >
                    <UploadCloud className="w-4 h-4" /> Enviar Documento (Foto/PDF)
                  </label>

                  {xeroxBackground && (
                    <button
                      type="button"
                      onClick={() => {
                        setXeroxBackground(null);
                        setXeroxExtractedText('');
                        alert("Xerox removida com sucesso. O gabarito de fundo foi limpo.");
                      }}
                      className="w-full py-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 text-red-400 font-bold rounded-lg text-[10px] cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Limpar Gabarito de Xerox
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Alinhamento e Papel Carbono */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-1.5 tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" /> 2. Ajuste do Carbono (Gabarito)
                </span>
                <div className="space-y-3 bg-[#0a0a0a] border border-[#222] rounded-xl p-3">
                  {/* Opacidade Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] text-gray-400 uppercase font-mono font-bold">Opacidade Carbono</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{Math.round(xeroxOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={xeroxOpacity}
                      onChange={(e) => setXeroxOpacity(parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
                    />
                  </div>

                  {/* Escala Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] text-gray-400 uppercase font-mono font-bold">Escala Gabarito %</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{xeroxScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="200"
                      step="5"
                      value={xeroxScale}
                      onChange={(e) => setXeroxScale(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
                    />
                  </div>

                  {/* Offset X Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] text-gray-400 uppercase font-mono font-bold">Horizontal (X)</span>
                      <span className="text-[10px] font-mono text-gray-300 font-bold">{xeroxOffset.x}px</span>
                    </div>
                    <input
                      type="range"
                      min="-250"
                      max="250"
                      step="2"
                      value={xeroxOffset.x}
                      onChange={(e) => setXeroxOffset({ ...xeroxOffset, x: parseInt(e.target.value) })}
                      className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
                    />
                  </div>

                  {/* Offset Y Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] text-gray-400 uppercase font-mono font-bold">Vertical (Y)</span>
                      <span className="text-[10px] font-mono text-gray-300 font-bold">{xeroxOffset.y}px</span>
                    </div>
                    <input
                      type="range"
                      min="-250"
                      max="250"
                      step="2"
                      value={xeroxOffset.y}
                      onChange={(e) => setXeroxOffset({ ...xeroxOffset, y: parseInt(e.target.value) })}
                      className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Inserção de Decalques Editáveis */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-1.5 tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-pink-400" /> 3. Ferramenta de Decalque
                </span>
                <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">
                  Clique para estampar campos editáveis e arrastáveis exatamente onde deseja alterar dados:
                </p>
                <div className="grid grid-cols-2 gap-1.5 font-sans">
                  <button
                    type="button"
                    onClick={() => addXeroxOverlay('text')}
                    className="py-1.5 px-2 bg-black hover:bg-neutral-900 text-white hover:text-[#39FF14] rounded-lg border border-neutral-800 hover:border-[#39FF14]/40 text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Sliders className="w-3 h-3 text-emerald-400" /> + Bloco Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => addXeroxOverlay('signature')}
                    className="py-1.5 px-2 bg-black hover:bg-neutral-900 text-white hover:text-[#39FF14] rounded-lg border border-neutral-800 hover:border-[#39FF14]/40 text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-3 h-3 text-sky-400" /> + Assinatura
                  </button>
                  <button
                    type="button"
                    onClick={() => addXeroxOverlay('stamp')}
                    className="py-1.5 px-2 bg-black hover:bg-neutral-900 text-white hover:text-[#39FF14] rounded-lg border border-neutral-800 hover:border-[#39FF14]/40 text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-red-500" /> + Carimbo S/A
                  </button>
                  <button
                    type="button"
                    onClick={() => addXeroxOverlay('badge')}
                    className="py-1.5 px-2 bg-black hover:bg-neutral-900 text-white hover:text-[#39FF14] rounded-lg border border-neutral-800 hover:border-[#39FF14]/40 text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <FileText className="w-3 h-3 text-yellow-400" /> + Selo Xerox
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 bg-[#0a0a0a] border border-[#222] p-2 rounded-lg">
                  <input
                    type="checkbox"
                    id="xerox-print-checkbox"
                    checked={xeroxPrintWithBg}
                    onChange={(e) => setXeroxPrintWithBg(e.target.checked)}
                    className="rounded border-[#333] text-emerald-500 focus:ring-0 bg-black cursor-pointer"
                  />
                  <label htmlFor="xerox-print-checkbox" className="text-[9px] font-mono text-gray-300 select-none cursor-pointer">
                    Imprimir Xerox de Fundo (Fiel)
                  </label>
                </div>
              </div>
            </div>

            {/* Column 4: Extração Local S/A */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#39FF14] uppercase block mb-1.5 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-yellow-400" /> 4. Texto Digitalizado Local
                </span>
                <p className="text-[10px] text-gray-500 mb-1.5 leading-relaxed">
                  Extrator de texto compacto offline para rápida digitação manual:
                </p>
                <div className="relative">
                  <textarea
                    value={xeroxExtractedText || "Nenhum documento escaneado. Envie um arquivo na coluna 1..."}
                    readOnly
                    onClick={(e) => {
                      if (xeroxExtractedText) {
                        (e.target as HTMLTextAreaElement).select();
                        navigator.clipboard.writeText(xeroxExtractedText);
                        alert("Texto copiado para a área de transferência!");
                      }
                    }}
                    className="w-full h-24 bg-black border border-neutral-800 rounded-xl p-2.5 text-[9px] text-gray-400 hover:text-white transition-colors select-all font-mono outline-none resize-none cursor-pointer leading-normal"
                  />
                  {xeroxExtractedText && (
                    <span className="absolute bottom-1 right-2 text-[7.5px] font-mono bg-[#39FF14]/10 text-[#39FF14] px-1 rounded border border-[#39FF14]/20">
                      Clique para Copiar
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
