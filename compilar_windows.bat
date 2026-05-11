@echo off
echo =======================================
echo Compilador - Hack Document
echo =======================================

echo.
echo 1) Instalando dependencias do Node.js...
call npm install

echo.
echo 2) Compilando a interface React (gerando pasta dist)...
call npm run build

echo.
echo 3) O ambiente virtual Python (Crie e ative um se não tiver, antes de usar isso).
echo Instalando dependencias do Python...
pip install -r requirements.txt

echo.
echo 4) Gerando o executavel (isso pode demorar varios segundos/minutos)...
:: O pyinstaller empacota tudo em um único .exe escondendo a janela do console (--noconsole)
:: e inclui (--add-data) a pasta dist gerada pelo React no executável
pyinstaller --noconfirm --onedir --windowed --add-data "dist;dist" --icon "public/imagem.ico"  --name "Hack Document" main.py

echo.
echo =======================================
echo CONCLUIDO! 
echo O seu executavel estara dentro da pasta "dist/Hack Document/Hack Document.exe"
echo =======================================
pause
