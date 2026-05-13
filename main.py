import os
import sys
import json
import sqlite3
import smtplib
import threading
import io
import urllib.request
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4

# Tenta importar o webview para criar a janela do desktop estilo aplicativo
try:
    import webview
except ImportError:
    webview = None

def get_base_path():
    """ Retorna o caminho base do app, lidando com o empacotamento do PyInstaller """
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

# Banco de dados centralizado na pasta do usuário para persistência
DB_FILE = os.path.join(os.path.expanduser("~"), "HackDocumentPro_Data.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('CREATE TABLE IF NOT EXISTS store (key TEXT PRIMARY KEY, value TEXT)')
    c.execute('CREATE TABLE IF NOT EXISTS sent_logs (id TEXT PRIMARY KEY, to_email TEXT, subject TEXT, timestamp TEXT, status TEXT)')
    conn.commit()
    conn.close()

def db_get(key):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT value FROM store WHERE key = ?', (key,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else None

def db_set(key, value):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)', (key, value))
    conn.commit()
    conn.close()

def add_sent_log(to_email, subject, status):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    log_id = str(int(datetime.now().timestamp() * 1000))
    ts = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    c.execute('INSERT INTO sent_logs (id, to_email, subject, timestamp, status) VALUES (?, ?, ?, ?, ?)', 
              (log_id, to_email, subject, ts, status))
    conn.commit()
    conn.close()

app = Flask(__name__, static_folder=None)
CORS(app)

@app.route('/api/store', methods=['GET', 'POST'])
def api_store():
    if request.method == 'POST':
        data = request.json
        db_set(data.get('key'), data.get('value'))
        return jsonify({"success": True})
    return jsonify({"value": db_get(request.args.get('key', ''))})

@app.route('/api/ai/refine', methods=['POST'])
def ai_refine():
    data = request.json
    try:
        full_prompt = f"{data.get('prompt')}\n\nAplique isso ao texto:\n\n{data.get('content')}"
        req = urllib.request.Request(
            'http://127.0.0.1:11434/api/generate',
            data=json.dumps({"model": "llama3", "prompt": full_prompt, "stream": False}).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return jsonify({"refinedContent": result.get("response", "")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/export/pdf', methods=['POST'])
def export_pdf():
    data = request.json
    content = data.get('content', '').replace('\n', '<br/>')
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    doc.build([Paragraph(content, getSampleStyleSheet()["Normal"])])
    pdf_value = buffer.getvalue()
    buffer.close()
    response = make_response(pdf_value)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename={data.get("filename", "doc.pdf")}'
    return response

@app.route('/api/send-email', methods=['POST'])
def send_email():
    data = request.json
    try:
        msg = MIMEMultipart()
        msg['From'] = f"HackDocument <{data.get('smtpUser')}>"
        msg['To'] = data.get('to')
        msg['Subject'] = data.get('subject')
        msg.attach(MIMEText(data.get('html'), 'html'))
        host = "smtp.mail.yahoo.com"
        if "gmail" in data.get('smtpUser').lower(): host = "smtp.gmail.com"
        elif "outlook" in data.get('smtpUser').lower() or "hotmail" in data.get('smtpUser').lower(): host = "smtp.office365.com"
        server = smtplib.SMTP_SSL(host, 465)
        server.login(data.get('smtpUser'), data.get('smtpPass'))
        server.send_message(msg)
        server.quit()
        add_sent_log(data.get('to'), data.get('subject'), "Sucesso")
        return jsonify({"success": True})
    except Exception as e:
        add_sent_log(data.get('to'), data.get('subject'), f"Erro: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/logs', methods=['GET'])
def get_logs():
    conn = sqlite3.connect(DB_FILE)
    rows = conn.execute('SELECT * FROM sent_logs ORDER BY id DESC LIMIT 100').fetchall()
    conn.close()
    return jsonify([{"id": r[0], "to": r[1], "subject": r[2], "timestamp": r[3], "status": r[4]} for r in rows])

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    base_path = get_base_path()
    # Serve o ícone se solicitado como favicon ou logo
    if path == "imagem.ico":
        if os.path.exists(os.path.join(base_path, 'imagem.ico')):
            return send_from_directory(base_path, 'imagem.ico')
    dist_folder = os.path.join(base_path, 'dist')
    if path != "" and os.path.exists(os.path.join(dist_folder, path)):
        return send_from_directory(dist_folder, path)
    return send_from_directory(dist_folder, 'index.html')

def run_flask():
    # Roda o Flask localmente
    app.run(host='127.0.0.1', port=3000, debug=False)

if __name__ == '__main__':
    init_db()
    base_path = get_base_path()
    
    # Thread para o servidor Flask não travar a UI
    server_thread = threading.Thread(target=run_flask, daemon=True)
    server_thread.start()
    
    # Inicia a interface gráfica com PyWebView (Desktop Mode)
    if webview:
        icon_path = os.path.join(base_path, 'imagem.ico')
        window = webview.create_window('Hack Document PRO', 'http://127.0.0.1:3000', width=1280, height=800)
        
        # Inicia com o ícone se disponível
        if os.path.exists(icon_path):
            try:
                webview.start(icon=icon_path)
            except:
                webview.start()
        else:
            webview.start()
    else:
        # Fallback caso não tenha webview instalado
        import webbrowser
        webbrowser.open('http://127.0.0.1:3000')
        server_thread.join()
