"""
Mini servidor para o Dashboard do GGDealsPriceAlert.
Serve o dashboard.html e gerencia o config.json via API REST.

Uso: python dashboard_server.py
Acesse: http://localhost:8585
"""

import http.server
import json
import os
import subprocess
import sys
import threading
import urllib.parse

PORT = 8585
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(BASE_DIR, "config.json")
DASHBOARD_FILE = os.path.join(BASE_DIR, "dashboard.html")
SCRAPER_FILE = os.path.join(BASE_DIR, "scraper.py")

# Estado global do scraper (compartilhado entre threads)
scraper_state = {
    "running": False,
    "output": "",
    "error": "",
    "finished_at": None,
    "success": None,
}


class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    """Handler customizado para servir o dashboard e a API de configuração."""

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/" or parsed.path == "/dashboard":
            self._serve_file(DASHBOARD_FILE, "text/html")

        elif parsed.path == "/api/config":
            self._serve_config()

        elif parsed.path == "/api/preview-url":
            self._serve_preview_url()

        elif parsed.path == "/api/scraper-status":
            self._serve_scraper_status()

        else:
            # Serve arquivos estáticos normalmente
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/config":
            self._save_config()
        elif parsed.path == "/api/run-scraper":
            self._run_scraper()
        else:
            self.send_error(404, "Endpoint não encontrado")

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _serve_file(self, filepath, content_type):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", f"{content_type}; charset=utf-8")
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(content.encode("utf-8"))
        except FileNotFoundError:
            self.send_error(404, f"Arquivo não encontrado: {filepath}")

    def _serve_config(self):
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                config = json.load(f)
        else:
            config = _get_default_config()

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(config, indent=2, ensure_ascii=False).encode("utf-8"))

    def _save_config(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            config = json.loads(body.decode("utf-8"))

            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._set_cors_headers()
            self.end_headers()
            response = {"status": "ok", "message": "Configuração salva com sucesso!"}
            self.wfile.write(json.dumps(response).encode("utf-8"))

        except json.JSONDecodeError as e:
            self.send_response(400)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._set_cors_headers()
            self.end_headers()
            response = {"status": "error", "message": f"JSON inválido: {e}"}
            self.wfile.write(json.dumps(response).encode("utf-8"))

    def _serve_preview_url(self):
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                config = json.load(f)
        else:
            config = _get_default_config()

        url = build_url_from_config(config)

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"url": url}).encode("utf-8"))

    def _run_scraper(self):
        """Dispara o scraper.py em background e retorna imediatamente."""
        global scraper_state

        if scraper_state["running"]:
            self.send_response(409)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._set_cors_headers()
            self.end_headers()
            resp = {"status": "error", "message": "O scraper ja esta em execucao. Aguarde."}
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        # Primeiro, salva a config atual se enviada no body
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            body = self.rfile.read(content_length)
            try:
                config = json.loads(body.decode("utf-8"))
                with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                    json.dump(config, f, indent=2, ensure_ascii=False)
            except Exception:
                pass

        # Reseta o estado
        scraper_state = {
            "running": True,
            "output": "",
            "error": "",
            "finished_at": None,
            "success": None,
        }

        # Inicia o scraper em uma thread separada
        thread = threading.Thread(target=_execute_scraper, daemon=True)
        thread.start()

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._set_cors_headers()
        self.end_headers()
        resp = {"status": "ok", "message": "Scraper iniciado! Acompanhe o progresso."}
        self.wfile.write(json.dumps(resp).encode("utf-8"))

    def _serve_scraper_status(self):
        """Retorna o estado atual do scraper."""
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(scraper_state, default=str).encode("utf-8"))

    def log_message(self, format, *args):
        """Override para log mais limpo."""
        print(f"[Dashboard] {args[0]}")


def _execute_scraper():
    """Executa o scraper.py como subprocesso e captura a saída."""
    global scraper_state
    import datetime

    try:
        _safe_print("[Scraper] Iniciando execucao do scraper...")
        env = {**os.environ, "GITHUB_ACTIONS": "true", "PYTHONIOENCODING": "utf-8"}
        process = subprocess.Popen(
            [sys.executable, "-u", SCRAPER_FILE],  # -u = unbuffered output
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=BASE_DIR,
            env=env,
        )

        output_lines = []
        for raw_line in process.stdout:
            line = raw_line.decode("utf-8", errors="replace").rstrip()
            output_lines.append(line)
            scraper_state["output"] = "\n".join(output_lines[-50:])  # Últimas 50 linhas
            _safe_print(f"[Scraper] {line}")

        process.wait()

        scraper_state["running"] = False
        scraper_state["finished_at"] = datetime.datetime.now().isoformat()
        scraper_state["success"] = process.returncode == 0

        if process.returncode == 0:
            _safe_print("[Scraper] Execucao finalizada com sucesso!")
        else:
            scraper_state["error"] = f"Processo finalizou com codigo {process.returncode}"
            _safe_print(f"[Scraper] Finalizou com erro (codigo {process.returncode})")

    except Exception as e:
        scraper_state["running"] = False
        scraper_state["error"] = str(e)
        scraper_state["success"] = False
        _safe_print(f"[Scraper] Erro: {e}")


def _safe_print(msg):
    """Print seguro que não quebra no Windows com cp1252."""
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode("ascii", errors="replace").decode("ascii"))


def _get_default_config():
    return {
        "platform_family": "pc",
        "preset": "",
        "filters": {
            "minRating": 5,
            "maxPrice": 10,
            "drm": [1],
            "sort": "date",
        },
        "email": {"receiver": ""},
        "scraper": {"check_interval_hours": 24, "time_window_hours": 24},
    }


def build_url_from_config(config):
    """Monta a URL do gg.deals a partir da configuração."""
    platform = config.get("platform_family", "")
    preset = config.get("preset", "")
    filters = config.get("filters", {})

    # Monta o path base
    path_parts = ["https://gg.deals/deals"]
    if platform:
        path_parts.append(platform)
    if preset:
        path_parts.append(preset)

    base_url = "/".join(path_parts) + "/"

    # Monta os query params
    params = {}
    simple_params = [
        "minRating", "maxRating", "minPrice", "maxPrice",
        "minDiscount", "maxDiscount", "dealsDate", "dealsExpiryDate",
        "releaseDate", "steamReviews", "opencriticRating",
        "minMetascore", "maxMetascore", "minUserscore", "maxUserscore",
        "minOpencriticAverage", "maxOpencriticAverage",
        "minOpencriticRecommend", "maxOpencriticRecommend",
        "minSteamReviewsCount", "maxSteamReviewsCount",
        "minHltbCompletionMain", "maxHltbCompletionMain",
        "minHltbCompletionPlus", "maxHltbCompletionPlus",
        "minHltbCompletion100", "maxHltbCompletion100",
        "minHltbCompletionAll", "maxHltbCompletionAll",
        "wishlistsRank", "alertsRank", "collectionsRank",
        "wishlisted", "alerted", "owned", "ignored", "sort",
    ]

    for param in simple_params:
        val = filters.get(param)
        if val is not None and val != "" and val != "date" if param == "sort" else val is not None and val != "":
            params[param] = val

    # Sort: "date" é o default, não incluir na URL
    if filters.get("sort") and filters["sort"] != "date":
        params["sort"] = filters["sort"]
    elif "sort" in params:
        del params["sort"]

    # Boolean param
    if filters.get("onlyHistoricalLow"):
        params["onlyHistoricalLow"] = 1

    # List params (comma-separated IDs)
    list_params = ["store", "drm", "platform", "genre", "subscription"]
    for param in list_params:
        val = filters.get(param, [])
        if val:
            params[param] = ",".join(str(v) for v in val)

    if params:
        query = urllib.parse.urlencode(params)
        return f"{base_url}?{query}"

    return base_url


def main():
    # ThreadingHTTPServer permite requisições concorrentes
    # (necessário para polling de status enquanto o scraper roda)
    server_class = http.server.ThreadingHTTPServer
    handler = DashboardHandler
    with server_class(("", PORT), handler) as httpd:
        print(f"\n{'='*60}")
        print(f"  [GGDeals] Price Alert Dashboard")
        print(f"  Acesse: http://localhost:{PORT}")
        print(f"  Config: {CONFIG_FILE}")
        print(f"{'='*60}\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")


if __name__ == "__main__":
    main()
