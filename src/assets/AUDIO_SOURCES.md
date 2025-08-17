# Free Audio Sources for Kiwi Farm Game

## Sound Effects (CC0/Free)

### Farm Animal Sounds
**Freesound.org (CC0/CC BY)**
- Cow moo sounds: https://freesound.org/people/Benboncan/packs/4104/
- Farm ambiance: https://freesound.org/search/?q=farm&f=license:%22Creative+Commons+0%22

**Pixabay (No attribution required)**
- Cow sounds: https://pixabay.com/sound-effects/search/cow/
- Farm animals: https://pixabay.com/sound-effects/search/farm/

### UI Sounds
**Mixkit (Royalty-free)**
- Button clicks: https://mixkit.co/free-sound-effects/interface/
- Success/error sounds: https://mixkit.co/free-sound-effects/notification/

### Nature & Weather
**OpenGameArt.org (CC0)**
- Wind sounds: https://opengameart.org/content/wind-sound-effects
- Rain sounds: https://opengameart.org/content/rain-sound-effect

**Free Sounds Library (CC BY 4.0)**
- Weather effects: https://www.freesoundslibrary.com/

## Background Music (CC0/Free)

### Ambient Farm Music
**Incompetech (CC BY 3.0 - requires attribution)**
- Peaceful music: https://incompetech.com/music/royalty-free/music.html
- Search for: "peaceful", "rural", "country"

**OpenGameArt.org (CC0)**
- Background music: https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=12&sort_by=count&sort_order=DESC

**YouTube Audio Library (Free)**
- Rural/Country music: https://studio.youtube.com/channel/UC.../music

## How to Add Audio Files

1. Download audio files from the sources above
2. Convert to MP3 format if needed (recommended: 44.1kHz, 128-192 kbps)
3. Place files in the appropriate directories:
   - Sound effects: `/src/assets/audio/sfx/`
   - Background music: `/src/assets/audio/music/`

4. Use the naming convention from AudioManager.js:
   - `cow-moo.mp3`, `cow-moo-2.mp3`
   - `ui-click.mp3`, `ui-hover.mp3`
   - `rain.mp3`, `wind.mp3`, `birds.mp3`
   - `main-theme.mp3`, `peaceful-farm.mp3`

## Sample File Structure
```
src/assets/audio/
├── sfx/
│   ├── cow-moo.mp3
│   ├── cow-moo-2.mp3
│   ├── milking.mp3
│   ├── ui-click.mp3
│   ├── ui-hover.mp3
│   ├── success.mp3
│   ├── rain.mp3
│   ├── wind.mp3
│   └── birds.mp3
└── music/
    ├── main-theme.mp3
    ├── peaceful-farm.mp3
    ├── busy-day.mp3
    └── rain-theme.mp3
```

## Attribution Requirements

- **CC0**: No attribution required
- **CC BY**: Attribute in credits/about section
- **Royalty-free**: Check individual license terms

## Tools for Audio Editing

- **Audacity** (Free): https://www.audacityteam.org/
- **LMMS** (Free): https://lmms.io/
- **Online converters**: For format conversion

## Audio Quality Settings

- **File format**: MP3 (best compatibility)
- **Sample rate**: 44.1kHz
- **Bit rate**: 128-192 kbps (good quality/size balance)
- **Max file size**: Keep under 1MB for SFX, 5MB for music