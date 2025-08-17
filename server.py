#!/usr/bin/env python3
import http.server
import socketserver
import os

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

PORT = 8002
Handler = NoCacheHTTPRequestHandler

print(f"Starting server at http://localhost:{PORT}")
print("No cache headers enabled - forcing fresh file loads")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()