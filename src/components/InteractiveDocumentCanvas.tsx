import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Move, RotateCw, Maximize2, Trash2, Plus, CornerRightDown, 
  ArrowUp, ArrowDown, Type, Stamp, Sparkles, FileText, CheckCircle, Award, 
  Layers, Eye, AlignLeft, Info, HelpCircle
} from 'lucide-react';
import { BRASOES_DATA } from '../data/brasoes';

export interface FloatingElement {
  id: string;
  type: 'brasao_federacao' | 'brasao_estado' | 'carimbo' | 'assinatura' | 'texto_livre';
  label: string;
  x: number; // pixel position from left
  y: number; // pixel position from top
  width: number; // width in px
  height: number; // height in px
  rotation: number; // degrees
  opacity: number; // 0.1 to 1.0
  content: string; // text or image src
  style?: string; // custom classes or inline styles
}

interface InteractiveDocumentCanvasProps {
  htmlContent: string;
  onUpdateHtml: (newHtml: string) => void;
  format: string;
  selectedStateId?: string;
}

export function InteractiveDocumentCanvas({ 
  htmlContent, 
  onUpdateHtml, 
  format,
  selectedStateId = 'federacao' 
}: InteractiveDocumentCanvasProps) {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Document interaction modes: 
  // 'elements' = add/drag floating armors, stamps, signatures
  // 'reorder' = click on document paragraphs/elements to move them up/down/delete or transform
  const [interactMode, setInteractMode] = useState<'elements' | 'reorder'>('elements');
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // States for State Crest and Federal Crest
  const activeState = useMemo(() => {
    return BRASOES_DATA.find(b => b.id === selectedStateId) || BRASOES_DATA[0];
  }, [selectedStateId]);

  const activeFederation = useMemo(() => {
    return BRASOES_DATA.find(b => b.id === 'federacao') || BRASOES_DATA[0];
  }, []);

  // Preset stamps
  const stamps = [
    { label: 'CÓPIA AUTÊNTICA', text: 'CÓPIA AUTÊNTICA • AUTENTICADO DIGITAMENTE', color: '#B91C1C' },
    { label: 'APROVADO', text: 'APROVADO PARA PUBLICAÇÃO NO D.O.', color: '#047857' },
    { label: 'CONFIDENCIAIS', text: 'CONFIDENCIAL • GABINETE DE GOVERNO', color: '#1E3A8A' },
    { label: 'URGENTE', text: 'URGENTE • PRIORIDADE ADM', color: '#C2410C' }
  ];

  // Helper to add a floating element
  const addFloatingElement = (type: FloatingElement['type'], label: string, content: string, opt = {}) => {
    const parentWidth = containerRef.current?.clientWidth || 600;
    const parentHeight = containerRef.current?.clientHeight || 450;

    const baseWidth = type.includes('brasao') ? 90 : type === 'carimbo' ? 180 : type === 'assinatura' ? 160 : 200;
    const baseHeight = type.includes('brasao') ? 90 : type === 'carimbo' ? 60 : type === 'assinatura' ? 70 : 80;

    const newEl: FloatingElement = {
      id: `float_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      label,
      x: parentWidth / 2 - baseWidth / 2,
      y: Math.max(100, Math.min(parentHeight / 2 - baseHeight / 2, 400)),
      width: baseWidth,
      height: baseHeight,
      rotation: 0,
      opacity: 1.0,
      content,
      ...opt
    };

    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  // Mouse drag handlers for floating elements
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (interactMode !== 'elements') return;
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);

    const el = elements.find(item => item.id === id);
    if (!el) return;

    // Get current client coords relative to container
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left - el.x,
      y: e.clientY - rect.top - el.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId || interactMode !== 'elements') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const proposedX = e.clientX - rect.left - dragOffset.x;
    const proposedY = e.clientY - rect.top - dragOffset.y;

    // Boundary check within the viewport card
    const boundX = Math.max(-50, Math.min(rect.width - 40, proposedX));
    const boundY = Math.max(-50, Math.min(rect.height - 40, proposedY));

    setElements(prev => prev.map(el => {
      if (el.id === selectedId) {
        return { ...el, x: boundX, y: boundY };
      }
      return el;
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Inline styling / update of elements properties
  const updateSelectedProp = (property: keyof FloatingElement, value: any) => {
    if (!selectedId) return;
    setElements(prev => prev.map(el => {
      if (el.id === selectedId) {
        return { ...el, [property]: value };
      }
      return el;
    }));
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  // -------------------------------------------------------------
  // REORDER BLOCKS SYSTEM (Move parts of the document)
  // parses the HTML content dynamically into React child node objects to move up and down
  // -------------------------------------------------------------
  const [docBlocks, setDocBlocks] = useState<{ id: string; html: string; tagName: string }[]>([]);

  // Parse HTML into blocks
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Check if there is an outer styled wrapper (like a card wrapper) 
    // or if we should just parse any children of the body, or elements within the main div
    const innerContainer = doc.querySelector('.p-12, .p-8, body > div') || doc.body;
    
    if (innerContainer) {
      const blocks: { id: string; html: string; tagName: string }[] = [];
      
      // Select the tags that form lines/sections of the document
      Array.from(innerContainer.children).forEach((child, index) => {
        // Exclude the header and footer placeholders container if they are statically rendered
        const isHeader = child.id === 'brasao-header-container' || child.innerHTML.includes('brasao_brasil_estado_header');
        const isFooter = child.id === 'brasao-footer-container' || child.innerHTML.includes('brasao_brasil_estado_footer');
        
        blocks.push({
          id: `block_${index}_${child.tagName.toLowerCase()}`,
          html: child.outerHTML,
          tagName: child.tagName.toLowerCase()
        });
      });
      
      if (blocks.length > 0) {
        setDocBlocks(blocks);
      }
    }
  }, [htmlContent]);

  // Save reordered blocks back to HTML
  const saveReorderedBlocks = (updatedBlocks: typeof docBlocks) => {
    setDocBlocks(updatedBlocks);
    
    // Parse the original HTML structure and reconstruct
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const innerContainer = doc.querySelector('.p-12, .p-8, body > div') || doc.body;

    if (innerContainer) {
      // Clear current children
      innerContainer.innerHTML = '';
      
      // Re-add the blocks in the new order
      updatedBlocks.forEach(block => {
        const itemDoc = parser.parseFromString(block.html, 'text/html');
        if (itemDoc.body.firstElementChild) {
          innerContainer.appendChild(itemDoc.body.firstElementChild);
        }
      });

      onUpdateHtml(doc.body.firstElementChild?.outerHTML || htmlContent);
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...docBlocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    // Swap
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    
    saveReorderedBlocks(newBlocks);
  };

  const deleteBlock = (index: number) => {
    if (confirm('Deseja realmente excluir esta parte do documento?')) {
      const newBlocks = docBlocks.filter((_, idx) => idx !== index);
      saveReorderedBlocks(newBlocks);
    }
  };

  // Convert a block of document text into a Floating Element so the user can literally drag it!
  const convertBlockToFloating = (block: typeof docBlocks[0], index: number) => {
    // Strips HTML tags to get pure text content for the textbox
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = block.html;
    const txt = tempDiv.innerText.trim();

    addFloatingElement('texto_livre', `Bloco Convertido (${block.tagName})`, txt, {
      width: 320,
      height: 120,
      opacity: 1.0,
      style: "border: 1px dashed rgba(57,255,20,0.5); background-color: rgba(255,255,255,0.95); padding: 12px; font-family: 'Inter', sans-serif;"
    });

    // Remove the block from the static flow
    const newBlocks = docBlocks.filter((_, idx) => idx !== index);
    saveReorderedBlocks(newBlocks);
  };

  return (
    <div className="flex flex-col gap-5 bg-black/40 border border-[#1e1e1e] rounded-2xl p-5 mb-6">
      
      {/* Upper Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#222] pb-4 gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Move className="w-4 h-4 text-[#EAB308]" />
            Editor Interativo e Layout de Documento
          </h4>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Adicione Brasões Oficiais, Carimbos, Assinaturas ou mova blocos de texto no documento como em uma mesa de diagramação.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-[#0a0a0a] border border-[#222] p-1 rounded-xl">
          <button 
            type="button"
            onClick={() => setInteractMode('elements')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
              interactMode === 'elements' 
                ? 'bg-[#EAB308] text-black shadow-lg shadow-yellow-600/10' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 1. Elementos Flutuantes
          </button>
          <button 
            type="button"
            onClick={() => setInteractMode('reorder')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
              interactMode === 'reorder' 
                ? 'bg-[#EAB308] text-black shadow-md' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Move className="w-3.5 h-3.5" /> 2. Mover Partes / Blocos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Creation & Calibration Panels */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          
          {interactMode === 'elements' ? (
            <>
              {/* Quick Spawning Buttons */}
              <div className="bg-[#0c0c0c] border border-[#1e1e1e] p-4 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#EAB308] block mb-1">Criar Elementos</span>
                
                <button
                  type="button"
                  onClick={() => addFloatingElement('brasao_estado', `Brasão de ${activeState.nome}`, activeState.imagemUrl)}
                  className="w-full py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 px-3 transition-colors text-left cursor-pointer"
                >
                  <img src={activeState.imagemUrl} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                  Brasão do Estado ({activeState.uf})
                </button>

                <button
                  type="button"
                  onClick={() => addFloatingElement('brasao_federacao', 'Brasão da República', activeFederation.imagemUrl)}
                  className="w-full py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 px-3 transition-colors text-left cursor-pointer"
                >
                  <img src={activeFederation.imagemUrl} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                  Brasão da Federação (BR)
                </button>

                <div className="border-t border-[#1a1a1a] my-1"></div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono text-neutral-500 block px-1">Chancelas e Carimbos Oficiais</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {stamps.map(stamp => (
                      <button
                        key={stamp.label}
                        type="button"
                        onClick={() => addFloatingElement('carimbo', `Carimbo ${stamp.label}`, stamp.text, {
                          style: `border: 3px double ${stamp.color}; color: ${stamp.color}; font-weight: 800; font-family: monospace; font-size: 11px; padding: 6px; text-align: center; border-radius: 4px; background: rgba(255,255,255,0.9);`
                        })}
                        className="py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300 rounded font-medium truncate text-center cursor-pointer"
                      >
                        {stamp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#1a1a1a] my-1"></div>

                <button
                  type="button"
                  onClick={() => addFloatingElement('assinatura', 'Termo de Assinatura Digital', 'ASSINADO DIGITALMENTE CONFORME MP 2.200-2/2001', {
                    style: "border-left: 4px solid #059669; background: #ECFDF5; padding: 10px; font-family: sans-serif; font-size: 9px; color: #047857;"
                  })}
                  className="w-full py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 px-3 transition-colors text-left cursor-pointer"
                >
                  <Award className="w-4 h-4 text-emerald-500" />
                  Assinatura Eletrônica GDF
                </button>

                <button
                  type="button"
                  onClick={() => addFloatingElement('texto_livre', 'Metadados / Rodapé Adicional', 'Inserir observação oficial, de acordo com o art...', {
                    style: "border: 1px solid #ddd; padding: 8px; font-size: 11px; font-family: serif; background: #fff;"
                  })}
                  className="w-full py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 px-3 transition-colors text-left cursor-pointer"
                >
                  <Type className="w-4 h-4 text-[#39FF14]" />
                  Texto Personalizado / Lema
                </button>
              </div>

              {/* Adjustments Panel */}
              {selectedElement ? (
                <div className="bg-[#0c0c0c] border border-yellow-600/30 p-4 rounded-xl flex flex-col gap-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#EAB308]">Fino Ajuste</span>
                    <button 
                      onClick={() => deleteElement(selectedElement.id)}
                      className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition cursor-pointer"
                      title="Excluir elemento do preview"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <p className="text-[11px] text-white font-bold leading-none truncate bg-[#1a1a1a] p-2 rounded">
                    {selectedElement.label}
                  </p>

                  {/* Size Controller */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-400">Tamanho (Largura):</span>
                      <span className="text-[#39FF14] font-mono">{selectedElement.width}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" 
                      max="400" 
                      value={selectedElement.width}
                      onChange={e => {
                        const newW = parseInt(e.target.value);
                        updateSelectedProp('width', newW);
                        // Maintain ratio for crests
                        if (selectedElement.type.includes('brasao')) {
                          updateSelectedProp('height', newW);
                        }
                      }}
                      className="w-full accent-[#39FF14] h-1 bg-[#1a1a1a] rounded-lg appearance-none"
                    />
                  </div>

                  {/* Height Controller (non-crests) */}
                  {!selectedElement.type.includes('brasao') && (
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-400">Tamanho (Altura):</span>
                        <span className="text-[#39FF14] font-mono">{selectedElement.height}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="20" 
                        max="300" 
                        value={selectedElement.height}
                        onChange={e => updateSelectedProp('height', parseInt(e.target.value))}
                        className="w-full accent-[#39FF14] h-1 bg-[#1a1a1a] rounded-lg appearance-none"
                      />
                    </div>
                  )}

                  {/* Rotation Controller */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-400">Direção (Rotação):</span>
                      <span className="text-[#39FF14] font-mono">{selectedElement.rotation}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      value={selectedElement.rotation}
                      onChange={e => updateSelectedProp('rotation', parseInt(e.target.value))}
                      className="w-full accent-[#39FF14] h-1 bg-[#1a1a1a] rounded-lg appearance-none"
                    />
                  </div>

                  {/* Opacity Controller */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-400">Opacidade / Marca D'água:</span>
                      <span className="text-[#39FF14] font-mono">{Math.round(selectedElement.opacity * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={selectedElement.opacity * 100}
                      onChange={e => updateSelectedProp('opacity', parseFloat(e.target.value) / 100)}
                      className="w-full accent-[#39FF14] h-1 bg-[#1a1a1a] rounded-lg appearance-none"
                    />
                  </div>

                  {/* Manual coordinates sliders */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-500 font-mono">Posição X (px)</label>
                      <input 
                        type="number"
                        value={Math.round(selectedElement.x)}
                        onChange={e => updateSelectedProp('x', parseInt(e.target.value) || 0)}
                        className="w-full bg-black border border-[#222] text-xs text-white p-1 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 font-mono">Posição Y (px)</label>
                      <input 
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={e => updateSelectedProp('y', parseInt(e.target.value) || 0)}
                        className="w-full bg-black border border-[#222] text-xs text-white p-1 rounded font-mono"
                      />
                    </div>
                  </div>

                  {/* Text Edit field (for stamps and free text) */}
                  {(selectedElement.type === 'carimbo' || selectedElement.type === 'texto_livre' || selectedElement.type === 'assinatura') && (
                    <div>
                      <span className="text-[10px] text-neutral-400 block mb-1">Conteúdo de Texto</span>
                      <textarea
                        value={selectedElement.content}
                        onChange={e => updateSelectedProp('content', e.target.value)}
                        className="w-full bg-black border border-[#222] text-xs text-neutral-200 p-2 rounded h-16 leading-tight outline-none focus:border-[#39FF14]"
                      />
                    </div>
                  )}

                  <span className="text-[9px] text-stone-500 italic mt-1 leading-snug">
                    💡 Dica: Você pode arrastar este elemento clicando e movendo diretamente sobre o documento ao lado!
                  </span>
                </div>
              ) : (
                <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-xl text-center">
                  <p className="text-xs text-neutral-500">Selecione ou clique em qualquer elemento flutuante no preview ao lado para ajustar sua direção, tamanho e opacidade.</p>
                </div>
              )}
            </>
          ) : (
            /* Document Reorder Side Panel */
            <div className="bg-[#0c0c0c] border border-yellow-600/20 p-4 rounded-xl flex flex-col gap-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#EAB308] block">Seções do Documento ({docBlocks.length})</span>
              <p className="text-[10.5px] text-neutral-400 leading-relaxed">
                Clique nas setas para ordenar parágrafos, assinaturas e cabeçalhos ou converta-os em blocos flutuantes para arrastar por cima de todo o documento!
              </p>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {docBlocks.map((block, idx) => {
                  return (
                    <div key={block.id} className="bg-black/60 border border-[#222] p-2 rounded-lg flex items-center justify-between gap-2 hover:border-neutral-700 transition">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/5 rounded text-neutral-400 uppercase tracking-wide shrink-0">
                          {block.tagName}
                        </span>
                        <p className="text-[11px] text-neutral-300 truncate font-sans">
                          {block.html.replace(/<\/?[^>]+(>|$)/g, "").substr(0, 40) || "[Estrutura Visual]"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-white/10 text-neutral-400 disabled:opacity-20 rounded cursor-pointer"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, 'down')}
                          disabled={idx === docBlocks.length - 1}
                          className="p-1 hover:bg-white/10 text-neutral-400 disabled:opacity-20 rounded cursor-pointer"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => convertBlockToFloating(block, idx)}
                          className="p-1 hover:bg-[#39FF14]/10 text-neutral-300 rounded cursor-pointer"
                          title="Converter em Bloco Flutuante Livre"
                        >
                          <Sparkles className="w-3 h-3 text-[#EAB308]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBlock(idx)}
                          className="p-1 hover:bg-red-500/10 text-red-500 rounded cursor-pointer"
                          title="Excluir seção"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center/Right: Document Interactive Canvas Layout */}
        <div className="xl:col-span-3">
          <div className="relative bg-neutral-900 border border-[#1e1e1e] rounded-2xl p-4 overflow-hidden">
            {/* Context/Mode status badge */}
            <div className="absolute top-2 left-4 z-10 flex bg-black/80 border border-neutral-800 rounded-full px-3 py-1 items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${interactMode === 'reorder' ? 'bg-amber-500' : 'bg-[#39FF14]'} animate-pulse`}></span>
              <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
                {interactMode === 'reorder' ? 'Mover Elementos do Documento Ativo' : 'Adicionando Elementos Flutuantes livres'}
              </span>
            </div>

            {/* Instruction tooltip in preview */}
            <div className="absolute top-2 right-4 z-10 flex bg-black/80 border border-neutral-800 rounded-full px-2.5 py-1 text-[9.5px] text-neutral-400 items-center gap-1 font-mono">
              <Info className="w-3 h-3 text-[#EAB308]" /> No PDF ou Impresso, os elementos flutuantes são preservados.
            </div>

            {/* Render Canvas Card */}
            <div 
              id="interactive-print-area"
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative w-full bg-white rounded-xl shadow-2xl overflow-hidden min-h-[640px] border border-gray-300 p-8 pt-16 transition-all"
              style={{ contentEditable: false }}
            >
              
              {/* Floating elements layering render */}
              {elements.map((el) => {
                const isSelected = el.id === selectedId;
                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    className={`absolute user-select-none select-none transition-shadow ${
                      interactMode === 'elements' ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
                    } ${
                      isSelected && interactMode === 'elements' ? 'ring-2 ring-yellow-500 ring-offset-2 z-50' : 'z-40'
                    }`}
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                      transform: `rotate(${el.rotation}deg)`,
                      opacity: el.opacity,
                    }}
                  >
                    {/* Floating Item Internal Render */}
                    {el.type.includes('brasao') ? (
                      <img 
                        src={el.content} 
                        alt={el.label} 
                        className="w-full h-full object-contain pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div 
                        className="w-full h-full text-center flex items-center justify-center font-bold pointer-events-none"
                        style={{ ...JSON.parse(JSON.stringify(el.style ? inlineStyleToObj(el.style) : {})) }}
                      >
                        {el.content}
                      </div>
                    )}

                    {/* Small tag decorator */}
                    {isSelected && interactMode === 'elements' && (
                      <div className="absolute -top-6 left-0 bg-yellow-500 text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-sm leading-none flex items-center gap-1 uppercase">
                        <Move className="w-2.5 h-2.5" /> Mover brasão/carimbo
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Dynamic / Reordering layout of document body and text */}
              {interactMode === 'reorder' ? (
                <div className="space-y-2 prose max-w-none text-black select-none pointer-events-auto">
                  {docBlocks.map((block, idx) => (
                    <div 
                      key={block.id}
                      className="group relative border border-dashed border-neutral-300 hover:border-yellow-600/70 p-4 rounded-xl transition duration-200 bg-amber-50/10 cursor-default"
                    >
                      {/* Interactive block action bar inside preview */}
                      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-stone-800 text-white rounded-lg p-1 shadow flex items-center gap-1 z-50">
                        <span className="text-[8px] font-mono font-bold text-neutral-400 px-1.5 mr-1 uppercase">{block.tagName}</span>
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-neutral-800 disabled:opacity-20 rounded text-neutral-300 cursor-pointer"
                          title="Subir seção"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, 'down')}
                          disabled={idx === docBlocks.length - 1}
                          className="p-1 hover:bg-neutral-800 disabled:opacity-20 rounded text-neutral-300 cursor-pointer"
                          title="Descer seção"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => convertBlockToFloating(block, idx)}
                          className="p-1 hover:bg-neutral-800 rounded text-[#EAB308] cursor-pointer"
                          title="Tornar imagem/bloco flutuante livre para mover"
                        >
                          <Sparkles className="w-3 h-3" />
                        </button>
                        <span className="w-px h-3 bg-neutral-800 mx-1"></span>
                        <button
                          type="button"
                          onClick={() => deleteBlock(idx)}
                          className="p-1 hover:bg-red-500/10 text-red-500 rounded cursor-pointer"
                          title="Remover do documento"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Document block preview rendering */}
                      <div dangerouslySetInnerHTML={{ __html: block.html }} className="text-black" />
                    </div>
                  ))}
                </div>
              ) : (
                /* Pure interactive HTML view with dangerousSetInnerHTML */
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="prose max-w-none text-black select-text" />
              )}

            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-[#EAB308] shrink-0"></span>
            <p className="text-[10px] text-neutral-500 leading-snug">
              Note: Os elementos que você arrastar e colocar serão salvos em formato HTML com propriedades inline precisas quando você clicar em <strong>&quot;Aplicar ao Documento&quot;</strong> ou restaurar o modelo.
            </p>
          </div>
        </div>

      </div>

      {elements.length > 0 && (
        <div className="flex justify-end pt-3 border-t border-[#1a1a1a]">
          <button
            type="button"
            onClick={() => {
              // Re-inject elements into the final document HTML code as styled overlays!
              const parser = new DOMParser();
              const doc = parser.parseFromString(htmlContent, 'text/html');
              const innerContainer = doc.querySelector('.p-12, .p-8, body > div') || doc.body;

              if (innerContainer) {
                // Ensure elements inside a safe container
                let floatWrapper = innerContainer.querySelector('#floating-elements-print-container');
                if (!floatWrapper) {
                  floatWrapper = doc.createElement('div');
                  floatWrapper.setAttribute('id', 'floating-elements-print-container');
                  floatWrapper.setAttribute('style', 'position: relative; pointer-events: none; height: 0; overflow: visible;');
                  innerContainer.appendChild(floatWrapper);
                } else {
                  floatWrapper.innerHTML = '';
                }

                elements.forEach(el => {
                  const itemEl = doc.createElement('div');
                  itemEl.setAttribute('style', `
                    position: absolute;
                    left: ${el.x}px;
                    top: ${el.y}px;
                    width: ${el.width}px;
                    height: ${el.height}px;
                    transform: rotate(${el.rotation}deg);
                    opacity: ${el.opacity};
                    z-index: 99;
                  `);

                  if (el.type.includes('brasao')) {
                    itemEl.innerHTML = `<img src="${el.content}" alt="${el.label}" style="width: 100%; height: 100%; object-contain: fill;" referrerpolicy="no-referrer" />`;
                  } else {
                    itemEl.innerHTML = `<div style="${el.style || ''}">${el.content}</div>`;
                  }

                  floatWrapper.appendChild(itemEl);
                });

                onUpdateHtml(doc.body.firstElementChild?.outerHTML || htmlContent);
                alert("✨ Layout atualizado! Os elementos flutuantes foram injetados estavelmente no código fonte HTML do seu documento para visualização e exportação permanente!");
              }
            }}
            className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Salvar Elementos Flutuantes no Código
          </button>
        </div>
      )}

    </div>
  );
}

// Convert CSS clean inline styles to camelCase JavaScript styles
function inlineStyleToObj(styleStr: string): Record<string, string> {
  const obj: Record<string, string> = {};
  styleStr.split(';').forEach(item => {
    const pair = item.split(':');
    if (pair.length === 2) {
      const key = pair[0].trim().replace(/-./g, x => x[1].toUpperCase());
      obj[key] = pair[1].trim();
    }
  });
  return obj;
}
