/**
 * main.js - Main application entry point
 * Initializes the card game application and manages navigation between screens
 */

import Card from './core/Card.js';
import Deck from './core/Deck.js';
import { GameEngine } from './core/GameEngine.js';
import { EventManager } from './utils/EventManager.js';
import { StorageManager } from './utils/StorageManager.js';
import { SoundManager } from './utils/SoundManager.js';
import DeckBrowser from './games/DeckBrowser.js';

class CardGameApp {
    constructor() {
        this.currentGame = null;
        this.currentScreen = 'game-selection';
        this.settings = null;
        this.statistics = null;
        
        // Initialize managers
        this.eventManager = new EventManager();
        this.storageManager = new StorageManager();
        this.soundManager = new SoundManager();
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🎴 Initializing Card Game Application...');
            
            // Load settings and statistics
            await this.loadSettings();
            await this.loadStatistics();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Apply initial settings
            this.applySettings();
            
            // Show initial screen
            this.showScreen('game-selection');
            
            console.log('✅ Application initialized successfully');
            
            // Hide loading screen if visible
            this.hideLoading();
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showToast('Failed to initialize application', 'error');
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Game selection events
        this.setupGameSelectionEvents();
        
        // Navigation events
        this.setupNavigationEvents();
        
        // Settings events
        this.setupSettingsEvents();
        
        // Statistics events
        this.setupStatisticsEvents();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Window events
        this.setupWindowEvents();
    }

    /**
     * Set up game selection events
     */
    setupGameSelectionEvents() {
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach(card => {
            const playBtn = card.querySelector('.play-btn');
            const gameType = card.dataset.game;
            
            // Click on game card
            card.addEventListener('click', (e) => {
                if (e.target !== playBtn) {
                    this.selectGame(gameType);
                }
            });
            
            // Click on play button
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startGame(gameType);
            });
            
            // Hover effects
            card.addEventListener('mouseenter', () => {
                this.soundManager.play('hover');
            });
        });
    }

    /**
     * Set up navigation events
     */
    setupNavigationEvents() {
        // Header navigation
        const settingsBtn = document.getElementById('settings-btn');
        const statsBtn = document.getElementById('stats-btn');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
        
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.showStatistics());
        }
        
        // Back buttons
        const backButtons = document.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            btn.addEventListener('click', () => this.goBack());
        });
        
        // Game navigation
        const gameMenuBtn = document.getElementById('game-menu-btn');
        const gamePauseBtn = document.getElementById('game-pause-btn');
        
        if (gameMenuBtn) {
            gameMenuBtn.addEventListener('click', () => this.showGameMenu());
        }
        
        if (gamePauseBtn) {
            gamePauseBtn.addEventListener('click', () => this.pauseGame());
        }
    }

    /**
     * Set up settings events
     */
    setupSettingsEvents() {
        // Sound settings
        const soundEffectsSlider = document.getElementById('sound-effects');
        const musicVolumeSlider = document.getElementById('music-volume');
        
        if (soundEffectsSlider) {
            soundEffectsSlider.addEventListener('input', (e) => {
                this.updateSetting('soundEffects', parseInt(e.target.value));
                this.updateSliderValue(e.target);
            });
        }
        
        if (musicVolumeSlider) {
            musicVolumeSlider.addEventListener('input', (e) => {
                this.updateSetting('musicVolume', parseInt(e.target.value));
                this.updateSliderValue(e.target);
            });
        }
        
        // Graphics settings
        const animationSpeed = document.getElementById('animation-speed');
        const cardBack = document.getElementById('card-back');
        
        if (animationSpeed) {
            animationSpeed.addEventListener('change', (e) => {
                this.updateSetting('animationSpeed', e.target.value);
            });
        }
        
        if (cardBack) {
            cardBack.addEventListener('change', (e) => {
                this.updateSetting('cardBack', e.target.value);
            });
        }
        
        // Gameplay settings
        const autoPlay = document.getElementById('auto-play');
        const confirmMoves = document.getElementById('confirm-moves');
        
        if (autoPlay) {
            autoPlay.addEventListener('change', (e) => {
                this.updateSetting('autoPlay', e.target.checked);
            });
        }
        
        if (confirmMoves) {
            confirmMoves.addEventListener('change', (e) => {
                this.updateSetting('confirmMoves', e.target.checked);
            });
        }
    }

    /**
     * Set up statistics events
     */
    setupStatisticsEvents() {
        // Statistics will be updated automatically when games end
        // This method can be extended for interactive statistics features
    }

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape key - go back or pause
            if (e.key === 'Escape') {
                if (this.currentScreen === 'game-play' && this.currentGame) {
                    this.pauseGame();
                } else if (this.currentScreen !== 'game-selection') {
                    this.goBack();
                }
            }
            
            // Space bar - pause/resume game
            if (e.key === ' ' && this.currentScreen === 'game-play') {
                e.preventDefault();
                this.togglePause();
            }
            
            // Number keys for game selection
            if (this.currentScreen === 'game-selection' && e.key >= '1' && e.key <= '3') {
                const games = ['go-fish', 'war', 'memory'];
                const gameIndex = parseInt(e.key) - 1;
                if (games[gameIndex]) {
                    this.startGame(games[gameIndex]);
                }
            }
        });
    }

    /**
     * Set up window events
     */
    setupWindowEvents() {
        // Save state before unload
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });
        
        // Handle visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.currentGame && !this.currentGame.isPaused()) {
                this.pauseGame();
            }
        });
        
        // Handle resize
        window.addEventListener('resize', () => {
            if (this.currentGame) {
                this.currentGame.handleResize();
            }
        });
    }

    /**
     * Select a game (highlight it)
     */
    selectGame(gameType) {
        // Remove previous selections
        document.querySelectorAll('.game-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select current game
        const gameCard = document.querySelector(`[data-game="${gameType}"]`);
        if (gameCard) {
            gameCard.classList.add('selected');
        }
    }

    /**
     * Start a specific game
     */
    async startGame(gameType) {
        try {
            console.log(`🎮 Starting ${gameType} game...`);
            
            this.showLoading();
            
            // Dynamic import of the game module
            let GameClass;
            let useAlternateScreen = false;
            
            switch (gameType) {
                case 'go-fish':
                    try {
                        const GoFishModule = await import('./games/GoFish.js');
                        GameClass = GoFishModule.GoFish || GoFishModule.default;
                    } catch (error) {
                        console.error('Go Fish game not yet implemented');
                        throw new Error('Go Fish game is coming soon!');
                    }
                    break;
                case 'war':
                    try {
                        const WarModule = await import('./games/War.js');
                        GameClass = WarModule.War || WarModule.default;
                    } catch (error) {
                        console.error('War game not yet implemented');
                        throw new Error('War game is coming soon!');
                    }
                    break;
                case 'memory':
                    const MemoryModule = await import('./games/Memory.js');
                    GameClass = MemoryModule.Memory || MemoryModule.default;
                    break;
                case 'deck-browser':
                    GameClass = DeckBrowser;
                    useAlternateScreen = true;
                    break;
                default:
                    throw new Error(`Unknown game type: ${gameType}`);
            }
            
            // Create new game instance
            const container = useAlternateScreen ? 
                document.getElementById('deck-browser') : 
                document.getElementById('game-board');
                
            this.currentGame = new GameClass({
                container: container,
                settings: this.settings,
                onGameEnd: (result) => this.handleGameEnd(result),
                onGamePause: () => this.handleGamePause(),
                soundManager: this.soundManager
            });
            
            // Initialize the game
            await this.currentGame.init();
            
            // Update UI
            const currentGameEl = document.getElementById('current-game');
            if (currentGameEl) {
                currentGameEl.textContent = this.currentGame.getDisplayName();
            }
            
            // Show appropriate screen
            const targetScreen = useAlternateScreen ? 'deck-browser' : 'game-play';
            this.showScreen(targetScreen);
            
            this.hideLoading();
            
            console.log(`✅ ${gameType} game started successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to start ${gameType} game:`, error);
            this.showToast(`Failed to start ${gameType} game`, 'error');
            this.hideLoading();
        }
    }

    /**
     * Show a specific screen
     */
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    /**
     * Go back to the previous screen
     */
    goBack() {
        switch (this.currentScreen) {
            case 'game-setup':
            case 'settings':
            case 'statistics':
                this.showScreen('game-selection');
                break;
            case 'game-play':
                this.showGameMenu();
                break;
            default:
                this.showScreen('game-selection');
        }
    }

    /**
     * Show settings screen
     */
    showSettings() {
        this.populateSettings();
        this.showScreen('settings');
    }

    /**
     * Show statistics screen
     */
    showStatistics() {
        this.populateStatistics();
        this.showScreen('statistics');
    }

    /**
     * Show game menu (pause menu)
     */
    showGameMenu() {
        if (this.currentGame) {
            this.currentGame.pause();
        }
        // Could show a modal or overlay menu
        // For now, just go back to game selection
        this.showScreen('game-selection');
    }

    /**
     * Pause the current game
     */
    pauseGame() {
        if (this.currentGame) {
            this.currentGame.pause();
        }
    }

    /**
     * Toggle pause state of current game
     */
    togglePause() {
        if (this.currentGame) {
            if (this.currentGame.isPaused()) {
                this.currentGame.resume();
            } else {
                this.currentGame.pause();
            }
        }
    }

    /**
     * Handle game end
     */
    handleGameEnd(result) {
        console.log('🏁 Game ended:', result);
        
        // Update statistics
        this.updateStatistics(result);
        
        // Show game end screen or return to selection
        this.showToast(`Game Over! ${result.message}`, 'success');
        
        // Auto-return to selection after a delay
        setTimeout(() => {
            this.showScreen('game-selection');
        }, 3000);
    }

    /**
     * Handle game pause
     */
    handleGamePause() {
        const statusElement = document.getElementById('game-status');
        if (statusElement) {
            statusElement.textContent = 'Paused';
        }
    }

    /**
     * Load settings from storage
     */
    async loadSettings() {
        this.settings = await this.storageManager.load('settings') || {
            soundEffects: 75,
            musicVolume: 50,
            animationSpeed: 'normal',
            cardBack: 'classic',
            autoPlay: true,
            confirmMoves: false
        };
    }

    /**
     * Load statistics from storage
     */
    async loadStatistics() {
        this.statistics = await this.storageManager.load('statistics') || {
            totalGames: 0,
            gamesWon: 0,
            totalPlayTime: 0,
            gameStats: {
                'go-fish': { played: 0, won: 0, bestTime: null },
                'war': { played: 0, won: 0, bestTime: null },
                'memory': { played: 0, won: 0, bestTime: null }
            }
        };
    }

    /**
     * Save game state
     */
    saveGameState() {
        if (this.currentGame) {
            const gameState = this.currentGame.getState();
            this.storageManager.save('gameState', gameState);
        }
    }

    /**
     * Update a setting
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.storageManager.save('settings', this.settings);
        this.applySettings();
    }

    /**
     * Apply current settings
     */
    applySettings() {
        // Apply sound settings
        this.soundManager.setSoundEffectsVolume(this.settings.soundEffects / 100);
        this.soundManager.setMusicVolume(this.settings.musicVolume / 100);
        
        // Apply animation speed
        document.documentElement.style.setProperty(
            '--animation-speed', 
            this.getAnimationSpeedMultiplier(this.settings.animationSpeed)
        );
        
        // Apply card back
        document.documentElement.style.setProperty(
            '--card-back-image', 
            `url('assets/cards/back/${this.settings.cardBack}.png')`
        );
    }

    /**
     * Get animation speed multiplier
     */
    getAnimationSpeedMultiplier(speed) {
        const speeds = {
            'slow': '1.5',
            'normal': '1',
            'fast': '0.5',
            'instant': '0.01'
        };
        return speeds[speed] || '1';
    }

    /**
     * Populate settings form
     */
    populateSettings() {
        const soundEffectsSlider = document.getElementById('sound-effects');
        const musicVolumeSlider = document.getElementById('music-volume');
        
        if (soundEffectsSlider) {
            soundEffectsSlider.value = this.settings.soundEffects;
            this.updateSliderValue(soundEffectsSlider);
        }
        
        if (musicVolumeSlider) {
            musicVolumeSlider.value = this.settings.musicVolume;
            this.updateSliderValue(musicVolumeSlider);
        }
        
        const animationSpeed = document.getElementById('animation-speed');
        if (animationSpeed) {
            animationSpeed.value = this.settings.animationSpeed;
        }
        
        const cardBack = document.getElementById('card-back');
        if (cardBack) {
            cardBack.value = this.settings.cardBack;
        }
        
        const autoPlay = document.getElementById('auto-play');
        if (autoPlay) {
            autoPlay.checked = this.settings.autoPlay;
        }
        
        const confirmMoves = document.getElementById('confirm-moves');
        if (confirmMoves) {
            confirmMoves.checked = this.settings.confirmMoves;
        }
    }

    /**
     * Update slider value display
     */
    updateSliderValue(slider) {
        const valueDisplay = slider.parentElement.querySelector('.setting-value');
        if (valueDisplay) {
            valueDisplay.textContent = `${slider.value}%`;
        }
    }

    /**
     * Populate statistics
     */
    populateStatistics() {
        // Update overview statistics
        document.getElementById('total-games').textContent = this.statistics.totalGames;
        document.getElementById('games-won').textContent = this.statistics.gamesWon;
        
        const winRate = this.statistics.totalGames > 0 
            ? Math.round((this.statistics.gamesWon / this.statistics.totalGames) * 100)
            : 0;
        document.getElementById('win-rate').textContent = `${winRate}%`;
        
        const playTimeMinutes = Math.round(this.statistics.totalPlayTime / 60000);
        document.getElementById('play-time').textContent = `${playTimeMinutes}m`;
        
        // Update detailed game statistics
        // This would be expanded based on specific game statistics
    }

    /**
     * Update statistics after a game
     */
    updateStatistics(gameResult) {
        this.statistics.totalGames++;
        if (gameResult.won) {
            this.statistics.gamesWon++;
        }
        
        this.statistics.totalPlayTime += gameResult.playTime || 0;
        
        // Update game-specific stats
        const gameType = gameResult.gameType;
        if (this.statistics.gameStats[gameType]) {
            this.statistics.gameStats[gameType].played++;
            if (gameResult.won) {
                this.statistics.gameStats[gameType].won++;
            }
            
            // Update best time if applicable
            if (gameResult.playTime) {
                const currentBest = this.statistics.gameStats[gameType].bestTime;
                if (!currentBest || gameResult.playTime < currentBest) {
                    this.statistics.gameStats[gameType].bestTime = gameResult.playTime;
                }
            }
        }
        
        // Save statistics
        this.storageManager.save('statistics', this.statistics);
    }

    /**
     * Show loading overlay
     */
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('active');
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('active');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after duration
        setTimeout(() => {
            toast.remove();
        }, duration);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cardGameApp = new CardGameApp();
});

// Export for module usage
export default CardGameApp;