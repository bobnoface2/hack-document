import os
import sys
import threading
import http.server
import socketserver

try:
    import webview
except ImportError:
    print("Biblioteca 'pywebview' não está instalada.")
    print("Instale com: pip install pywebview")
    sys.exit(1)

def get_base_path():
    """Retorna o caminho base correto, seja rodando do script ou do executável compilado"""
    if getattr(sys, 'frozen', False):
        # Se for empacotado pelo PyInstaller / auto-py-to-exe
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

def start_server(port, folder):
    """Inicia um servidor HTTP local simples apontando para a pasta web"""
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=folder, **kwargs)
        
        def do_POST(self):
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
