// Simple Node.js script to create basic audio files for testing
// Run with: node create_basic_audio.js

const fs = require('fs');
const path = require('path');

// Create audio directories
const sfxDir = path.join('src', 'assets', 'audio', 'sfx');
const musicDir = path.join('src', 'assets', 'audio', 'music');

fs.mkdirSync(sfxDir, { recursive: true });
fs.mkdirSync(musicDir, { recursive: true });

// Create simple audio file stubs with instructions
const audioFiles = {
    'cow-moo.mp3': {
        type: 'sfx',
        description: 'Cow mooing sound',
        source: 'Download from freesound.org - search "cow moo CC0"',
        alternatives: ['Record yourself saying "mooooo" in a low voice', 'Use text-to-speech to say "moo"']
    },
    'cow-moo-2.mp3': {
        type: 'sfx', 
        description: 'Alternative cow moo',
        source: 'Download from freesound.org - search "cow moo CC0"',
        alternatives: ['Different cow sound', 'Vary pitch from cow-moo.mp3']
    },
    'ui-click.mp3': {
        type: 'sfx',
        description: 'Button click sound',
        source: 'Download from mixkit.co/free-sound-effects/interface/',
        alternatives: ['Record a pen click', 'Use a short "pop" sound']
    },
    'ui-hover.mp3': {
        type: 'sfx',
        description: 'Hover effect sound',
        source: 'Download from mixkit.co/free-sound-effects/interface/',
        alternatives: ['Softer version of click sound', 'Short "ting" sound']
    },
    'success.mp3': {
        type: 'sfx',
        description: 'Success notification',
        source: 'Download from freesound.org - search "success sound CC0"',
        alternatives: ['Ascending "ding ding" sound', 'Happy chime']
    },
    'error.mp3': {
        type: 'sfx',
        description: 'Error notification',
        source: 'Download from freesound.org - search "error buzzer CC0"',
        alternatives: ['Descending "boop" sound', 'Short buzzer']
    },
    'rain.mp3': {
        type: 'sfx',
        description: 'Rain ambient sound',
        source: 'Download from freesound.org - search "rain CC0"',
        alternatives: ['White noise audio', 'Record actual rain']
    },
    'wind.mp3': {
        type: 'sfx',
        description: 'Wind effect',
        source: 'Download from freesound.org - search "wind CC0"',
        alternatives: ['Low whooshing sound', 'Blow into microphone gently']
    },
    'birds.mp3': {
        type: 'sfx',
        description: 'Bird chirping',
        source: 'Download from freesound.org - search "birds chirping CC0"',
        alternatives: ['Whistle bird sounds', 'Record local birds']
    },
    'peaceful-farm.mp3': {
        type: 'music',
        description: 'Peaceful farm background music',
        source: 'Download from incompetech.com - search "country" or "peaceful"',
        alternatives: ['Any calm instrumental music', 'Classical guitar pieces']
    },
    'main-theme.mp3': {
        type: 'music',
        description: 'Main game theme',
        source: 'Download from incompetech.com or opengameart.org',
        alternatives: ['Upbeat country music', 'Folk instrumental']
    },
    'menu-theme.mp3': {
        type: 'music',
        description: 'Menu background music',
        source: 'Download from incompetech.com - lighter, welcoming music',
        alternatives: ['Soft instrumental', 'Light acoustic music']
    }
};

// Create instruction files for each audio file
console.log('Creating audio file instructions...');

for (const [filename, info] of Object.entries(audioFiles)) {
    const dir = info.type === 'sfx' ? sfxDir : musicDir;
    const instructionFile = path.join(dir, `${filename.replace('.mp3', '_instructions.txt')}`);
    
    const content = `AUDIO FILE: ${filename}
DESCRIPTION: ${info.description}

PRIMARY SOURCE: ${info.source}

QUICK ALTERNATIVES FOR TESTING:
${info.alternatives.map(alt => `- ${alt}`).join('\n')}

ONCE YOU HAVE THE AUDIO FILE:
1. Make sure it's in MP3 format
2. Rename it to exactly: ${filename}
3. Place it in: ${dir}
4. Delete this instruction file

FILE STATUS: ⏳ NEEDED - Audio file missing
The game will work without this file but won't have sound effects.

LEGAL REQUIREMENTS:
- Use only CC0, royalty-free, or properly licensed audio
- Check attribution requirements for CC BY licensed content
- Keep track of sources for credits if needed
`;

    fs.writeFileSync(instructionFile, content);
    console.log(`✓ Created instructions for ${filename}`);
}

// Create a download script
const downloadScript = `#!/bin/bash
# Quick download script for free audio sources

echo "🎵 Kiwi Farm Audio Setup"
echo "========================"

echo "Opening audio source websites..."

# Open free audio source websites
if command -v python &> /dev/null; then
    echo "Opening Freesound.org..."
    python -m webbrowser https://freesound.org/search/?q=cow&f=license:%22Creative+Commons+0%22
    
    echo "Opening Mixkit..."
    python -m webbrowser https://mixkit.co/free-sound-effects/interface/
    
    echo "Opening Incompetech..."
    python -m webbrowser https://incompetech.com/music/royalty-free/music.html
fi

echo ""
echo "📋 Download Checklist:"
echo "□ Cow sounds from Freesound.org"
echo "□ UI sounds from Mixkit.co"
echo "□ Background music from Incompetech.com"
echo "□ Nature sounds from Freesound.org"
echo ""
echo "Remember to:"
echo "1. Check licensing (prefer CC0)"
echo "2. Download as MP3 format"
echo "3. Use exact filenames as listed"
echo "4. Place in correct folders (sfx/ or music/)"
`;

fs.writeFileSync('download_audio.sh', downloadScript);
fs.chmodSync('download_audio.sh', 0o755);

console.log('\n🎯 Audio setup complete!');
console.log('\nNext steps:');
console.log('1. Check the instruction files in src/assets/audio/');
console.log('2. Visit the recommended websites to download free audio');
console.log('3. Or run ./download_audio.sh to open source websites');
console.log('4. Use the exact filenames specified for automatic integration');
console.log('\nThe game will work without audio files, but adding them will enhance the experience!');