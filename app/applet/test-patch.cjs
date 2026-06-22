const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const newBlock = `                      <div className="bg-[#111] border border-[#222] rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                           <FileSpreadsheet className="w-3.5 h-3.5 text-[#39FF14]" />
                           <span className="font-bold text-xs text-white">Tabela: Folha de Ponto</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="text-[8px] text-gray-500 uppercase font-mono block mb-1">Linhas</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="100" 
                              value={pontoRows} 
                              onChange={(e) => setPontoRows(parseInt(e.target.value) || 12)} 
                              className="w-full bg-black border border-[#222] rounded text-center py-1 text-xs text-white" 
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-gray-500 uppercase font-mono block mb-1">Colunas</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="20" 
                              value={pontoCols} 
                              onChange={(e) => setPontoCols(parseInt(e.target.value) || 7)} 
                              className="w-full bg-black border border-[#222] rounded text-center py-1 text-xs text-white" 
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const defaultHeaders = ["Data", "Entrada 1", "Saída 1", "Entrada 2", "Saída 2", "Assinatura", "Obs"];
                            const headers = Array.from({length: pontoCols}).map((_, i) => defaultHeaders[i] || \`Extra \${i + 1}\`);

                            const timesheetHtml = \`
                              <table class="w-full border-collapse border border-black text-xs my-4" style="border: 2px solid black; border-collapse: collapse; width: 100%;">
                                <thead>
                                  <tr class="bg-gray-100">
                                    \${headers.map((h, i) => \`
                                      <th class="border border-black p-1 text-center font-bold" style="border: 1px solid black; width: \${100/pontoCols}%;">\${h}</th>
                                    \`).join('')}
                                  </tr>
                                </thead>
                                <tbody>
                                  \${Array.from({length: pontoRows}).map((_, i) => \`
                                  <tr>
                                    \${headers.map((h, j) => \`
                                      <td class="border border-black p-1 \${j === 0 ? 'text-center font-mono' : ''}" style="border: 1px solid black; height: 26px;">\${j === 0 && h === 'Data' ? i + 1 : ''}</td>
                                    \`).join('')}
                                  </tr>
                                  \`).join('')}
                                </tbody>
                              </table>
                              <p>&nbsp;</p>
                            \`;
                            insertHtmlAtCursor(timesheetHtml);
                          }}
                          className="w-full py-1.5 bg-[#222] hover:bg-[#39FF14] transition text-gray-300 hover:text-black font-bold text-[10px] uppercase rounded-lg flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Gerar Folha
                        </button>
                      </div>`;

// Replace lines 2426 - 2466 in index 2426 is 2427 since 0-indexed
lines.splice(2426, 41, newBlock);

fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log("Patched successfully.");
