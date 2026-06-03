#!/usr/bin/env bash
# Prepara y sirve el preview desde /tmp para el MCP Claude Preview.
# Necesario porque este proyecto vive bajo .claude/worktrees/ y el sandbox del MCP prohíbe
# getcwd() ahí (un `python -m http.server` normal peta con PermissionError). Servimos una copia
# desde /tmp con un handler que usa directory= absoluto (no llama getcwd).
set -e
HERE="$(cd "$(dirname "$0")/.." && pwd)"
WWW="/tmp/mapa_deals_www"
mkdir -p "$WWW"

cat > "$WWW/serve.py" << 'PY'
import http.server, socketserver, functools
D = "/tmp/mapa_deals_www"
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()
HH = functools.partial(H, directory=D)
with socketserver.TCPServer(("127.0.0.1", 5052), HH) as httpd:
    print("preview en http://127.0.0.1:5052/")
    httpd.serve_forever()
PY

npm --prefix "$HERE" run preview:build
cp "$HERE/preview/index.html" "$HERE/preview/preview.bundle.js" "$WWW/"
echo "✓ /tmp listo. Arranca el server 'mapa-deals-preview' (puerto 5052) con el MCP Claude Preview."
echo "  Tras cada cambio: re-ejecuta este script y recarga el preview (location.reload)."
