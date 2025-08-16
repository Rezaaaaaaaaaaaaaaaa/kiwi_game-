export class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.music = new Map();
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.masterVolume = 1.0;
        this.soundVolume = 0.7;
        this.musicVolume = 0.3;
        
        this.currentMusic = null;
        this.fadeInterval = null;
        
        this.audioContext = null;
        this.gainNode = null;
        
        this.initialize();
    }

    initialize() {
        try {
            // Try to create Web Audio context for better control
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.masterVolume;
            
            console.log('Audio system initialized with Web Audio API');
        } catch (error) {
            console.warn('Web Audio API not supported, using HTML5 audio:', error);
        }
        
        // Load sound effects
        this.loadSounds();
        
        // Load music
        this.loadMusic();
        
        // Set up user interaction handler for audio context
        this.setupUserInteractionHandler();
    }

    setupUserInteractionHandler() {
        const startAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('Audio context resumed');
                });
            }
            
            // Remove listeners after first interaction
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
        };
        
        document.addEventListener('click', startAudio);
        document.addEventListener('keydown', startAudio);
    }

    loadSounds() {
        const soundEffects = {
            // Farm sounds
            'cow-moo': { file: 'cow-moo.mp3', volume: 0.6, loop: false },
            'cow-moo-2': { file: 'cow-moo-2.mp3', volume: 0.5, loop: false },
            'milking': { file: 'milking.mp3', volume: 0.4, loop: true },
            'tractor': { file: 'tractor.mp3', volume: 0.5, loop: true },
            
            // UI sounds
            'click': { file: 'ui-click.mp3', volume: 0.3, loop: false },
            'hover': { file: 'ui-hover.mp3', volume: 0.2, loop: false },
            'success': { file: 'success.mp3', volume: 0.5, loop: false },
            'error': { file: 'error.mp3', volume: 0.4, loop: false },
            'warning': { file: 'warning.mp3', volume: 0.4, loop: false },
            
            // Nature sounds
            'wind': { file: 'wind.mp3', volume: 0.3, loop: true },
            'rain': { file: 'rain.mp3', volume: 0.4, loop: true },
            'thunder': { file: 'thunder.mp3', volume: 0.6, loop: false },
            'birds': { file: 'birds.mp3', volume: 0.3, loop: true },
            
            // Machinery sounds
            'machinery-start': { file: 'machinery-start.mp3', volume: 0.5, loop: false },
            'machinery-stop': { file: 'machinery-stop.mp3', volume: 0.5, loop: false },
            'feeding': { file: 'feeding.mp3', volume: 0.4, loop: false },
            
            // Achievement sounds
            'level-up': { file: 'level-up.mp3', volume: 0.6, loop: false },
            'achievement': { file: 'achievement.mp3', volume: 0.7, loop: false },
            'milestone': { file: 'milestone.mp3', volume: 0.5, loop: false }
        };

        Object.entries(soundEffects).forEach(([name, config]) => {
            this.loadSound(name, config);
        });
    }

    loadMusic() {
        const musicTracks = {
            'main-theme': { file: 'main-theme.mp3', volume: 0.3, loop: true },
            'peaceful-farm': { file: 'peaceful-farm.mp3', volume: 0.25, loop: true },
            'busy-day': { file: 'busy-day.mp3', volume: 0.3, loop: true },
            'rain-theme': { file: 'rain-theme.mp3', volume: 0.2, loop: true },
            'victory': { file: 'victory.mp3', volume: 0.4, loop: false },
            'menu-theme': { file: 'menu-theme.mp3', volume: 0.2, loop: true }
        };

        Object.entries(musicTracks).forEach(([name, config]) => {
            this.loadMusic(name, config);
        });
    }

    loadSound(name, config) {
        const audio = new Audio();
        audio.src = `src/assets/audio/sfx/${config.file}`;
        audio.volume = config.volume * this.soundVolume * this.masterVolume;
        audio.loop = config.loop;
        audio.preload = 'auto';
        
        // Handle loading errors
        audio.addEventListener('error', () => {
            console.warn(`Failed to load sound: ${name}`);
        });
        
        this.sounds.set(name, {
            audio: audio,
            config: config,
            instances: []
        });
    }

    loadMusicTrack(name, config) {
        const audio = new Audio();
        audio.src = `src/assets/audio/music/${config.file}`;
        audio.volume = config.volume * this.musicVolume * this.masterVolume;
        audio.loop = config.loop;
        audio.preload = 'auto';
        
        // Handle loading errors
        audio.addEventListener('error', () => {
            console.warn(`Failed to load music: ${name}`);
        });
        
        this.music.set(name, {
            audio: audio,
            config: config
        });
    }

    playSound(name, options = {}) {
        if (!this.soundEnabled) return null;
        
        const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`Sound not found: ${name}`);
            return null;
        }

        try {
            let audioInstance;
            
            if (sound.config.loop || options.overlap) {
                // Create new instance for looping sounds or when overlap is needed
                audioInstance = new Audio(sound.audio.src);
                audioInstance.volume = sound.config.volume * this.soundVolume * this.masterVolume;
                audioInstance.loop = sound.config.loop;
            } else {
                // Use the main instance for one-shot sounds
                audioInstance = sound.audio;
                audioInstance.currentTime = 0;
            }
            
            // Apply options
            if (options.volume !== undefined) {
                audioInstance.volume = options.volume * this.soundVolume * this.masterVolume;
            }
            
            if (options.playbackRate !== undefined) {
                audioInstance.playbackRate = options.playbackRate;
            }
            
            // Play the sound
            const playPromise = audioInstance.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Error playing sound ${name}:`, error);
                });
            }
            
            // Clean up non-looping instances when they finish
            if (!sound.config.loop && !options.loop) {
                audioInstance.addEventListener('ended', () => {
                    const index = sound.instances.indexOf(audioInstance);
                    if (index > -1) {
                        sound.instances.splice(index, 1);
                    }
                });
            }
            
            // Keep track of instances
            sound.instances.push(audioInstance);
            
            return audioInstance;
            
        } catch (error) {
            console.warn(`Error playing sound ${name}:`, error);
            return null;
        }
    }

    stopSound(name) {
        const sound = this.sounds.get(name);
        if (!sound) return;
        
        // Stop all instances
        sound.instances.forEach(instance => {
            instance.pause();
            instance.currentTime = 0;
        });
        
        sound.instances.length = 0;
    }

    playMusic(name, fadeIn = true) {
        if (!this.musicEnabled) return;
        
        const musicTrack = this.music.get(name);
        if (!musicTrack) {
            console.warn(`Music not found: ${name}`);
            return;
        }
        
        // Stop current music
        if (this.currentMusic) {
            if (fadeIn) {
                this.fadeOutMusic(() => {
                    this.startMusic(musicTrack, name, fadeIn);
                });
            } else {
                this.currentMusic.pause();
                this.startMusic(musicTrack, name, fadeIn);
            }
        } else {
            this.startMusic(musicTrack, name, fadeIn);
        }
    }

    startMusic(musicTrack, name, fadeIn) {
        this.currentMusic = musicTrack.audio;
        this.currentMusic.currentTime = 0;
        
        if (fadeIn) {
            this.currentMusic.volume = 0;
            this.currentMusic.play();
            this.fadeInMusic();
        } else {
            this.currentMusic.volume = musicTrack.config.volume * this.musicVolume * this.masterVolume;
            this.currentMusic.play();
        }
        
        console.log(`Playing music: ${name}`);
    }

    stopMusic(fadeOut = true) {
        if (!this.currentMusic) return;
        
        if (fadeOut) {
            this.fadeOutMusic(() => {
                this.currentMusic = null;
            });
        } else {
            this.currentMusic.pause();
            this.currentMusic = null;
        }
    }

    fadeInMusic(duration = 2000) {
        if (!this.currentMusic) return;
        
        const startVolume = 0;
        const endVolume = this.musicVolume * this.masterVolume;
        const steps = 50;
        const stepTime = duration / steps;
        const volumeStep = (endVolume - startVolume) / steps;
        
        let currentStep = 0;
        this.fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume + (volumeStep * currentStep);
            this.currentMusic.volume = Math.min(endVolume, newVolume);
            
            if (currentStep >= steps) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            }
        }, stepTime);
    }

    fadeOutMusic(callback, duration = 1500) {
        if (!this.currentMusic) {
            if (callback) callback();
            return;
        }
        
        const startVolume = this.currentMusic.volume;
        const endVolume = 0;
        const steps = 30;
        const stepTime = duration / steps;
        const volumeStep = (startVolume - endVolume) / steps;
        
        let currentStep = 0;
        this.fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume - (volumeStep * currentStep);
            this.currentMusic.volume = Math.max(endVolume, newVolume);
            
            if (currentStep >= steps) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
                this.currentMusic.pause();
                if (callback) callback();
            }
        }, stepTime);
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.masterVolume;
        }
    }

    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        this.updateSoundVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateMusicVolumes();
    }

    updateAllVolumes() {
        this.updateSoundVolumes();
        this.updateMusicVolumes();
    }

    updateSoundVolumes() {
        this.sounds.forEach((sound, name) => {
            const newVolume = sound.config.volume * this.soundVolume * this.masterVolume;
            sound.audio.volume = newVolume;
            
            // Update all instances
            sound.instances.forEach(instance => {
                instance.volume = newVolume;
            });
        });
    }

    updateMusicVolumes() {
        this.music.forEach((music, name) => {
            const newVolume = music.config.volume * this.musicVolume * this.masterVolume;
            music.audio.volume = newVolume;
        });
        
        if (this.currentMusic) {
            const musicEntry = Array.from(this.music.values()).find(m => m.audio === this.currentMusic);
            if (musicEntry) {
                this.currentMusic.volume = musicEntry.config.volume * this.musicVolume * this.masterVolume;
            }
        }
    }

    enableSound(enabled) {
        this.soundEnabled = enabled;
        if (!enabled) {
            this.stopAllSounds();
        }
    }

    enableMusic(enabled) {
        this.musicEnabled = enabled;
        if (!enabled) {
            this.stopMusic();
        } else if (this.music.has('peaceful-farm')) {
            this.playMusic('peaceful-farm');
        }
    }

    stopAllSounds() {
        this.sounds.forEach((sound, name) => {
            this.stopSound(name);
        });
    }

    // Game-specific audio events
    playUISound(type) {
        const soundMap = {
            click: 'click',
            hover: 'hover',
            success: 'success',
            error: 'error',
            warning: 'warning'
        };
        
        const soundName = soundMap[type];
        if (soundName) {
            this.playSound(soundName);
        }
    }

    playFarmSound(type, options = {}) {
        const soundMap = {
            moo: Math.random() < 0.5 ? 'cow-moo' : 'cow-moo-2',
            milking: 'milking',
            tractor: 'tractor',
            feeding: 'feeding'
        };
        
        const soundName = soundMap[type];
        if (soundName) {
            this.playSound(soundName, options);
        }
    }

    playWeatherSound(weatherType) {
        // Stop all weather sounds first
        this.stopSound('wind');
        this.stopSound('rain');
        this.stopSound('birds');
        
        switch (weatherType) {
            case 'rain':
            case 'heavy-rain':
                this.playSound('rain');
                break;
            case 'sunny':
                this.playSound('birds');
                break;
            case 'windy':
                this.playSound('wind');
                break;
        }
    }

    playAchievementSound(type) {
        const soundMap = {
            levelUp: 'level-up',
            achievement: 'achievement',
            milestone: 'milestone'
        };
        
        const soundName = soundMap[type];
        if (soundName) {
            this.playSound(soundName);
        }
    }

    setMusicForTime(hour, weather) {
        let musicTrack = 'peaceful-farm'; // default
        
        if (hour >= 6 && hour <= 18) {
            // Daytime
            musicTrack = 'busy-day';
        } else {
            // Night time
            musicTrack = 'peaceful-farm';
        }
        
        // Weather overrides
        if (weather && weather.conditions === 'rain') {
            musicTrack = 'rain-theme';
        }
        
        // Only change if it's different
        if (!this.currentMusic || !Array.from(this.music.values()).some(m => 
            m.audio === this.currentMusic && 
            Array.from(this.music.entries()).find(([name, entry]) => entry === m)?.[0] === musicTrack
        )) {
            this.playMusic(musicTrack);
        }
    }

    // Cleanup
    destroy() {
        this.stopAllSounds();
        this.stopMusic(false);
        
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}