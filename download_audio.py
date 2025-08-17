#!/usr/bin/env python3
"""
Download free audio samples for the Kiwi Farm game.
This script downloads CC0 and royalty-free audio files.
"""

import os
import urllib.request
import json
from pathlib import Path

# Create audio directories
audio_dir = Path("src/assets/audio")
sfx_dir = audio_dir / "sfx"
music_dir = audio_dir / "music"

sfx_dir.mkdir(parents=True, exist_ok=True)
music_dir.mkdir(parents=True, exist_ok=True)

def download_file(url, filename, description=""):
    """Download a file with progress indicator"""
    try:
        print(f"Downloading {description or filename}...")
        urllib.request.urlretrieve(url, filename)
        print(f"✓ Downloaded: {filename}")
        return True
    except Exception as e:
        print(f"✗ Failed to download {filename}: {e}")
        return False

def create_placeholder_sounds():
    """Create simple beep sounds as placeholders using basic web audio"""
    placeholder_info = {
        "cow-moo.mp3": "Cow mooing sound",
        "cow-moo-2.mp3": "Alternative cow moo",
        "ui-click.mp3": "Button click sound",
        "ui-hover.mp3": "Hover effect sound",
        "success.mp3": "Success notification",
        "error.mp3": "Error notification",
        "rain.mp3": "Rain ambient sound",
        "wind.mp3": "Wind effect",
        "birds.mp3": "Bird chirping"
    }
    
    # Create placeholder text files with instructions
    for filename, description in placeholder_info.items():
        placeholder_file = sfx_dir / f"{filename.replace('.mp3', '_placeholder.txt')}"
        with open(placeholder_file, 'w') as f:
            f.write(f"Placeholder for: {description}\n")
            f.write(f"Download a free {description.lower()} and rename to: {filename}\n")
            f.write(f"Sources: freesound.org, pixabay.com, mixkit.co\n")

    music_placeholders = {
        "main-theme.mp3": "Main theme music",
        "peaceful-farm.mp3": "Peaceful farm ambiance",
        "menu-theme.mp3": "Menu background music"
    }
    
    for filename, description in music_placeholders.items():
        placeholder_file = music_dir / f"{filename.replace('.mp3', '_placeholder.txt')}"
        with open(placeholder_file, 'w') as f:
            f.write(f"Placeholder for: {description}\n")
            f.write(f"Download a free {description.lower()} and rename to: {filename}\n")
            f.write(f"Sources: incompetech.com, opengameart.org, freesound.org\n")

def download_sample_audio():
    """Download some sample CC0 audio files"""
    
    # Sample URLs for testing (these are examples - replace with actual free sources)
    sample_files = [
        # You would add actual download URLs here from:
        # - freesound.org (after registration)
        # - CC0 sources
        # - Direct download links from free audio sites
    ]
    
    print("Creating placeholder files...")
    create_placeholder_sounds()
    
    print("\nTo add real audio files:")
    print("1. Visit https://freesound.org and search for 'cow CC0'")
    print("2. Visit https://mixkit.co/free-sound-effects/ for UI sounds")
    print("3. Visit https://incompetech.com for background music")
    print("4. Download files and replace placeholders in:")
    print(f"   - {sfx_dir.absolute()}")
    print(f"   - {music_dir.absolute()}")

if __name__ == "__main__":
    print("Setting up audio files for Kiwi Farm Game...")
    download_sample_audio()
    print("\nAudio setup complete! Check the audio directories for placeholder files.")