import { useState, useEffect } from 'react';
import { Template, GeneratedDocument } from './types';

const TEMPLATES_KEY = 'documestre_templates';
const DOCS_KEY = 'documestre_documents';

const defaultTemplates: Template[] = [
  {
    id: 'default-1',
    name: 'Recibo Simples',
    type: 'recibo',
    format: 'text',
    content: `RECIBO DE PAGAMENTO

Recebi(emos) de {{nome_pagador}}, a quantia de R$ {{valor}} ({{valor_extenso}}), 
referente a {{referencia_pagamento}}.

Para maior clareza firmamos o presente.

Local e Data: {{cidade}}, {{data}}

_____________________________________________________
Assinatura: {{nome_recebedor}}
CPF/CNPJ: {{documento_recebedor}}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-2',
    name: 'Nota Fiscal de Serviço (Simulada)',
    type: 'nota',
    format: 'text',
    content: `================================================
NOTA FISCAL DE SERVIÇO 
================================================
Nº da Nota: {{numero_nota}}
Data de Emissão: {{data_emissao}}

PRESTADOR DO SERVIÇO:
Nome/Razão Social: {{prestador_nome}}
CNPJ/CPF: {{prestador_doc}}

TOMADOR DO SERVIÇO:
Nome/Razão Social: {{tomador_nome}}
CNPJ/CPF: {{tomador_doc}}

DESCRIÇÃO DOS SERVIÇOS:
{{descricao_servicos}}

VALOR TOTAL: R$ {{valor_total}}
================================================
Assinatura do Prestador: ______________________`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-3',
    name: 'Contrato de Serviço (HTML)',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
  <h1 style="text-align: center; color: #2C3E50; border-bottom: 2px solid #3498DB; padding-bottom: 10px;">
    CONTRATO DE PRESTAÇÃO DE SERVIÇOS
  </h1>
  
  <p style="text-align: justify; line-height: 1.6; margin-top: 20px;">
    Pelo presente instrumento particular, de um lado <strong>{{nome_contratante}}</strong>, 
    doravante denominado CONTRATANTE, e de outro lado <strong>{{nome_contratado}}</strong>, 
    doravante denominado CONTRATADO.
  </p>

  <h3 style="color: #2980B9;">1. DO OBJETO</h3>
  <p style="text-align: justify; line-height: 1.6;">
    O presente contrato tem como objeto a prestação de serviços de <em>{{descricao_servico}}</em>.
  </p>

  <h3 style="color: #2980B9;">2. DO VALOR E PAGAMENTO</h3>
  <p style="text-align: justify; line-height: 1.6;">
    Pelos serviços ora contratados, o CONTRATANTE pagará ao CONTRATADO a quantia de 
    <strong style="color: #27AE60;">R$ {{valor_total}}</strong> ({{valor_extenso}}), 
    que deverá ser paga na seguinte data: <strong>{{data_pagamento}}</strong>.
  </p>

  <br><br><br>
  
  <div style="display: flex; justify-content: space-between; margin-top: 50px;">
    <div style="text-align: center; width: 45%;">
      <div style="border-top: 1px solid #000; padding-top: 10px;">
        {{nome_contratante}}<br>
        <span style="font-size: 12px; color: #7F8C8D;">Contratante</span>
      </div>
    </div>
    
    <div style="text-align: center; width: 45%;">
      <div style="border-top: 1px solid #000; padding-top: 10px;">
        {{nome_contratado}}<br>
        <span style="font-size: 12px; color: #7F8C8D;">Contratado</span>
      </div>
    </div>
  </div>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-4',
    name: 'Mensagem de Ano Novo',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; background: linear-gradient(135deg, #FFD700 0%, #B8860B 100%); padding: 40px; border-radius: 12px; color: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
  <h1 style="font-size: 36px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">Feliz Ano Novo! 🎉</h1>
  <p style="font-size: 20px; line-height: 1.6; margin-bottom: 30px;">
    Querido(a) <strong>{{nome_destinatario}}</strong>,<br><br>
    Que este ano de <strong>{{ano}}</strong> traga muitas alegrias, prosperidade e paz para a sua vida!<br>
    Que todos os seus sonhos se realizem.
  </p>
  <p style="font-size: 18px; font-style: italic;">Com carinho,</p>
  <h3 style="font-size: 24px; margin-top: 10px;">{{nome_remetente}}</h3>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-5',
    name: 'Cartão de Natal',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; text-align: center; background-color: #E23D28; color: #fff; padding: 40px; border-radius: 12px; border: 5px solid #228B22; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
  <h1 style="font-size: 42px; margin-bottom: 10px;">🎄 Feliz Natal! 🎅</h1>
  <p style="font-size: 22px; line-height: 1.6; margin-top: 30px; margin-bottom: 30px;">
    Para: <strong>{{nome_destinatario}}</strong>
  </p>
  <p style="font-size: 18px; line-height: 1.8; margin-bottom: 30px;">
    Nesta data tão mágica, desejo que o espírito do Natal encha o seu coração de paz, amor e esperança.<br>
    Que você celebre com muita alegria junto das pessoas que ama!
  </p>
  <p style="font-size: 18px; margin-top: 40px;">Um grande abraço de,</p>
  <h3 style="font-size: 26px; color: #FFD700;">{{nome_remetente}}</h3>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-6',
    name: 'Convite/Mensagem Aniversário',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Comic Sans MS', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; text-align: center; background: #FFF0F5; padding: 40px; border-radius: 20px; border: 3px dashed #FF69B4; color: #333; box-shadow: 0 8px 24px rgba(0,0,0,0.1);">
  <h1 style="font-size: 38px; color: #FF1493; margin-bottom: 20px;">🎈 Feliz Aniversário! 🎂</h1>
  <h2 style="font-size: 28px; color: #8A2BE2; margin-bottom: 30px;">{{nome_aniversariante}}</h2>
  <p style="font-size: 20px; line-height: 1.6; color: #555;">
    Hoje é o seu dia especial! Parabéns por completar mais um ano de vida e por ser essa pessoa tão incrível.<br><br>
    Desejo-lhe saúde, sucesso, paz e muitas felicidades! Aproveite o seu dia! 🥳
  </p>
  <p style="font-size: 22px; margin-top: 40px; color: #FF1493; font-weight: bold;">
    Muitos beijos,
  </p>
  <p style="font-size: 24px; color: #8A2BE2;">{{nome_remetente}}</p>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-7',
    name: 'Convite de Casamento',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Times New Roman', Times, serif; max-width: 700px; margin: 0 auto; text-align: center; background: #FAFAFA; padding: 50px; border: 1px solid #E0E0E0; border-radius: 8px; color: #4A4A4A; box-shadow: inset 0 0 20px rgba(0,0,0,0.05);">
  <div style="font-size: 40px; color: #D4AF37; margin-bottom: 30px;">💍</div>
  <p style="font-size: 16px; text-transform: uppercase; letter-spacing: 3px; color: #888;">Temos a honra de convidar para o nosso casamento</p>
  <h1 style="font-size: 48px; font-weight: normal; margin: 30px 0; color: #1D1D1D;">
    {{nome_pessoa_1}} <span style="color: #D4AF37;">&amp;</span> {{nome_pessoa_2}}
  </h1>
  <p style="font-size: 20px; font-style: italic; margin-bottom: 40px;">
    "{{mensagem_convite}}"
  </p>
  <div style="font-size: 18px; line-height: 1.8; margin-bottom: 40px;">
    <strong>Data:</strong> {{data_casamento}}<br>
    <strong>Local:</strong> {{local_casamento}}
  </div>
  <p style="font-size: 16px; color: #888; border-top: 1px solid #EEE; padding-top: 20px;">
    Contamos com a sua valiosa presença!
  </p>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-8',
    name: 'Dia do Professor',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; background: #Fdfbf7; padding: 40px; border-left: 10px solid #2E8B57; border-radius: 8px; color: #333; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  <h1 style="font-size: 32px; color: #2E8B57; margin-bottom: 10px;">Feliz Dia do Professor! 🍎</h1>
  <h2 style="font-size: 24px; color: #555; margin-bottom: 30px;">Para o(a) Professor(a) {{nome_professor}}</h2>
  <p style="font-size: 18px; line-height: 1.7; text-align: justify;">
    Obrigado(a) por sua dedicação, paciência e por compartilhar seu conhecimento conosco todos os dias. 
    Seu trabalho é a base que constrói o nosso futuro. 
    <br><br>
    Você é uma grande inspiração! 📚✏️
  </p>
  <p style="font-size: 18px; font-weight: bold; text-align: right; margin-top: 40px; color: #2E8B57;">
    Com gratidão, <br>
    {{nome_aluno}}
  </p>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-9',
    name: 'Dia do Trabalhador',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; text-align: center; background: #fff; padding: 40px; border-top: 8px solid #005A9C; border-radius: 8px; color: #222; box-shadow: 0 6px 15px rgba(0,0,0,0.1);">
  <h1 style="font-size: 36px; color: #005A9C; margin-bottom: 15px;">Parabéns pelo Dia do Trabalhador! 💼</h1>
  <p style="font-size: 22px; font-weight: 500; color: #444; margin-bottom: 30px;">
    {{nome_trabalhador}}
  </p>
  <p style="font-size: 18px; line-height: 1.6; margin-bottom: 40px;">
    Hoje é o dia de homenagear você e todos aqueles que, com suor, dedicação e esforço, ajudam a construir um mundo melhor. <br><br>
    Obrigado(a) por todo o seu empenho e profissionalismo. O seu trabalho faz a diferença!
  </p>
  <div style="background: #F0F8FF; padding: 20px; border-radius: 8px;">
    <p style="font-size: 18px; font-weight: bold; color: #005A9C; margin: 0;">
      Uma homenagem da equipe: <br>
      {{nome_empresa}}
    </p>
  </div>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-10',
    name: 'Recibo de Pagamento',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px; border: 1px solid #ccc; line-height: 1.6;">
  <h1 style="text-align: center; text-transform: uppercase; margin-bottom: 30px;">Recibo</h1>
  <p style="text-align: right; font-weight: bold; font-size: 18px;">Valor: R$ {{valor}}</p>
  <p style="text-align: justify; margin-top: 30px;">
    Recebi(emos) de <strong>{{nome_pagador}}</strong>, inscrito(a) no CPF/CNPJ nº <strong>{{documento_pagador}}</strong>, 
    a importância de <strong>R$ {{valor}}</strong> ({{valor_por_extenso}}), 
    referente a <strong>{{referencia_pagamento}}</strong>.
  </p>
  <p style="text-align: justify; margin-top: 20px;">
    Para maior clareza e validade, firmo o presente recibo.
  </p>
  <div style="margin-top: 50px; text-align: right;">
    {{cidade}}, {{data_emissao}}
  </div>
  <div style="margin-top: 70px; text-align: center;">
    _________________________________________________________<br>
    <strong>{{nome_recebedor}}</strong><br>
    CPF/CNPJ: {{documento_recebedor}}
  </div>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-11',
    name: 'Declaração de Trabalho',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Times New Roman', serif; max-width: 700px; margin: 0 auto; padding: 50px; line-height: 1.8;">
  <h2 style="text-align: center; text-transform: uppercase;">Declaração de Vínculo Empregatício</h2>
  <p style="text-align: justify; margin-top: 40px;">
    Declaramos para os devidos fins que o(a) Sr(a). <strong>{{nome_funcionario}}</strong>, 
    portador(a) do RG nº {{rg_funcionario}} e do CPF nº {{cpf_funcionario}}, 
    é nosso funcionário(a) e trabalha nesta empresa, <strong>{{nome_empresa}}</strong>, 
    CNPJ nº {{cnpj_empresa}}, exercendo o cargo de <strong>{{cargo}}</strong>, 
    com carga horária de {{carga_horaria}} horas semanais, 
    desde {{data_admissao}} até a presente data.
  </p>
  <p style="text-align: justify; margin-top: 30px;">
    Sendo a expressão da verdade, firmamos a presente declaração.
  </p>
  <div style="margin-top: 50px; text-align: right;">
    {{cidade_empresa}}, {{data_atual}}
  </div>
  <div style="margin-top: 80px; text-align: center;">
    _________________________________________________________<br>
    <strong>{{nome_responsavel}}</strong><br>
    {{cargo_responsavel}}<br>
    {{nome_empresa}}
  </div>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-12',
    name: 'Dia das Mães',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; text-align: center; background-color: #FFF5F5; padding: 40px; border-radius: 15px; border: 2px solid #FEB2B2; color: #742A2A;">
  <h1 style="font-size: 36px; margin-bottom: 20px;">🌸 Feliz Dia das Mães! 🌸</h1>
  <h2 style="font-size: 24px; font-weight: normal; margin-bottom: 30px;">Para a melhor mãe do mundo: <strong>{{nome_mae}}</strong></h2>
  <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px; font-style: italic;">
    "Mãe: palavra pequena, mas com um significado infinito, pois quer dizer amor, dedicação, renúncia a si própria, força e sabedoria. Ser mãe não é apenas dar a luz, mas sim, participar da vida dos seus frutos gerados ou criados."
  </p>
  <p style="font-size: 20px; margin-bottom: 40px;">
    Obrigado(a) por tudo! Te amo muito! ❤️
  </p>
  <p style="font-size: 22px; font-weight: bold; color: #E53E3E;">
    Com amor,<br>
    {{nome_filho}}
  </p>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-13',
    name: 'Dia dos Pais',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; background-color: #F0F4F8; padding: 40px; border-radius: 10px; border-top: 10px solid #2B6CB0; color: #2D3748;">
  <h1 style="font-size: 36px; color: #2B6CB0; margin-bottom: 10px;">👔 Feliz Dia dos Pais! 💙</h1>
  <h2 style="font-size: 24px; font-weight: normal; margin-bottom: 30px;">Querido Pai, <strong>{{nome_pai}}</strong></h2>
  <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
    Pai, você é meu herói, meu exemplo e minha maior inspiração. 
    Agradeço por todos os ensinamentos, por cada abraço e por estar sempre ao meu lado nas horas que mais preciso.
  </p>
  <p style="font-size: 20px; font-weight: bold; margin-bottom: 40px;">
    Que o seu dia seja repleto de alegria e muito amor!
  </p>
  <p style="font-size: 20px; color: #2B6CB0;">
    Do seu filho(a),<br>
    <strong>{{nome_filho}}</strong>
  </p>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-14',
    name: 'Convite Chá de Bebê',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Comic Sans MS', cursive, sans-serif; max-width: 500px; margin: 0 auto; text-align: center; background-color: #FFFFF0; padding: 40px; border-radius: 25px; border: 4px dotted #FFDEAD; color: #696969;">
  <div style="font-size: 50px; margin-bottom: 10px;">🧸🍼</div>
  <h1 style="font-size: 32px; color: #FFA07A; margin-bottom: 20px;">Chá de Bebê</h1>
  <p style="font-size: 20px; margin-bottom: 20px;">
    Estamos muito felizes e queremos compartilhar esse momento especial com você!
  </p>
  <h2 style="font-size: 28px; color: #87CEEB; margin-bottom: 30px;">Venha celebrar a chegada de {{nome_bebe}}!</h2>
  
  <div style="background-color: #fff; padding: 20px; border-radius: 15px; border: 2px solid #EEE; margin-bottom: 30px; line-height: 1.8;">
    <strong>🗓️ Data:</strong> {{data_evento}}<br>
    <strong>⏰ Horário:</strong> {{horario_evento}}<br>
    <strong>📍 Local:</strong> {{local_evento}}
  </div>
  
  <p style="font-size: 16px; margin-bottom: 20px;">
    <strong>Sugestão de Presente:</strong> {{sugestao_presente}}
  </p>
  
  <p style="font-size: 18px; color: #FFA07A; font-weight: bold;">
    Com carinho,<br>
    {{nome_pais}}
  </p>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-15',
    name: 'Atestado Médico (Brincadeira)',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Courier New', Courier, monospace; max-width: 650px; margin: 0 auto; padding: 40px; border: 2px solid #000; border-radius: 5px; background: #fff;">
  <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">🏥 CLÍNICA DA ZOEIRA 🏥</h1>
    <p style="margin: 5px 0 0; font-size: 14px;">Especialistas em Curas Milagrosas e Desculpas Esfarrapadas</p>
  </div>
  <h2 style="text-align: center; text-decoration: underline; margin-bottom: 40px;">ATESTADO MÉDICO</h2>
  <p style="font-size: 18px; line-height: 1.8; text-align: justify;">
    Atesto para os devidos fins que o(a) paciente <strong>{{nome_paciente}}</strong>, 
    portador(a) da síndrome crônica de <strong>{{nome_doenca_engracada}}</strong>, 
    encontra-se totalmente incapacitado(a) para realizar qualquer tipo de atividade 
    que não envolva assistir séries no sofá, comer besteiras e dormir.
  </p>
  <p style="font-size: 18px; line-height: 1.8; text-align: justify;">
    Necessita de <strong>{{dias_afastamento}}</strong> dias de repouso absoluto, 
    iniciando na data de hoje.
  </p>
  <div style="margin-top: 50px; text-align: right; font-size: 16px;">
    {{cidade}}, {{data_atestado}}
  </div>
  <div style="margin-top: 80px; text-align: center;">
    _________________________________________________________<br>
    <strong>Dr(a). {{nome_medico_falso}}</strong><br>
    CRM: {{crm_inventado}}
  </div>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-16',
    name: 'Declaração de Amor',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; text-align: center; background-color: #fff; padding: 50px; border-radius: 20px; border: 3px solid #ff4d4d; box-shadow: 0 10px 25px rgba(255, 77, 77, 0.2);">
  <div style="font-size: 40px; color: #ff4d4d; margin-bottom: 20px;">❤️</div>
  <h1 style="font-size: 32px; color: #cc0000; margin-bottom: 30px;">Declaração Oficial de Amor</h1>
  <p style="font-size: 18px; line-height: 1.8; color: #333; text-align: justify;">
    Por meio deste documento, eu, <strong>{{seu_nome}}</strong>, de pleno acordo e em posse de todas as minhas faculdades mentais (embora loucamente apaixonado/a), declaro solenemente que o meu coração pertence de forma irrevogável e exclusiva a <strong>{{nome_amado}}</strong>.
  </p>
  <p style="font-size: 18px; line-height: 1.8; color: #333; text-align: justify; margin-top: 20px;">
    Assumo o compromisso de amar, cuidar, respeitar e roubar beijos diariamente, estendendo-se por todos os dias da minha vida, com validade eterna.
  </p>
  <div style="margin-top: 50px; text-align: center; color: #666; font-style: italic;">
    Assinado e selado com amor, em {{cidade}}, no dia {{data_declaracao}}.
  </div>
  <div style="margin-top: 60px; text-align: center;">
    <span style="font-family: 'Brush Script MT', cursive; font-size: 36px; padding-bottom: 5px; border-bottom: 1px solid #ccc; display: inline-block; min-width: 250px;">{{seu_nome}}</span><br>
    <span style="font-size: 14px; color: #888; margin-top: 5px; display: inline-block;">O(A) Apaixonado(a)</span>
  </div>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-17',
    name: 'Aviso de Férias',
    type: 'documento',
    format: 'html',
    content: `<div style="font-family: 'Arial', sans-serif; max-width: 700px; margin: 0 auto; padding: 40px; border: 1px solid #dcdcdc; border-top: 15px solid #F59E0B; background-color: #FAFAFA;">
  <h1 style="text-align: center; color: #333; margin-bottom: 40px;">AVISO DE FÉRIAS</h1>
  <p style="font-size: 16px; line-height: 1.6; color: #333;">
    À<br>
    <strong>{{nome_funcionario}}</strong><br>
    Departamento: {{departamento_funcionario}}
  </p>
  <p style="font-size: 16px; line-height: 1.8; text-align: justify; margin-top: 30px;">
    Comunicamos que lhe serão concedidas as férias regulares, conforme prevê a legislação vigente, pelo período de <strong>{{quantidade_dias}}</strong> dias, correspondente ao período aquisitivo de {{periodo_aquisitivo}}.
  </p>
  <div style="background-color: #fff; padding: 20px; border: 1px solid #eee; border-left: 5px solid #F59E0B; margin: 30px 0;">
    <p style="margin: 0; font-size: 16px; line-height: 1.6;">
      <strong>Início das Férias:</strong> {{data_inicio}}<br>
      <strong>Retorno ao Trabalho:</strong> {{data_retorno}}
    </p>
  </div>
  <p style="font-size: 16px; line-height: 1.8; text-align: justify;">
    Solicitamos a sua presença no Departamento de Recursos Humanos(RH) para a devida anotação em sua Carteira de Trabalho e Previdência Social(CTPS) e assinatura dos respectivos recibos.
  </p>
  <div style="margin-top: 50px; text-align: right; font-size: 16px;">
    {{cidade}}, {{data_aviso}}
  </div>
  <div style="display: flex; justify-content: space-between; margin-top: 80px; text-align: center; font-size: 14px;">
    <div style="width: 45%;">
      _________________________________<br>
      <strong>{{nome_empresa}}</strong><br>
      A Empresa
    </div>
    <div style="width: 45%;">
      _________________________________<br>
      <strong>{{nome_funcionario}}</strong><br>
      Empregado(a)
    </div>
  </div>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function useAppStore() {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem(TEMPLATES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Template[];
      // Add any new default templates that aren't in the saved list
      const missingDefaults = defaultTemplates.filter(
        def => !parsed.some(p => p.id === def.id)
      );
      return [...parsed, ...missingDefaults];
    }
    return defaultTemplates;
  });

  const [documents, setDocuments] = useState<GeneratedDocument[]>(() => {
    const saved = localStorage.getItem(DOCS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [smtpUser, setSmtpUser] = useState<string>(() => {
    return localStorage.getItem('documestre_smtp_user') || '';
  });

  const [smtpPass, setSmtpPass] = useState<string>(() => {
    return localStorage.getItem('documestre_smtp_pass') || '';
  });

  useEffect(() => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(DOCS_KEY, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('documestre_smtp_user', smtpUser);
  }, [smtpUser]);

  useEffect(() => {
    localStorage.setItem('documestre_smtp_pass', smtpPass);
  }, [smtpPass]);

  const addTemplate = (template: Template) => {
    setTemplates((prev) => [template, ...prev]);
  };

  const updateTemplate = (id: string, updated: Partial<Template>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const saveDocument = (doc: GeneratedDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return {
    templates,
    documents,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    saveDocument,
    deleteDocument,
    smtpUser,
    setSmtpUser,
    smtpPass,
    setSmtpPass,
  };
}
