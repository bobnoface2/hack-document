import os
import sys
import json
import base64
import threading
from urllib.request import urlopen
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types

# Para o auto-py-to-exe injetar os caminhos dos assets corretamente
def get_resource_path(relative_path):
    try:
        # PyInstaller cria uma pasta temporaria e guarda em _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

cwd = os.getcwd()
DB_FILE = os.path.join(cwd, "HackDocumentPRO_Data.json")
TEMPLATES_DIR = os.path.join(cwd, "templates")

app = Flask(__name__, static_folder=get_resource_path("dist"))
CORS(app)

def init_db():
    if not os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'w', encoding='utf-8') as f:
                json.dump({"store": {}, "logs": []}, f, indent=2)
        except Exception as e:
            print("Erro ao criar DB:", e)

    if not os.path.exists(TEMPLATES_DIR):
        os.makedirs(TEMPLATES_DIR, exist_ok=True)

init_db()

def get_db():
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {"store": {}}

def save_db(data):
    try:
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print("Erro salvando DB:", e)

def get_gemini_client():
    db = get_db()
    key = db.get("store", {}).get("documestre_gemini_key", "")
    if not key:
        key = os.environ.get("GEMINI_API_KEY", "")
    if not key:
        raise Exception("GEMINI_API_KEY não configurada nas Preferências.")
    return genai.Client(api_key=key)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/imagem.ico')
def serve_icon():
    return send_from_directory(cwd, 'imagem.ico')

@app.route('/api/store', methods=['POST', 'GET'])
def api_store():
    if request.method == 'POST':
        data = request.json
        key = data.get('key')
        value = data.get('value')
        db = get_db()
        db['store'][key] = value
        save_db(db)
        return jsonify({"success": True})
    else:
        key = request.args.get('key')
        db = get_db()
        return jsonify({"value": db.get('store', {}).get(key)})

@app.route('/api/templates', methods=['GET', 'POST'])
def handle_templates():
    if request.method == 'GET':
        os.makedirs(TEMPLATES_DIR, exist_ok=True)
        files = [f for f in os.listdir(TEMPLATES_DIR) if f.endswith('.json')]
        templates_list = []
        for filename in files:
            try:
                with open(os.path.join(TEMPLATES_DIR, filename), 'r', encoding='utf-8') as f:
                    templates_list.append(json.load(f))
            except:
                pass
        return jsonify(templates_list)
    else:
        template = request.json
        if not template.get('id'):
            return jsonify({"error": "ID inválido"}), 400
        os.makedirs(TEMPLATES_DIR, exist_ok=True)
        with open(os.path.join(TEMPLATES_DIR, f"{template['id']}.json"), 'w', encoding='utf-8') as f:
            json.dump(template, f, indent=2)
        return jsonify({"success": True, "template": template})

@app.route('/api/templates/<tid>', methods=['DELETE'])
def delete_template(tid):
    try:
        os.remove(os.path.join(TEMPLATES_DIR, f"{tid}.json"))
        return jsonify({"success": True})
    except FileNotFoundError:
        return jsonify({"error": "Not found"}), 404

@app.route('/api/ai/batch-parse', methods=['POST'])
def batch_parse():
    try:
        data = request.json
        text = data.get("text")
        variables = data.get("variables", [])
        client = get_gemini_client()
        
        prompt = f"""ATUE COMO UM EXTRATOR DE DADOS ESTRUTURADOS.
O usuário enviou os seguintes dados (pode ser texto solto, lista ou tabular delimitado):
{text}
Para CADA registro, extraia as chaves: {', '.join(variables)}. 
Se vazio, deixe "".
Retorne estritamente um array JSON de objetos válidos."""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return jsonify({"success": True, "records": json.loads(response.text)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        prompt = data.get("prompt")
        client = get_gemini_client()
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=f'Crie um template HTML p/ "{prompt}" com tailwind e cabendo numa A4. Variaveis com chaves: {{{{vars}}}}',
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "name": {"type": "STRING"},
                        "content": {"type": "STRING"}
                    },
                    "required": ["name", "content"]
                }
            )
        )
        return jsonify({"success": True, **json.loads(response.text)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/spellcheck', methods=['POST'])
def spellcheck():
    try:
        data = request.json
        content = data.get("content")
        client = get_gemini_client()
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=f'Corrija ortografia (preserve tags HTML e vars): {content}',
            config=types.GenerateContentConfig(system_instruction="Você é um revisor especialista.")
        )
        return jsonify({"success": True, "result": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/spacing', methods=['POST'])
def spacing():
    try:
        data = request.json
        content = data.get("content")
        client = get_gemini_client()
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=f'Corrija espaços e margins de tailwind: {content}',
            config=types.GenerateContentConfig(system_instruction="Você é um revisor de UI.")
        )
        return jsonify({"success": True, "result": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/templatize', methods=['POST'])
def templatize():
    try:
        data = request.json
        content = data.get("content")
        client = get_gemini_client()
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=f'Troque dados por {{variaveis}} e preserve a exata estrutura do HTML Tailwind: {content}'
        )
        return jsonify({"success": True, "result": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/reproduce', methods=['POST'])
def reproduce():
    try:
        data = request.json
        base64_data = data.get("base64Data")
        mime = data.get("mimeType")
        
        # Strip potential data URI padding if present
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
            
        raw_bytes = base64.b64decode(base64_data)
        
        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=[
                "Clone a imagem HTML Tailwind perfeitamente",
                types.Part.from_bytes(data=raw_bytes, mime_type=mime)
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "name": {"type": "STRING"},
                        "content": {"type": "STRING"}
                    },
                    "required": ["name", "content"]
                }
            )
        )
        return jsonify({"success": True, **json.loads(response.text)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def run_server():
    app.run(port=3000, debug=False, use_reloader=False)

if __name__ == '__main__':
    try:
        import webview
        t = threading.Thread(target=run_server)
        t.daemon = True
        t.start()
        webview.create_window('Hack Document', 'http://localhost:3000', width=1280, height=800)
        webview.start()
    except ImportError:
        print("Módulo 'pywebview' não encontrado. Rodando em modo CLI. Acesse http://localhost:3000")
        run_server()
