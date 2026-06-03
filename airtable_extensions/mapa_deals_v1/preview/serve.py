#!/usr/bin/env python3
"""Servidor del preview con no-cache (para que recargar siempre traiga el último build)."""
import http.server
import socketserver
import os

PORT = 5051
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


os.chdir(ROOT)
with socketserver.TCPServer(("127.0.0.1", PORT), NoCacheHandler) as httpd:
    print(f"Preview en http://127.0.0.1:{PORT}/preview/  (no-cache)")
    httpd.serve_forever()
