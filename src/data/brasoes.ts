export interface BrasaoInfo {
  id: string;
  uf: string;
  nome: string;
  capital: string;
  lema?: string;
  imagemUrl: string;
  headerHtml: string;
  footerHtml: string;
}

export const BRASOES_DATA: BrasaoInfo[] = [
  {
    id: "federacao",
    uf: "BR",
    nome: "República Federativa do Brasil",
    capital: "Brasília",
    lema: "Ordem e Progresso",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Coat_of_arms_of_Brazil.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/bf/Coat_of_arms_of_Brazil.svg" alt="Brasão de Armas do Brasil" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">REPÚBLICA FEDERATIVA DO BRASIL</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">MINISTÉRIO PÚBLICO DA UNIÃO</h2>
  <h3 style="font-size: 11px; font-weight: 50 tracking-widest; text-transform: uppercase; margin: 1px 0; color: #78716c;">DIRETORIA DE ADMINISTRAÇÃO E GESTÃO ESTRATÉGICA</h3>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Esplanada dos Ministérios, Bloco T - Brasília/DF • CEP 70064-900</p>
  <p style="margin: 2px 0;">Telefone: (61) 3300-0000 • www.gov.br</p>
</div>`
  },
  {
    id: "acre",
    uf: "AC",
    nome: "Acre",
    capital: "Rio Branco",
    lema: "Nec Luceo Pluribus Impar",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/0/03/Bras%C3%A3o_do_Acre.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/0/03/Bras%C3%A3o_do_Acre.svg" alt="Brasão do Estado do Acre" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO ACRE</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DA FAZENDA</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Rua Benjamin Constant, nº 947, Centro - Rio Branco/AC</p>
  <p style="margin: 2px 0;">www.ac.gov.br</p>
</div>`
  },
  {
    id: "alagoas",
    uf: "AL",
    nome: "Alagoas",
    capital: "Maceió",
    lema: "Ad Bonum Et Prosperitatem",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Bras%C3%A3o_de_Alagoas.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Bras%C3%A3o_de_Alagoas.svg" alt="Brasão do Estado de Alagoas" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE ALAGOAS</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DO PLANEJAMENTO</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Av. Fernandes de Lima, s/n, Farol - Maceió/AL</p>
  <p style="margin: 2px 0;">www.al.gov.br</p>
</div>`
  },
  {
    id: "amapa",
    uf: "AP",
    nome: "Amapá",
    capital: "Macapá",
    lema: "Aqui Começa o Brasil",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Bras%C3%A3o_do_Amap%C3%A1.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Bras%C3%A3o_do_Amap%C3%A1.svg" alt="Brasão do Estado do Amapá" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO AMAPÁ</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DA ADMINISTRAÇÃO</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Av. Fab, nº 840, Centro - Macapá/AP</p>
  <p style="margin: 2px 0;">www.ap.gov.br</p>
</div>`
  },
  {
    id: "amazonas",
    uf: "AM",
    nome: "Amazonas",
    capital: "Manaus",
    lema: "Pelo Amazonas, Pátria e Família",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/Bras%C3%A3o_do_Amazonas.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/Bras%C3%A3o_do_Amazonas.svg" alt="Brasão do Estado do Amazonas" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO AMAZONAS</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DE SAÚDE - SUS</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Av. Brasil, nº 3939, Compensa II - Manaus/AM</p>
  <p style="margin: 2px 0;">www.am.gov.br</p>
</div>`
  },
  {
    id: "bahia",
    uf: "BA",
    nome: "Bahia",
    capital: "Salvador",
    lema: "Per Ardua Surgo",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/5/53/Bras%C3%A3o_da_Bahia.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Bras%C3%A3o_da_Bahia.svg" alt="Brasão do Estado da Bahia" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DA BAHIA</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DA EDUCAÇÃO</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Centro Administrativo da Bahia (CAB) - Salvador/BA</p>
  <p style="margin: 2px 0;">www.ba.gov.br</p>
</div>`
  },
  {
    id: "ceara",
    uf: "CE",
    nome: "Ceará",
    capital: "Fortaleza",
    lema: "Terra da Luz",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Bras%C3%A3o_do_Cear%C3%A1.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/e/ee/Bras%C3%A3o_do_Cear%C3%A1.svg" alt="Brasão do Estado do Ceará" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO CEARÁ</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DAS CIDADES</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Av. General Afonso Albuquerque Lima, s/n, Cambeba - Fortaleza/CE</p>
  <p style="margin: 2px 0;">www.ce.gov.br</p>
</div>`
  },
  {
    id: "distritofederal",
    uf: "DF",
    nome: "Distrito Federal",
    capital: "Brasília",
    lema: "Venturis Ventis",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Bras%C3%A3o_do_Distrito_Federal_%28Brasil%29.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f6/Bras%C3%A3o_do_Distrito_Federal_%28Brasil%29.svg" alt="Brasão do Distrito Federal" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO DISTRITO FEDERAL</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">CONTROLADORIA GERAL DO DISTRITO FEDERAL</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Palácio do Buriti, Praça do Buriti - Brasília/DF</p>
  <p style="margin: 2px 0;">www.df.gov.br</p>
</div>`
  },
  {
    id: "espiritosanto",
    uf: "ES",
    nome: "Espírito Santo",
    capital: "Vitória",
    lema: "Trabalha e Confia",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Bras%C3%A3o_do_Esp%C3%ADrito_Santo.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Bras%C3%A3o_do_Esp%C3%ADrito_Santo.svg" alt="Brasão do Estado do Espírito Santo" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO ESPÍRITO SANTO</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DE DIREITOS HUMANOS</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Palácio Anchieta, Praça João Clímaco - Vitória/ES</p>
  <p style="margin: 2px 0;">www.es.gov.br</p>
</div>`
  },
  {
    id: "goias",
    uf: "GO",
    nome: "Goiás",
    capital: "Goiânia",
    lema: "Pátria e Liberdade",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Bras%C3%A3o_de_Goi%C3%A1s.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Bras%C3%A3o_de_Goi%C3%A1s.svg" alt="Brasão do Estado de Goiás" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE GOIÁS</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DA SEGURANÇA PÚBLICA</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Rua 82, nº 400, Palácio Pedro Ludovico Teixeira - Goiânia/GO</p>
  <p style="margin: 2px 0;">www.go.gov.br</p>
</div>`
  },
  {
    id: "maranhao",
    uf: "MA",
    nome: "Maranhão",
    capital: "São Luís",
    lema: "Caelum, Non Animum, Mutant Qui Trans Mare Currunt",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Bras%C3%A3o_do_Maranh%C3%A3o.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Bras%C3%A3o_do_Maranh%C3%A3o.svg" alt="Brasão do Estado do Maranhão" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO MARANHÃO</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DE INDÚSTRIA E COMÉRCIO</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Palácio dos Leões, Av. D. Pedro II - São Luís/MA</p>
  <p style="margin: 2px 0;">www.ma.gov.br</p>
</div>`
  },
  {
    id: "matogrosso",
    uf: "MT",
    nome: "Mato Grosso",
    capital: "Cuiabá",
    lema: "Virtute Plusquam Auro",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Bras%C3%A3o_de_Mato_Grosso.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Bras%C3%A3o_de_Mato_Grosso.svg" alt="Brasão do Estado de Mato Grosso" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE MATO GROSSO</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DE MEIO AMBIENTE</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Centro Político Administrativo (CPA) - Cuiabá/MT</p>
  <p style="margin: 2px 0;">www.mt.gov.br</p>
</div>`
  },
  {
    id: "matogrossodosul",
    uf: "MS",
    nome: "Mato Grosso do Sul",
    capital: "Campo Grande",
    lema: "Aurora de Esperança",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/7/73/Bras%C3%A3o_de_Mato_Grosso_do_Sul.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/7/73/Bras%C3%A3o_de_Mato_Grosso_do_Sul.svg" alt="Brasão do Estado de Mato Grosso do Sul" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE MATO GROSSO DO SUL</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE AGRICULTURA E DESENVOLVIMENTO</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Parque dos Poderes, s/n - Campo Grande/MS</p>
  <p style="margin: 2px 0;">www.ms.gov.br</p>
</div>`
  },
  {
    id: "minasgerais",
    uf: "MG",
    nome: "Minas Gerais",
    capital: "Belo Horizonte",
    lema: "Libertas Quae Sera Tamen",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Bras%C3%A3o_de_Minas_Gerais.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Bras%C3%A3o_de_Minas_Gerais.svg" alt="Brasão do Estado de Minas Gerais" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE MINAS GERAIS</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DE INFRAESTRUTURA</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Cidade Administrativa de Minas Gerais, Serra Verde - Belo Horizonte/MG</p>
  <p style="margin: 2px 0;">www.mg.gov.br</p>
</div>`
  },
  {
    id: "para",
    uf: "PA",
    nome: "Pará",
    capital: "Belém",
    lema: "Sub Lege Inimicus, Sub Rege Amicus",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/Bras%C3%A3o_do_Par%C3%A1.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/Bras%C3%A3o_do_Par%C3%A1.svg" alt="Brasão do Estado do Pará" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO PARÁ</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DE DESENVOLVIMENTO ECONÔMICO</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Rodovia Arthur Bernardes, nº 1000 - Belém/PA</p>
  <p style="margin: 2px 0;">www.pa.gov.br</p>
</div>`
  },
  {
    id: "paraiba",
    uf: "PB",
    nome: "Paraíba",
    capital: "João Pessoa",
    lema: "Nego",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Bras%C3%A3o_da_Para%C3%ADba.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/0/0a/Bras%C3%A3o_da_Para%C3%ADba.svg" alt="Brasão do Estado da Paraíba" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DA PARAÍBA</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DA RECEITA</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Centro Administrativo Estadual, s/n, Jaguaribe - João Pessoa/PB</p>
  <p style="margin: 2px 0;">www.pb.gov.br</p>
</div>`
  },
  {
    id: "parana",
    uf: "PR",
    nome: "Paraná",
    capital: "Curitiba",
    lema: "Independência ou Morte",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Bras%C3%A3o_do_Paran%C3%A1.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Bras%C3%A3o_do_Paran%C3%A1.svg" alt="Brasão do Estado do Paraná" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO PARANÁ</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DA JUSTIÇA</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Praça Nossa Senhora de Salette, s/n, Centro Cívico - Curitiba/PR</p>
  <p style="margin: 2px 0;">www.pr.gov.br</p>
</div>`
  },
  {
    id: "pernambuco",
    uf: "PE",
    nome: "Pernambuco",
    capital: "Recife",
    lema: "Ego Sum Qui Sum",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Bras%C3%A3o_de_Pernambuco.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Bras%C3%A3o_de_Pernambuco.svg" alt="Brasão do Estado de Pernambuco" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE PERNAMBUCO</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE DEFESA SOCIAL</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Palácio do Campo das Princesas, Praça da República - Recife/PE</p>
  <p style="margin: 2px 0;">www.pe.gov.br</p>
</div>`
  },
  {
    id: "piaui",
    uf: "PI",
    nome: "Piauí",
    capital: "Teresina",
    lema: "Impavidum Ferient Ruinae",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Bras%C3%A3o_do_Piau%C3%AD.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Bras%C3%A3o_do_Piau%C3%AD.svg" alt="Brasão do Estado do Piauí" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO PIAUÍ</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DO MEIO AMBIENTE</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Av. Antonino Freire, nº 1450, Centro - Teresina/PI</p>
  <p style="margin: 2px 0;">www.pi.gov.br</p>
</div>`
  },
  {
    id: "riodejaneiro",
    uf: "RJ",
    nome: "Rio de Janeiro",
    capital: "Rio de Janeiro",
    lema: "Recte Rem Publicam Gerere",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/2/22/Bras%C3%A3o_do_estado_do_Rio_de_Janeiro.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/2/22/Bras%C3%A3o_do_estado_do_Rio_de_Janeiro.svg" alt="Brasão do Estado do Rio de Janeiro" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO RIO DE JANEIRO</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DE TRANSPORTES</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Palácio Guanabara, Rua Pinheiro Machado, s/n - Laranjeiras - Rio de Janeiro/RJ</p>
  <p style="margin: 2px 0;">www.rj.gov.br</p>
</div>`
  },
  {
    id: "riograndedonorte",
    uf: "RN",
    nome: "Rio Grande do Norte",
    capital: "Natal",
    lema: "Rio Grande do Norte",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Bras%C3%A3o_do_Rio_Grande_do_Norte.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Bras%C3%A3o_do_Rio_Grande_do_Norte.svg" alt="Brasão do Estado do Rio Grande do Norte" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO RIO GRANDE DO NORTE</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DO TURISMO</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Centro Administrativo do Estado, BR-101, s/n, Lagoa Nova - Natal/RN</p>
  <p style="margin: 2px 0;">www.rn.gov.br</p>
</div>`
  },
  {
    id: "riograndedosul",
    uf: "RS",
    nome: "Rio Grande do Sul",
    capital: "Porto Alegre",
    lema: "Liberdade, Igualdade, Humanidade",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/1/11/Bras%C3%A3o_do_Rio_Grande_do_Sul.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/1/11/Bras%C3%A3o_do_Rio_Grande_do_Sul.svg" alt="Brasão do Estado do Rio Grande do Sul" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO RIO GRANDE DO SUL</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DA CULTURA</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Praça Marechal Deodoro, s/n, Palácio Piratini - Porto Alegre/RS</p>
  <p style="margin: 2px 0;">www.rs.gov.br</p>
</div>`
  },
  {
    id: "rondonia",
    uf: "RO",
    nome: "Rondônia",
    capital: "Porto Velho",
    lema: "Rondônia, Terra de Bravos",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Bras%C3%A3o_de_Rond%C3%B4nia.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Bras%C3%A3o_de_Rond%C3%B4nia.svg" alt="Brasão do Estado de Rondônia" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE RONDÔNIA</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DA INFRAESTRUTURA</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Palácio Rio Madeira, Av. Farquar, nº 2986 - Porto Velho/RO</p>
  <p style="margin: 2px 0;">www.ro.gov.br</p>
</div>`
  },
  {
    id: "roraima",
    uf: "RR",
    nome: "Roraima",
    capital: "Boa Vista",
    lema: "Amazônia e Progresso",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Bras%C3%A3o_de_Roraima.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Bras%C3%A3o_de_Roraima.svg" alt="Brasão do Estado de Roraima" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE RORAIMA</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE PLANEJAMENTO E DESENVOLVIMENTO</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Palácio Senador Hélio Campos, Praça do Centro Cívico - Boa Vista/RR</p>
  <p style="margin: 2px 0;">www.rr.gov.br</p>
</div>`
  },
  {
    id: "santacatarina",
    uf: "SC",
    nome: "Santa Catarina",
    capital: "Florianópolis",
    lema: "Estado de Santa Catarina",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bras%C3%A3o_de_Santa_Catarina.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bras%C3%A3o_de_Santa_Catarina.svg" alt="Brasão do Estado de Santa Catarina" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE SANTA CATARINA</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DA SEGURANÇA PÚBLICA</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Rodovia SC-401, nº 4600, Saco Grande - Florianópolis/SC</p>
  <p style="margin: 2px 0;">www.sc.gov.br</p>
</div>`
  },
  {
    id: "saopaulo",
    uf: "SP",
    nome: "São Paulo",
    capital: "São Paulo",
    lema: "Pro Brasilia Fiat Eximia",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/b/be/Bras%C3%A3o_do_estado_de_S%C3%A3o_Paulo.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Bras%C3%A3o_do_estado_de_S%C3%A3o_Paulo.svg" alt="Brasão do Estado de São Paulo" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE SÃO PAULO</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE DESENVOLVIMENTO ECONÔMICO</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Av. Morumbi, nº 4500, Palácio dos Bandeirantes - São Paulo/SP</p>
  <p style="margin: 2px 0;">www.sp.gov.br</p>
</div>`
  },
  {
    id: "sergipe",
    uf: "SE",
    nome: "Sergipe",
    capital: "Aracaju",
    lema: "Sub Lege Libertas",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/Bras%C3%A3o_de_Sergipe.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/Bras%C3%A3o_de_Sergipe.svg" alt="Brasão do Estado de Sergipe" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DE SERGIPE</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DE ESTADO DA SAÚDE</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Rua Vila Cristina, nº 150, Centro - Aracaju/SE</p>
  <p style="margin: 2px 0;">www.se.gov.br</p>
</div>`
  },
  {
    id: "tocantins",
    uf: "TO",
    nome: "Tocantins",
    capital: "Palmas",
    lema: "Coivara de Trabalho",
    imagemUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Bras%C3%A3o_do_Tocantins.svg",
    headerHtml: `<div class="text-center mb-8 border-b-2 border-stone-800 pb-4 no-print" style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #1c1917; font-family: 'Inter', sans-serif;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Bras%C3%A3o_do_Tocantins.svg" alt="Brasão do Estado do Tocantins" style="height: 80px; width: auto; margin: 0 auto 10px auto; display: block;" referrerpolicy="no-referrer" />
  <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 2px 0; color: #1c1917; letter-spacing: 1px;">GOVERNO DO ESTADO DO TOCANTINS</h1>
  <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 2px 0; color: #44403c;">SECRETARIA DO MEIO AMBIENTE E RECURSOS HÍDRICOS</h2>
</div>`,
    footerHtml: `<div class="text-center mt-12 pt-4 border-t border-stone-200" style="text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-family: 'Inter', sans-serif; font-size: 11px; color: #78716c;">
  <p style="margin: 2px 0; font-weight: 600;">Esplanada das Nações, Praça dos Girassóis - Palmas/TO</p>
  <p style="margin: 2px 0;">www.to.gov.br</p>
</div>`
  }
];
