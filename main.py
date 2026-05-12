import os
import sys
import json
import sqlite3
import smtplib
import threading
import base64
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
# Removed genai
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io

try:
    import webview
except ImportError:
    webview = None

def get_base_path():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

# Banco de dados centralizado
DB_FILE = os.path.join(os.path.expanduser("~"), "HackDocumentProV3.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # Tabela genérica de store
    c.execute('''CREATE TABLE IF NOT EXISTS store (
                    key TEXT PRIMARY KEY,
                    value TEXT
                 )''')
    # Tabela de logs de envio
    c.execute('''CREATE TABLE IF NOT EXISTS sent_logs (
                    id TEXT PRIMARY KEY,
                    to_email TEXT,
                    subject TEXT,
                    timestamp TEXT,
                    status TEXT
                 )''')
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
    else:
        key = request.args.get('key', '')
        return jsonify({"value": db_get(key)})

import urllib.request

@app.route('/api/ai/refine', methods=['POST'])
def ai_refine():
    data = request.json
    prompt = data.get('prompt')
    content = data.get('content')
    
    try:
        full_prompt = f"{prompt}\n\nAplique isso ao seguinte texto (retorne apenas o texto modificado):\n\n{content}"
        
        req = urllib.request.Request(
            'http://127.0.0.1:11434/api/generate',
            data=json.dumps({
                "model": "llama3",
                "prompt": full_prompt,
                "stream": False
            }).encode('utf-8'),
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
    content = data.get('content', '')
    filename = data.get('filename', 'documento.pdf')
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    
    # Converter quebras de linha em <br/>
    clean_content = content.replace('\n', '<br/>')
    
    story = []
    story.append(Paragraph(clean_content, styles["Normal"]))
    doc.build(story)
    
    pdf_value = buffer.getvalue()
    buffer.close()
    
    response = make_response(pdf_value)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename={filename}'
    return response

@app.route('/api/send-email', methods=['POST'])
def send_email():
    data = request.json
    smtp_user = data.get('smtpUser')
    smtp_pass = data.get('smtpPass')
    to_email = data.get('to')
    subject = data.get('subject')
    html_content = data.get('html')

    if not smtp_user or not smtp_pass:
        return jsonify({"error": "Faltam credenciais SMTP"}), 400

    try:
        msg = MIMEMultipart()
        msg['From'] = f"DocuMestre Pro <{smtp_user}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        host = "smtp.mail.yahoo.com"
        if "gmail" in smtp_user.lower(): host = "smtp.gmail.com"
        elif "outlook" in smtp_user.lower() or "hotmail" in smtp_user.lower(): host = "smtp.office365.com"

        server = smtplib.SMTP_SSL(host, 465)
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        
        add_sent_log(to_email, subject, "Sucesso")
        return jsonify({"success": True})
    except Exception as e:
        add_sent_log(to_email, subject, f"Erro: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/logs', methods=['GET'])
def get_logs():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT * FROM sent_logs ORDER BY id DESC LIMIT 100')
    rows = c.fetchall()
    conn.close()
    
    logs = []
    for r in rows:
        logs.append({
            "id": r[0],
            "to": r[1],
            "subject": r[2],
            "timestamp": r[3],
            "status": r[4]
        })
    return jsonify(logs)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    base_path = get_base_path()
    dist_folder = os.path.join(base_path, 'dist')
    
    if path != "" and os.path.exists(os.path.join(dist_folder, path)):
        return send_from_directory(dist_folder, path)
    else:
        return send_from_directory(dist_folder, 'index.html')

def start_server():
    # Porta 3000 é obrigatoria no ambiente do preview
    app.run(host='0.0.0.0', port=3000, debug=False)

if __name__ == '__main__':
    init_db()
    base_path = get_base_path()
    dist_folder = os.path.join(base_path, 'dist')
    
    if not os.path.exists(dist_folder):
        os.makedirs(dist_folder, exist_ok=True)
        with open(os.path.join(dist_folder, 'index.html'), 'w') as f:
            f.write("<h1>Interface sendo preparada... Recompile o projeto.</h1>")

    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    
    if webview:
        webview.create_window('Hack Document Pro', 'http://127.0.0.1:3000', width=1300, height=850)
        webview.start()
    else:
        print("Webview não disponível, rodando apenas como servidor em http://0.0.0.0:3000")
        t.join()
