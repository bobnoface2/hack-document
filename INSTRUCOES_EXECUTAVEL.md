# Como compilar o "Hack Document" para Windows (auto-py-to-exe)

Este projeto foi preparado para que você possa gerar facilmente um arquivo executável (`.exe`) para Windows, permitindo o uso nativo do aplicativo sem a necessidade de abrir o navegador.

## 🛠️ Pré-requisitos
1. No seu computador Windows, você precisará ter o **Python** e o **Node.js** instalados.
2. Certifique-se de que os pacotes do Node estão instalados:
   ```bash
   npm install
   ```

## 📦 Passo 1: Construir o App Web
Antes de empacotar em Python, precisamos gerar os arquivos de produção do programa:
Execute no terminal da pasta do projeto:
```bash
npm run build
```
*(Isso vai criar uma pasta chamada `dist` com todos os arquivos prontos do sistema, html, js, etc)*

## 🐍 Passo 2: Preparar o Python
Abra seu terminal Python e instale o `pywebview` (usado para criar a janela do Desktop) e o `auto-py-to-exe`:
```bash
pip install pywebview
pip install auto-py-to-exe
```

## 🚀 Passo 3: Executando o Auto Py to Exe
1. No seu terminal, abra a interface do Auto Py to Exe executando:
   ```bash
   auto-py-to-exe
   ```
2. A interface gráfica do Auto Py to Exe vai se abrir no seu navegador.
3. **Script Location:** Selecione o arquivo `main.py` que está na raiz deste projeto.
4. **Onefile:** (Recomendado) Marque a opção `One Directory` ou `One File` caso queira um unico `.exe`.
5. **Console Window:** Marque `Window Based (hide the console)` para não aparecer a tela preta do cmd de fundo.
6. **Icon:** (Opcional) Escolha um arquivo `.ico` caso queira dar um ícone ao seu executável.
7. **Additional Files (MUITO IMPORTANTE!):** 
   - Clique em "Add Folder"
   - Selecione a pasta `dist` que foi gerada no passo 1.
8. **Pronto!** Clique no grande botão azul `CONVERT .PY TO .EXE`.

Seu aplicativo agora rodará de forma nativa e offline no Windows usando a tecnologia web embutida!
