#!/usr/bin/env python3
"""
Simple HTTP server to serve the Kiwi Farm game
"""
import http.server
import socketserver
import webbrowser
import os
import sys

# Change to the game directory
game_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(game_dir)

PORT = 8000
HOST = "localhost"

class GameHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve the game files"""
    
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.end_headers()

def start_server():
    """Start the development server"""
    try:
        with socketserver.TCPServer((HOST, PORT), GameHTTPRequestHandler) as httpd:
            print(f"\n🎮 Kiwi Farm Game Server Starting...")
            print(f"📍 Server running at: http://{HOST}:{PORT}")
            print(f"📂 Serving files from: {game_dir}")
            print(f"🌐 Game URL: http://{HOST}:{PORT}/index.html")
            print(f"\n✨ Features added:")
            print(f"   📊 Real-time Performance Monitor")
            print(f"   🎨 Dynamic Background Graphics")
            print(f"   📈 Live Performance Plots")
            print(f"   🌅 Day/Night Cycle")
            print(f"   ☁️ Animated Weather Effects")
            print(f"\n💡 Press Ctrl+C to stop the server")
            
            # Try to open the browser automatically
            try:
                webbrowser.open(f"http://{HOST}:{PORT}/index.html")
                print(f"🚀 Opening game in your default browser...")
            except Exception as e:
                print(f"⚠️  Could not auto-open browser: {e}")
                print(f"📖 Please manually open: http://{HOST}:{PORT}/index.html")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Port {PORT} is already in use!")
            print(f"💡 Try closing other applications or use a different port")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()