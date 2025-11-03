/**
 * GameEngine.js - Base class for all card games
 * Provides common functionality and structure for game implementations
 */

import { EventManager } from '../utils/EventManager.js';

export class GameEngine {
    constructor(options = {}) {
        // Core properties
        this.container = options.container;
        this.settings = options.settings || {};
        this.soundManager = options.soundManager;
        this.eventManager = new EventManager();
        
        // Game state
        this.state = 'initializing'; // initializing, ready, playing, paused, ended
        this.players = [];
        this.currentPlayer = 0;
        this.gameData = {};
        
        // Callbacks
        this.onGameEnd = options.onGameEnd || (() => {});
        this.onGamePause = options.onGamePause || (() => {});
        this.onGameResume = options.onGameResume || (() => {});
        this.onPlayerTurn = options.onPlayerTurn || (() => {});
        
        // Timing
        this.startTime = null;
        this.pauseTime = null;
        this.totalPauseTime = 0;
        
        // Animation and UI
        this.animationSpeed = this.getAnimationSpeed();
        this.autoPlay = this.settings.autoPlay || false;
        
        this.init();
    }

    /**
     * Initialize the game - should be overridden by subclasses
     */
    async init() {
        console.log('Initializing base game engine...');
        this.state = 'ready';
        this.setupEventListeners();
    }

    /**
     * Start the game
     */
    start() {
        if (this.state !== 'ready') {
            console.warn('Game is not ready to start');
            return false;
        }

        console.log('Starting game...');
        this.state = 'playing';
        this.startTime = Date.now();
        this.onGameStart();
        return true;
    }

    /**
     * Pause the game
     */
    pause() {
        if (this.state !== 'playing') {
            return false;
        }

        console.log('Pausing game...');
        this.state = 'paused';
        this.pauseTime = Date.now();
        this.onGamePause();
        return true;
    }

    /**
     * Resume the game
     */
    resume() {
        if (this.state !== 'paused') {
            return false;
        }

        console.log('Resuming game...');
        this.state = 'playing';
        
        if (this.pauseTime) {
            this.totalPauseTime += Date.now() - this.pauseTime;
            this.pauseTime = null;
        }
        
        this.onGameResume();
        return true;
    }

    /**
     * End the game
     * @param {Object} result - Game result information
     */
    end(result = {}) {
        if (this.state === 'ended') {
            return false;
        }

        console.log('Ending game...');
        this.state = 'ended';
        
        const finalResult = {
            ...result,
            playTime: this.getPlayTime(),
            gameType: this.getGameType()
        };
        
        this.onGameEnd(finalResult);
        return true;
    }

    /**
     * Reset the game to initial state
     */
    reset() {
        console.log('Resetting game...');
        this.state = 'initializing';
        this.players = [];
        this.currentPlayer = 0;
        this.gameData = {};
        this.startTime = null;
        this.pauseTime = null;
        this.totalPauseTime = 0;
        
        this.init();
    }

    /**
     * Get current game state information
     * @returns {Object} Current game state
     */
    getState() {
        return {
            state: this.state,
            players: this.players.map(player => player.serialize ? player.serialize() : player),
            currentPlayer: this.currentPlayer,
            gameData: { ...this.gameData },
            playTime: this.getPlayTime(),
            settings: { ...this.settings }
        };
    }

    /**
     * Load game state
     * @param {Object} savedState - Previously saved game state
     */
    loadState(savedState) {
        if (!savedState) return false;

        try {
            this.state = savedState.state || 'ready';
            this.currentPlayer = savedState.currentPlayer || 0;
            this.gameData = savedState.gameData || {};
            
            // Subclasses should override this method to handle player restoration
            this.restorePlayers(savedState.players || []);
            
            return true;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return false;
        }
    }

    /**
     * Setup base event listeners
     */
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Window focus/blur for auto-pause
        window.addEventListener('blur', () => {
            if (this.state === 'playing' && this.settings.autoPauseOnBlur) {
                this.pause();
            }
        });
    }

    /**
     * Handle keyboard input - can be overridden by subclasses
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'Escape':
                if (this.state === 'playing') {
                    this.pause();
                }
                break;
            case ' ':
                if (this.state === 'paused') {
                    this.resume();
                } else if (this.state === 'playing') {
                    this.pause();
                }
                e.preventDefault();
                break;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Subclasses can override this to handle responsive design
        console.log('Handling resize...');
    }

    /**
     * Add a player to the game
     * @param {Object} player - Player object
     */
    addPlayer(player) {
        this.players.push(player);
        console.log(`Added player: ${player.name || 'Player ' + this.players.length}`);
    }

    /**
     * Get current player
     * @returns {Object|null} Current player object
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayer] || null;
    }

    /**
     * Move to next player
     */
    nextPlayer() {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        const currentPlayer = this.getCurrentPlayer();
        
        if (currentPlayer) {
            this.onPlayerTurn(currentPlayer, this.currentPlayer);
        }
    }

    /**
     * Get play time in milliseconds
     * @returns {number} Play time excluding pauses
     */
    getPlayTime() {
        if (!this.startTime) return 0;
        
        let endTime = this.state === 'ended' ? Date.now() : 
                      this.state === 'paused' ? this.pauseTime : Date.now();
        
        return endTime - this.startTime - this.totalPauseTime;
    }

    /**
     * Get formatted play time string
     * @returns {string} Formatted time (e.g., "2:34")
     */
    getFormattedPlayTime() {
        const totalSeconds = Math.floor(this.getPlayTime() / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get animation speed multiplier from settings
     * @returns {number} Speed multiplier
     */
    getAnimationSpeed() {
        const speed = this.settings.animationSpeed || 'normal';
        const speeds = {
            'slow': 0.5,
            'normal': 1,
            'fast': 2,
            'instant': 10
        };
        return speeds[speed] || 1;
    }

    /**
     * Play a sound effect if sound manager is available
     * @param {string} soundName - Name of sound to play
     * @param {number} volume - Volume override
     */
    playSound(soundName, volume = null) {
        if (this.soundManager) {
            this.soundManager.play(soundName, volume);
        }
    }

    /**
     * Animate an element with CSS classes
     * @param {HTMLElement} element - Element to animate
     * @param {string} animationClass - CSS animation class
     * @param {number} duration - Animation duration in ms
     * @returns {Promise} Promise that resolves when animation completes
     */
    animate(element, animationClass, duration = 300) {
        return new Promise(resolve => {
            element.classList.add(animationClass);
            
            const actualDuration = duration / this.animationSpeed;
            
            setTimeout(() => {
                element.classList.remove(animationClass);
                resolve();
            }, actualDuration);
        });
    }

    /**
     * Create a card element for rendering
     * @param {Card} card - Card object
     * @param {Object} options - Rendering options
     * @returns {HTMLElement} Card DOM element
     */
    createCardElement(card, options = {}) {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${card.isRed() ? 'red' : 'black'}`;
        cardEl.dataset.cardId = card.id;
        
        if (options.size) {
            cardEl.classList.add(options.size);
        }
        
        if (card.faceUp) {
            cardEl.classList.add('face-up');
        }
        
        // Create card face
        const faceEl = document.createElement('div');
        faceEl.className = 'card-face';
        
        // Try to use background image for card face, fallback to text
        if (card.faceUp) {
            // Always create text elements as fallback first
            const rankEl = document.createElement('div');
            rankEl.className = 'card-rank';
            rankEl.textContent = card.rank;
            
            const suitEl = document.createElement('div');
            suitEl.className = 'card-suit';
            suitEl.textContent = this.getSuitSymbol(card.suit);
            
            faceEl.appendChild(rankEl);
            faceEl.appendChild(suitEl);
            
            // Try to load image with multiple formats
            this.tryLoadCardImage(card, faceEl);
        }
        
        // Create card back
        const backEl = document.createElement('div');
        backEl.className = 'card-back';
        
        // Use CSS-styled card back (defined in CSS file)
        // The CSS already provides a nice radial gradient pattern
        
        cardEl.appendChild(faceEl);
        cardEl.appendChild(backEl);
        
        return cardEl;
    }

    /**
     * Get suit symbol for display
     * @param {string} suit - Suit name
     * @returns {string} Suit symbol
     */
    getSuitSymbol(suit) {
        const symbols = {
            'spades': '♠',
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣'
        };
        return symbols[suit] || suit;
    }

    /**
     * Try to load card image with multiple formats
     * @param {Card} card - Card object
     * @param {HTMLElement} faceEl - Card face element
     */
    tryLoadCardImage(card, faceEl) {
        const possiblePaths = card.getPossibleImagePaths();
        let pathIndex = 0;
        
        const tryNextPath = () => {
            if (pathIndex >= possiblePaths.length) {
                console.log(`❌ No card image found for ${card.getDisplayName()} - using text fallback`);
                return;
            }
            
            const imagePath = possiblePaths[pathIndex];
            const testImg = new Image();
            
            console.log(`🎴 Trying to load card image: ${imagePath} for ${card.getDisplayName()}`);
            
            testImg.onload = () => {
                console.log(`✅ Card image loaded successfully: ${imagePath}`);
                faceEl.style.backgroundImage = `url('${imagePath}')`;
                faceEl.style.backgroundSize = 'cover';
                faceEl.style.backgroundPosition = 'center';
                faceEl.style.backgroundRepeat = 'no-repeat';
                faceEl.style.backgroundColor = 'white';
                
                // Remove text elements since we have an image
                const textElements = faceEl.querySelectorAll('.card-rank, .card-suit');
                textElements.forEach(el => el.remove());
            };
            
            testImg.onerror = () => {
                pathIndex++;
                tryNextPath(); // Try next format
            };
            
            testImg.src = imagePath;
        };
        
        tryNextPath();
    }

    /**
     * Flip a card element with animation
     * @param {HTMLElement} cardElement - Card DOM element
     * @param {boolean} faceUp - Whether to flip face up
     * @returns {Promise} Promise that resolves when flip completes
     */
    async flipCard(cardElement, faceUp = true) {
        cardElement.classList.add('flipping');
        this.playSound('card-flip');
        
        await new Promise(resolve => {
            setTimeout(() => {
                if (faceUp) {
                    cardElement.classList.add('face-up');
                } else {
                    cardElement.classList.remove('face-up');
                }
                resolve();
            }, 150 / this.animationSpeed);
        });
        
        setTimeout(() => {
            cardElement.classList.remove('flipping');
        }, 300 / this.animationSpeed);
    }

    /**
     * Deal cards with animation
     * @param {Array} cards - Cards to deal
     * @param {HTMLElement} targetContainer - Where to deal cards
     * @param {number} delay - Delay between dealing each card
     * @returns {Promise} Promise that resolves when all cards are dealt
     */
    async dealCards(cards, targetContainer, delay = 100) {
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const cardElement = this.createCardElement(card);
            
            // Start with card off-screen or scaled down
            cardElement.style.transform = 'scale(0) translateY(-100px)';
            cardElement.style.opacity = '0';
            
            targetContainer.appendChild(cardElement);
            
            // Animate in
            await new Promise(resolve => {
                setTimeout(() => {
                    cardElement.style.transition = 'all 0.3s ease-out';
                    cardElement.style.transform = 'scale(1) translateY(0)';
                    cardElement.style.opacity = '1';
                    
                    this.playSound('card-deal');
                    resolve();
                }, (delay / this.animationSpeed) * i);
            });
        }
    }

    /**
     * Show game message to user
     * @param {string} message - Message to display
     * @param {string} type - Message type (info, success, warning, error)
     * @param {number} duration - How long to show message
     */
    showMessage(message, type = 'info', duration = 3000) {
        // This would typically show a toast or modal
        // For now, just log to console
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    /**
     * Check if game is currently active
     * @returns {boolean} True if game is playing or paused
     */
    isActive() {
        return this.state === 'playing' || this.state === 'paused';
    }

    /**
     * Check if game is paused
     * @returns {boolean} True if game is paused
     */
    isPaused() {
        return this.state === 'paused';
    }

    /**
     * Check if game has ended
     * @returns {boolean} True if game has ended
     */
    isEnded() {
        return this.state === 'ended';
    }

    /**
     * Get game type - should be overridden by subclasses
     * @returns {string} Game type identifier
     */
    getGameType() {
        return 'base-game';
    }

    /**
     * Get display name - should be overridden by subclasses
     * @returns {string} Human-readable game name
     */
    getDisplayName() {
        return 'Card Game';
    }

    /**
     * Serialize game for saving
     * @returns {Object} Serialized game data
     */
    serialize() {
        return {
            gameType: this.getGameType(),
            state: this.getState(),
            timestamp: Date.now()
        };
    }

    /**
     * Event handlers that can be overridden by subclasses
     */
    onGameStart() {
        console.log('Game started');
    }

    /**
     * Restore players from saved state - should be overridden by subclasses
     * @param {Array} playerData - Saved player data
     */
    restorePlayers(playerData) {
        console.log('Restoring players:', playerData);
        // Subclasses should implement player restoration logic
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.eventManager.removeAllListeners();
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('Game engine cleaned up');
    }
}

export default GameEngine;