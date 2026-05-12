import os
import sys
import threading
import http.server
import socketserver
import json
import sqlite3

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

def start_server(port, folder):
    """Inicia um servidor HTTP local simples apontando para a pasta web"""
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=folder, **kwargs)
        
        def do_GET(self):
            if self.path.startswith('/api/store'):
                from urllib.parse import urlparse, parse_qs
                query = parse_qs(urlparse(self.path).query)
                key = query.get('key', [''])[0]
                val = db_get(key)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"value": val}).encode('utf-8'))
                return
            super().do_GET()

        def do_POST(self):
            if self.path == '/api/store':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                key = data.get('key')
                value = data.get('value')
                db_set(key, value)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
                return
            
            if self.path == '/api/send-email':
                import json
                import smtplib
                from email.mime.text import MIMEText
                from email.mime.multipart import MIMEMultipart

                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))

                to_email = data.get('to')
                subject = data.get('subject')
                html_content = data.get('html')
                req_smtp_user = data.get('smtpUser')
                req_smtp_pass = data.get('smtpPass')

                # Configurações do Yahoo
                smtp_user = req_smtp_user
                smtp_pass = req_smtp_pass
                smtp_host = "smtp.mail.yahoo.com"
                smtp_port = 465

                if not smtp_user or not smtp_pass:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Faltam credenciais SMTP"}).encode('utf-8'))
                    return

                try:
                    msg = MIMEMultipart()
                    msg['From'] = f"Hack Document <{smtp_user}>"
                    msg['To'] = to_email
                    msg['Subject'] = subject
                    msg.attach(MIMEText(html_content, 'html'))

                    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                        server.login(smtp_user, smtp_pass)
                        server.send_message(msg)

                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
                except Exception as e:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            else:
                super().do_POST()

        def log_message(self, format, *args):
            pass # Evita spam no console

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), Handler) as httpd:
        httpd.serve_forever()

if __name__ == '__main__':
    PORT = 13374 # Uma porta qualquer para não conflitar
    
    init_db()

    base_path = get_base_path()
    dist_folder = os.path.join(base_path, 'dist')
    
    if not os.path.exists(dist_folder):
        print(f"Pasta 'dist' não encontrada em {base_path}!")
        print("Você precisa primeiro gerar os arquivos do site executando 'npm run build'")
        print("E no auto-py-to-exe, você precisa incluir a pasta 'dist' inteira.")
        sys.exit(1)
        
    server_thread = threading.Thread(target=start_server, args=(PORT, dist_folder), daemon=True)
    server_thread.start()
    
    webview.create_window('Hack Document', f'http://localhost:{PORT}', width=1280, height=800)
    webview.start()
