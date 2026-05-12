import os
import sys
import json
import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify, send_from_directory
import threading

try:
    import webview
except ImportError:
    print("Biblioteca 'pywebview' não está instalada.")
    print("Instale com: pip install pywebview")
    sys.exit(1)

def get_base_path():
    """Retorna o caminho base correto, seja rodando do script ou do executável compilado"""
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

DB_FILE = os.path.join(os.path.expanduser("~"), "HackDocumentData.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS store (
                    key TEXT PRIMARY KEY,
                    value TEXT
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

app = Flask(__name__, static_folder=None)

@app.route('/api/store', methods=['GET', 'POST'])
def api_store():
    if request.method == 'POST':
        data = request.json
        db_set(data.get('key'), data.get('value'))
        return jsonify({"success": True})
    else:
        key = request.args.get('key', '')
        return jsonify({"value": db_get(key)})

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
        msg['From'] = f"Hack Document <{smtp_user}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        server = smtplib.SMTP_SSL("smtp.mail.yahoo.com", 465)
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    app.run(host='127.0.0.1', port=13374, debug=False)

if __name__ == '__main__':
    init_db()

    base_path = get_base_path()
    dist_folder = os.path.join(base_path, 'dist')
    
    if not os.path.exists(dist_folder):
        print(f"Pasta 'dist' não encontrada em {base_path}!")
        print("Certifique-se de que a pasta 'dist' foi gerada (npm run build) e incluida no auto-py-to-exe.")
        sys.exit(1)

    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    
    webview.create_window('Hack Document', 'http://127.0.0.1:13374', width=1280, height=800)
    webview.start()
