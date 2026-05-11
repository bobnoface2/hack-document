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
