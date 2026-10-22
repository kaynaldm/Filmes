import http.server
import socketserver
import urllib.parse
import json
import os
import re
import sys
import webbrowser

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, "WEB_PORTAL")
M3U_FILE = os.path.join(BASE_DIR, "Filmes-Series.m3u8")

search_index = []

def carregar_indice():
    global search_index
    print("Carregando índice em memória de 316.354 títulos para busca instantânea...")
    if not os.path.exists(M3U_FILE):
        print(f"Aviso: {M3U_FILE} não encontrado.")
        return

    count = 0
    current_inf = None
    with open(M3U_FILE, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.startswith("#EXTINF:"):
                current_inf = line
            elif line.startswith("#"):
                continue
            elif current_inf:
                url = line
                m_group = re.search(r'group-title="([^"]*)"', current_inf)
                grp = m_group.group(1) if m_group else "Geral"
                
                m_name = re.search(r'tvg-name="([^"]*)"', current_inf)
                if m_name and m_name.group(1):
                    name = m_name.group(1)
                else:
                    name = current_inf.split(",")[-1].strip() if "," in current_inf else "Sem Título"
                
                m_logo = re.search(r'tvg-logo="([^"]*)"', current_inf)
                logo = m_logo.group(1) if m_logo else ""

                search_index.append({
                    "t": name,
                    "catNome": grp,
                    "p": logo,
                    "u": url,
                    "s": name.lower()
                })
                current_inf = None
                count += 1

    print(f"Índice carregado com sucesso: {count:,} títulos prontos para busca instantânea (<5ms)!")

class CineStreamHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Endpoint de busca instantânea: /api/search?q=nome
        if path == "/api/search":
            query_params = urllib.parse.parse_qs(parsed.query)
            q = query_params.get("q", [""])[0].strip().lower()
            limit = int(query_params.get("limit", ["80"])[0])

            if not q:
                results = []
            else:
                terms = q.split()
                results = []
                for item in search_index:
                    title_lower = item["s"]
                    if all(t in title_lower for t in terms):
                        results.append({
                            "t": item["t"],
                            "catNome": item["catNome"],
                            "p": item["p"],
                            "u": item["u"]
                        })
                        if len(results) >= limit:
                            break

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(results, ensure_ascii=False).encode("utf-8"))
            return

        # Rota para acessar arquivos de CANAIS_ORGANIZADOS diretamente
        if path.startswith("/CANAIS_ORGANIZADOS/"):
            rel_path = path[len("/CANAIS_ORGANIZADOS/"):]
            file_path = os.path.join(BASE_DIR, "CANAIS_ORGANIZADOS", urllib.parse.unquote(rel_path))
            if os.path.exists(file_path) and os.path.isfile(file_path):
                self.send_response(200)
                if file_path.endswith(".m3u8"):
                    self.send_header("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8")
                    self.send_header("Content-Disposition", f'attachment; filename="{os.path.basename(file_path)}"')
                elif file_path.endswith(".json"):
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                elif file_path.endswith(".csv"):
                    self.send_header("Content-Type", "text/csv; charset=utf-8")
                else:
                    self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
                return

        return super().do_GET()

def main():
    carregar_indice()
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), CineStreamHandler) as httpd:
            url = f"http://localhost:{PORT}"
            print("=" * 65)
            print("       CINESTREAM BR - PORTAL DO CANAL DE FILMES E SÉRIES")
            print("=" * 65)
            print(f"\n[+] Servidor ativo em: {url}")
            print(f"[+] Total de títulos no catálogo: {len(search_index):,}")
            print("\nPressione Ctrl+C para encerrar o servidor.\n")
            
            try:
                webbrowser.open(url)
            except Exception:
                pass
                
            httpd.serve_forever()
    except OSError as e:
        print(f"Porta {PORT} ocupada, tentando porta {PORT + 1}...")
        with socketserver.TCPServer(("", PORT + 1), CineStreamHandler) as httpd:
            url = f"http://localhost:{PORT + 1}"
            print(f"[+] Servidor ativo em: {url}")
            try:
                webbrowser.open(url)
            except Exception:
                pass
            httpd.serve_forever()

if __name__ == "__main__":
    main()
