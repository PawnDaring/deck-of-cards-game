/**
 * SoundManager.js - Audio management system for the card game application
 * Handles sound effects, background music, and volume control
 */

export class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.music = new Map();
        this.soundEffectsVolume = 0.75;
        this.musicVolume = 0.5;
        this.muted = false;
        
        // Audio context for better control (if available)
        this.audioContext = null;
        this.masterGainNode = null;
        
        this.initializeAudioContext();
        this.loadSounds();
    }

    /**
     * Initialize Web Audio API context
     */
    initializeAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.masterGainNode = this.audioContext.createGain();
                this.masterGainNode.connect(this.audioContext.destination);
            }
        } catch (error) {
            console.warn('Web Audio API not available, falling back to HTML5 Audio');
        }
    }

    /**
     * Load all sound files
     */
    loadSounds() {
        // Define sound effects and their file paths
        const soundEffects = {
            'card-flip': 'assets/sounds/card-flip.mp3',
            'card-deal': 'assets/sounds/card-deal.mp3',
            'card-shuffle': 'assets/sounds/shuffle.mp3',
            'button-click': 'assets/sounds/button-click.mp3',
            'button-hover': 'assets/sounds/button-hover.mp3',
            'game-win': 'assets/sounds/victory.mp3',
            'game-lose': 'assets/sounds/defeat.mp3',
            'notification': 'assets/sounds/notification.mp3',
            'error': 'assets/sounds/error.mp3',
            'match': 'assets/sounds/match.mp3',
            'no-match': 'assets/sounds/no-match.mp3'
        };

        // Define background music
        const backgroundMusic = {
            'menu': 'assets/sounds/menu-music.mp3',
            'gameplay': 'assets/sounds/gameplay-music.mp3',
            'victory': 'assets/sounds/victory-music.mp3'
        };

        // Load sound effects
        Object.entries(soundEffects).forEach(([name, path]) => {
            this.loadSound(name, path, 'effect');
        });

        // Load background music
        Object.entries(backgroundMusic).forEach(([name, path]) => {
            this.loadSound(name, path, 'music');
        });
    }

    /**
     * Load a single sound file
     * @param {string} name - Sound identifier
     * @param {string} path - File path
     * @param {string} type - 'effect' or 'music'
     */
    loadSound(name, path, type = 'effect') {
        const audio = new Audio();
        audio.preload = 'auto';
        
        // Set default properties based on type
        if (type === 'music') {
            audio.loop = true;
            audio.volume = this.musicVolume;
            this.music.set(name, audio);
        } else {
            audio.volume = this.soundEffectsVolume;
            this.sounds.set(name, audio);
        }

        // Load the audio file
        audio.addEventListener('canplaythrough', () => {
            console.log(`✅ Loaded ${type}: ${name}`);
        });

        audio.addEventListener('error', (error) => {
            console.warn(`❌ Failed to load ${type} ${name}:`, error);
        });

        audio.src = path;
    }

    /**
     * Play a sound effect
     * @param {string} soundName - Name of the sound to play
     * @param {number} volume - Override volume (0-1)
     * @param {number} rate - Playback rate (default: 1)
     */
    play(soundName, volume = null, rate = 1) {
        if (this.muted) return;

        const audio = this.sounds.get(soundName);
        if (!audio) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }

        try {
            // Clone audio for overlapping sounds
            const audioClone = audio.cloneNode();
            
            // Set volume
            audioClone.volume = (volume !== null ? volume : this.soundEffectsVolume) * (this.muted ? 0 : 1);
            
            // Set playback rate
            if (rate !== 1) {
                audioClone.playbackRate = rate;
            }

            // Play the sound
            const playPromise = audioClone.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Failed to play sound ${soundName}:`, error);
                });
            }

            // Clean up after playing
            audioClone.addEventListener('ended', () => {
                audioClone.remove();
            });

        } catch (error) {
            console.error(`Error playing sound ${soundName}:`, error);
        }
    }

    /**
     * Play background music
     * @param {string} musicName - Name of the music to play
     * @param {boolean} fadeIn - Whether to fade in the music
     * @param {number} fadeDuration - Fade duration in milliseconds
     */
    playMusic(musicName, fadeIn = true, fadeDuration = 1000) {
        if (this.muted) return;

        const music = this.music.get(musicName);
        if (!music) {
            console.warn(`Music not found: ${musicName}`);
            return;
        }

        try {
            // Stop other music first
            this.stopAllMusic();

            music.currentTime = 0;
            
            if (fadeIn) {
                music.volume = 0;
                music.play();
                this.fadeIn(music, this.musicVolume, fadeDuration);
            } else {
                music.volume = this.musicVolume;
                music.play();
            }

        } catch (error) {
            console.error(`Error playing music ${musicName}:`, error);
        }
    }

    /**
     * Stop a specific music track
     * @param {string} musicName - Name of the music to stop
     * @param {boolean} fadeOut - Whether to fade out the music
     * @param {number} fadeDuration - Fade duration in milliseconds
     */
    stopMusic(musicName, fadeOut = true, fadeDuration = 1000) {
        const music = this.music.get(musicName);
        if (!music) return;

        if (fadeOut) {
            this.fadeOut(music, fadeDuration);
        } else {
            music.pause();
            music.currentTime = 0;
        }
    }

    /**
     * Stop all background music
     */
    stopAllMusic() {
        this.music.forEach(music => {
            music.pause();
            music.currentTime = 0;
        });
    }

    /**
     * Pause all background music
     */
    pauseAllMusic() {
        this.music.forEach(music => {
            if (!music.paused) {
                music.pause();
            }
        });
    }

    /**
     * Resume all paused background music
     */
    resumeAllMusic() {
        this.music.forEach(music => {
            if (music.paused && music.currentTime > 0) {
                music.play();
            }
        });
    }

    /**
     * Fade in audio
     * @param {HTMLAudioElement} audio - Audio element
     * @param {number} targetVolume - Target volume (0-1)
     * @param {number} duration - Fade duration in milliseconds
     */
    fadeIn(audio, targetVolume, duration) {
        const steps = 50;
        const stepDuration = duration / steps;
        const volumeStep = targetVolume / steps;
        
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.min(volumeStep * currentStep, targetVolume);
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                audio.volume = targetVolume;
            }
        }, stepDuration);
    }

    /**
     * Fade out audio
     * @param {HTMLAudioElement} audio - Audio element
     * @param {number} duration - Fade duration in milliseconds
     */
    fadeOut(audio, duration) {
        const steps = 50;
        const stepDuration = duration / steps;
        const initialVolume = audio.volume;
        const volumeStep = initialVolume / steps;
        
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.max(initialVolume - (volumeStep * currentStep), 0);
            
            if (currentStep >= steps || audio.volume <= 0) {
                clearInterval(fadeInterval);
                audio.pause();
                audio.currentTime = 0;
                audio.volume = initialVolume;
            }
        }, stepDuration);
    }

    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0-1)
     */
    setSoundEffectsVolume(volume) {
        this.soundEffectsVolume = Math.max(0, Math.min(1, volume));
        
        // Update existing sound volumes
        this.sounds.forEach(audio => {
            audio.volume = this.soundEffectsVolume;
        });
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        // Update existing music volumes
        this.music.forEach(audio => {
            if (!audio.paused) {
                audio.volume = this.musicVolume;
            }
        });
    }

    /**
     * Set master volume (affects all audio)
     * @param {number} volume - Volume level (0-1)
     */
    setMasterVolume(volume) {
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = Math.max(0, Math.min(1, volume));
        } else {
            // Fallback for HTML5 Audio
            const masterVolume = Math.max(0, Math.min(1, volume));
            this.sounds.forEach(audio => {
                audio.volume = this.soundEffectsVolume * masterVolume;
            });
            this.music.forEach(audio => {
                audio.volume = this.musicVolume * masterVolume;
            });
        }
    }

    /**
     * Mute all audio
     */
    mute() {
        this.muted = true;
        this.setMasterVolume(0);
    }

    /**
     * Unmute all audio
     */
    unmute() {
        this.muted = false;
        this.setMasterVolume(1);
    }

    /**
     * Toggle mute state
     */
    toggleMute() {
        if (this.muted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    /**
     * Get current volume levels
     * @returns {Object} Volume information
     */
    getVolumeInfo() {
        return {
            soundEffects: this.soundEffectsVolume,
            music: this.musicVolume,
            muted: this.muted
        };
    }

    /**
     * Preload additional sounds dynamically
     * @param {Object} soundList - Object with sound names and paths
     */
    preloadSounds(soundList) {
        Object.entries(soundList).forEach(([name, path]) => {
            if (!this.sounds.has(name)) {
                this.loadSound(name, path, 'effect');
            }
        });
    }

    /**
     * Check if a sound is loaded and ready
     * @param {string} soundName - Name of the sound
     * @returns {boolean} True if sound is ready
     */
    isSoundReady(soundName) {
        const audio = this.sounds.get(soundName) || this.music.get(soundName);
        return audio && audio.readyState >= 3; // HAVE_FUTURE_DATA or higher
    }

    /**
     * Get loading progress for all sounds
     * @returns {Object} Loading progress information
     */
    getLoadingProgress() {
        let totalSounds = this.sounds.size + this.music.size;
        let loadedSounds = 0;

        [...this.sounds.values(), ...this.music.values()].forEach(audio => {
            if (audio.readyState >= 3) {
                loadedSounds++;
            }
        });

        return {
            total: totalSounds,
            loaded: loadedSounds,
            percentage: totalSounds > 0 ? (loadedSounds / totalSounds) * 100 : 100
        };
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.stopAllMusic();
        
        // Remove all audio elements
        [...this.sounds.values(), ...this.music.values()].forEach(audio => {
            audio.pause();
            audio.src = '';
            audio.load();
        });
        
        this.sounds.clear();
        this.music.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

export default SoundManager;