/**
 * Memory.js - Memory Match card game implementation
 * Classic memory game where players flip cards to find matching pairs
 */

import { GameEngine } from '../core/GameEngine.js';
import Card from '../core/Card.js';
import Deck from '../core/Deck.js';

export class Memory extends GameEngine {
    constructor(options = {}) {
        super(options);
        
        // Memory game specific properties
        this.gridSize = options.gridSize || '4x3'; // 4x3, 4x4, 6x4
        this.timeLimit = options.timeLimit || null; // null = no time limit
        this.showTime = options.showTime || 3000; // Time to show all cards at start
        
        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = [];
        this.moves = 0;
        this.matches = 0;
        this.gameTimer = null;
        this.showTimer = null;
        this.startTime = null;
        
        // UI elements
        this.gridContainer = null;
        this.scoreElement = null;
        this.timerElement = null;
        this.movesElement = null;
        this.matchesElement = null;
        
        this.difficulties = {
            '4x3': { rows: 3, cols: 4, pairs: 6, name: 'Easy (12 cards)' },
            '4x4': { rows: 4, cols: 4, pairs: 8, name: 'Medium (16 cards)' },
            '6x4': { rows: 4, cols: 6, pairs: 12, name: 'Hard (24 cards)' }
        };
    }

    /**
     * Initialize the memory game
     */
    async init() {
        console.log('🧠 Initializing Memory Match game...');
        
        await super.init();
        
        this.setupUI();
        this.createCards();
        this.renderCards();
        this.showAllCards();
        
        this.state = 'ready';
        console.log('✅ Memory Match game initialized');
    }

    /**
     * Setup the game UI
     */
    setupUI() {
        if (!this.container) {
            console.error('No container provided for Memory game');
            return;
        }

        // Clear container
        this.container.innerHTML = '';
        this.container.className = 'game-board memory';

        // Create game header
        const header = document.createElement('div');
        header.className = 'game-status';
        header.innerHTML = `
            <div class="game-info">
                <div class="info-item">
                    <span class="info-label">Moves:</span>
                    <span id="moves-count" class="info-value">0</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Matches:</span>
                    <span id="matches-count" class="info-value">0</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Time:</span>
                    <span id="game-timer" class="info-value">0:00</span>
                </div>
            </div>
            <div class="difficulty-info">
                ${this.difficulties[this.gridSize].name}
            </div>
        `;

        // Create game grid
        const gridContainer = document.createElement('div');
        gridContainer.className = `memory-cards memory-grid-${this.gridSize}`;
        gridContainer.id = 'memory-grid';

        // Add elements to container
        this.container.appendChild(header);
        this.container.appendChild(gridContainer);

        // Store references
        this.gridContainer = gridContainer;
        this.movesElement = document.getElementById('moves-count');
        this.matchesElement = document.getElementById('matches-count');
        this.timerElement = document.getElementById('game-timer');
    }

    /**
     * Create and shuffle cards for the memory game
     */
    createCards() {
        const difficulty = this.difficulties[this.gridSize];
        const totalCards = difficulty.rows * difficulty.cols;
        const pairsNeeded = totalCards / 2;

        // Create a deck and select random cards for pairs
        const deck = new Deck();
        const selectedCards = deck.dealMultiple(pairsNeeded);

        // Create pairs
        this.cards = [];
        selectedCards.forEach((card, index) => {
            // Create two identical cards for the pair
            const card1 = card.clone();
            const card2 = card.clone();
            
            // Add unique IDs for the memory game
            card1.memoryId = `${card.id}_1`;
            card2.memoryId = `${card.id}_2`;
            card1.pairId = index;
            card2.pairId = index;
            
            // Start face down
            card1.turnFaceDown();
            card2.turnFaceDown();
            
            this.cards.push(card1, card2);
        });

        // Shuffle the cards
        this.shuffleArray(this.cards);
        
        console.log(`Created ${this.cards.length} cards (${pairsNeeded} pairs)`);
    }

    /**
     * Render cards in the grid
     */
    renderCards() {
        this.gridContainer.innerHTML = '';

        this.cards.forEach((card, index) => {
            const cardElement = this.createMemoryCardElement(card, index);
            this.gridContainer.appendChild(cardElement);
        });
    }

    /**
     * Create a memory card element
     * @param {Card} card - The card object
     * @param {number} index - Card position in grid
     * @returns {HTMLElement} Card element
     */
    createMemoryCardElement(card, index) {
        const cardEl = document.createElement('div');
        cardEl.className = `card memory-card ${card.isRed() ? 'red' : 'black'}`;
        cardEl.dataset.memoryId = card.memoryId;
        cardEl.dataset.pairId = card.pairId;
        cardEl.dataset.index = index;

        // Create card face
        const faceEl = document.createElement('div');
        faceEl.className = 'card-face';
        
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
        this.tryLoadCardImageForMemory(card, faceEl);

        // Create card back
        const backEl = document.createElement('div');
        backEl.className = 'card-back';
        
        // Add memory game symbol on back
        const symbolEl = document.createElement('div');
        symbolEl.className = 'memory-symbol';
        symbolEl.textContent = '?';
        backEl.appendChild(symbolEl);

        cardEl.appendChild(faceEl);
        cardEl.appendChild(backEl);

        // Add click handler
        cardEl.addEventListener('click', () => this.handleCardClick(card, cardEl));

        return cardEl;
    }

    /**
     * Try to load card image with multiple formats (Memory game version)
     * @param {Card} card - Card object
     * @param {HTMLElement} faceEl - Card face element
     */
    tryLoadCardImageForMemory(card, faceEl) {
        // Create possible paths for this card
        const basePath = `assets/cards/suits/${card.suit}/${card.rank}`;
        const possiblePaths = [
            `${basePath}.png`,
            `${basePath}.jpg`, 
            `${basePath}.jpeg`,
            `${basePath}.webp`
        ];
        
        let pathIndex = 0;
        
        const tryNextPath = () => {
            if (pathIndex >= possiblePaths.length) {
                console.log(`❌ No card image found for ${card.getDisplayName()} - using text fallback`);
                return;
            }
            
            const imagePath = possiblePaths[pathIndex];
            const testImg = new Image();
            
            console.log(`🎴 Memory game trying to load card image: ${imagePath} for ${card.getDisplayName()}`);
            
            testImg.onload = () => {
                console.log(`✅ Memory game card image loaded successfully: ${imagePath}`);
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
     * Show all cards briefly at the start
     */
    async showAllCards() {
        console.log('👀 Showing all cards for preview...');
        
        // Flip all cards face up
        const cardElements = this.gridContainer.querySelectorAll('.card');
        cardElements.forEach(cardEl => {
            cardEl.classList.add('face-up');
        });

        // Wait for show time
        await new Promise(resolve => {
            this.showTimer = setTimeout(() => {
                // Flip all cards back down
                cardElements.forEach(cardEl => {
                    cardEl.classList.remove('face-up');
                });
                
                // Enable clicking
                cardElements.forEach(cardEl => {
                    cardEl.style.pointerEvents = 'auto';
                });
                
                this.startGame();
                resolve();
            }, this.showTime);
        });
    }

    /**
     * Start the actual game
     */
    startGame() {
        console.log('🎮 Starting Memory Match game...');
        
        this.state = 'playing';
        this.startTime = Date.now();
        this.startTimer();
        this.playSound('game-start');
        
        this.showMessage('Find the matching pairs!', 'info', 2000);
    }

    /**
     * Handle card click
     * @param {Card} card - The clicked card
     * @param {HTMLElement} cardElement - The card DOM element
     */
    handleCardClick(card, cardElement) {
        if (this.state !== 'playing') return;
        if (cardElement.classList.contains('face-up')) return;
        if (cardElement.classList.contains('matched')) return;
        if (this.flippedCards.length >= 2) return;

        // Flip the card
        this.flipCardUp(cardElement, card);
        this.flippedCards.push({ card, element: cardElement });
        
        this.playSound('card-flip');

        // Check for match when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateMoves();
            
            setTimeout(() => {
                this.checkForMatch();
            }, 1000); // Give time to see both cards
        }
    }

    /**
     * Flip a card face up
     * @param {HTMLElement} cardElement - Card element
     * @param {Card} card - Card object
     */
    flipCardUp(cardElement, card) {
        cardElement.classList.add('face-up', 'flipping');
        card.turnFaceUp();
        
        setTimeout(() => {
            cardElement.classList.remove('flipping');
        }, 300);
    }

    /**
     * Flip a card face down
     * @param {HTMLElement} cardElement - Card element
     * @param {Card} card - Card object
     */
    flipCardDown(cardElement, card) {
        cardElement.classList.add('flipping');
        
        setTimeout(() => {
            cardElement.classList.remove('face-up');
            card.turnFaceDown();
            
            setTimeout(() => {
                cardElement.classList.remove('flipping');
            }, 150);
        }, 150);
    }

    /**
     * Check if flipped cards match
     */
    checkForMatch() {
        const [first, second] = this.flippedCards;
        
        if (first.card.pairId === second.card.pairId) {
            // Match found!
            this.handleMatch(first, second);
        } else {
            // No match
            this.handleMismatch(first, second);
        }
        
        this.flippedCards = [];
    }

    /**
     * Handle matched pair
     * @param {Object} first - First card object
     * @param {Object} second - Second card object
     */
    handleMatch(first, second) {
        console.log('✅ Match found!');
        
        // Mark as matched
        first.element.classList.add('matched');
        second.element.classList.add('matched');
        
        // Add animation
        first.element.classList.add('animate-memory-match');
        second.element.classList.add('animate-memory-match');
        
        // Remove animation class after animation
        setTimeout(() => {
            first.element.classList.remove('animate-memory-match');
            second.element.classList.remove('animate-memory-match');
        }, 600);
        
        this.matchedPairs.push([first.card, second.card]);
        this.matches++;
        this.updateMatches();
        
        this.playSound('match');
        
        // Check for game completion
        if (this.matches === this.difficulties[this.gridSize].pairs) {
            setTimeout(() => {
                this.gameComplete();
            }, 1000);
        }
    }

    /**
     * Handle mismatched pair
     * @param {Object} first - First card object
     * @param {Object} second - Second card object
     */
    handleMismatch(first, second) {
        console.log('❌ No match');
        
        // Add mismatch animation
        first.element.classList.add('animate-memory-mismatch');
        second.element.classList.add('animate-memory-mismatch');
        
        // Flip cards back down
        setTimeout(() => {
            this.flipCardDown(first.element, first.card);
            this.flipCardDown(second.element, second.card);
            
            // Remove animation class
            first.element.classList.remove('animate-memory-mismatch');
            second.element.classList.remove('animate-memory-mismatch');
        }, 500);
        
        this.playSound('no-match');
    }

    /**
     * Handle game completion
     */
    gameComplete() {
        this.state = 'ended';
        this.stopTimer();
        
        const playTime = this.getPlayTime();
        const finalScore = this.calculateScore(playTime);
        
        console.log('🏆 Memory game completed!');
        
        this.playSound('game-win');
        
        // Show completion message
        this.showGameCompleteModal(finalScore, playTime);
        
        // End game
        this.end({
            won: true,
            score: finalScore,
            moves: this.moves,
            matches: this.matches,
            playTime: playTime,
            difficulty: this.gridSize,
            message: `Congratulations! You completed the memory game in ${this.moves} moves!`
        });
    }

    /**
     * Calculate score based on performance
     * @param {number} playTime - Time taken in milliseconds
     * @returns {number} Final score
     */
    calculateScore(playTime) {
        const difficulty = this.difficulties[this.gridSize];
        const baseScore = difficulty.pairs * 100;
        
        // Bonus for fewer moves
        const moveBonus = Math.max(0, (difficulty.pairs * 3 - this.moves) * 10);
        
        // Bonus for faster time (if under 2 minutes per pair)
        const timeTarget = difficulty.pairs * 2 * 60 * 1000; // 2 minutes per pair
        const timeBonus = Math.max(0, (timeTarget - playTime) / 1000);
        
        return Math.round(baseScore + moveBonus + timeBonus);
    }

    /**
     * Show game completion modal
     * @param {number} score - Final score
     * @param {number} playTime - Play time in milliseconds
     */
    showGameCompleteModal(score, playTime) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">🏆 Congratulations!</h2>
                </div>
                <div class="completion-stats">
                    <div class="stat-item">
                        <span class="stat-label">Final Score:</span>
                        <span class="stat-value">${score.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Time:</span>
                        <span class="stat-value">${this.formatTime(playTime)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Moves:</span>
                        <span class="stat-value">${this.moves}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Efficiency:</span>
                        <span class="stat-value">${this.calculateEfficiency()}%</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button id="play-again-btn" class="btn btn-primary">Play Again</button>
                    <button id="change-difficulty-btn" class="btn btn-secondary">Change Difficulty</button>
                    <button id="main-menu-btn" class="btn">Main Menu</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('play-again-btn').addEventListener('click', () => {
            modal.remove();
            this.reset();
        });

        document.getElementById('change-difficulty-btn').addEventListener('click', () => {
            modal.remove();
            this.showDifficultySelector();
        });

        document.getElementById('main-menu-btn').addEventListener('click', () => {
            modal.remove();
            // This would typically navigate back to main menu
        });
    }

    /**
     * Calculate efficiency percentage
     * @returns {number} Efficiency percentage
     */
    calculateEfficiency() {
        const difficulty = this.difficulties[this.gridSize];
        const perfectMoves = difficulty.pairs; // Minimum moves needed
        const efficiency = (perfectMoves / this.moves) * 100;
        return Math.round(efficiency);
    }

    /**
     * Show difficulty selector
     */
    showDifficultySelector() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Choose Difficulty</h2>
                </div>
                <div class="difficulty-options">
                    ${Object.entries(this.difficulties).map(([key, diff]) => `
                        <button class="difficulty-btn ${key === this.gridSize ? 'selected' : ''}" 
                                data-difficulty="${key}">
                            <div class="difficulty-name">${diff.name}</div>
                            <div class="difficulty-desc">${diff.pairs} pairs • ${diff.rows}×${diff.cols} grid</div>
                        </button>
                    `).join('')}
                </div>
                <div class="modal-actions">
                    <button id="start-new-game-btn" class="btn btn-primary">Start Game</button>
                    <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        let selectedDifficulty = this.gridSize;

        // Add event listeners
        modal.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedDifficulty = btn.dataset.difficulty;
            });
        });

        document.getElementById('start-new-game-btn').addEventListener('click', () => {
            modal.remove();
            this.gridSize = selectedDifficulty;
            this.reset();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            modal.remove();
        });
    }

    /**
     * Start game timer
     */
    startTimer() {
        this.gameTimer = setInterval(() => {
            if (this.state === 'playing') {
                this.updateTimer();
            }
        }, 1000);
    }

    /**
     * Stop game timer
     */
    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    /**
     * Update timer display
     */
    updateTimer() {
        if (this.timerElement && this.startTime) {
            const elapsed = Date.now() - this.startTime;
            this.timerElement.textContent = this.formatTime(elapsed);
        }
    }

    /**
     * Update moves display
     */
    updateMoves() {
        if (this.movesElement) {
            this.movesElement.textContent = this.moves;
        }
    }

    /**
     * Update matches display
     */
    updateMatches() {
        if (this.matchesElement) {
            this.matchesElement.textContent = `${this.matches}/${this.difficulties[this.gridSize].pairs}`;
        }
    }

    /**
     * Format time in MM:SS format
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} Formatted time string
     */
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Shuffle array in place
     * @param {Array} array - Array to shuffle
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Reset the game
     */
    reset() {
        console.log('🔄 Resetting Memory game...');
        
        this.stopTimer();
        
        if (this.showTimer) {
            clearTimeout(this.showTimer);
        }

        // Reset game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = [];
        this.moves = 0;
        this.matches = 0;
        this.startTime = null;

        // Re-initialize
        this.init();
    }

    /**
     * Pause the game
     */
    pause() {
        if (this.state !== 'playing') return false;
        
        super.pause();
        this.stopTimer();
        
        // Hide all face-up cards that aren't matched
        const cardElements = this.gridContainer.querySelectorAll('.card.face-up:not(.matched)');
        cardElements.forEach(cardEl => {
            cardEl.style.visibility = 'hidden';
        });
        
        this.showMessage('Game Paused', 'info');
        return true;
    }

    /**
     * Resume the game
     */
    resume() {
        if (this.state !== 'paused') return false;
        
        super.resume();
        this.startTimer();
        
        // Show all cards again
        const cardElements = this.gridContainer.querySelectorAll('.card');
        cardElements.forEach(cardEl => {
            cardEl.style.visibility = 'visible';
        });
        
        this.showMessage('Game Resumed', 'info', 1000);
        return true;
    }

    /**
     * Get game type
     */
    getGameType() {
        return 'memory';
    }

    /**
     * Get display name
     */
    getDisplayName() {
        return 'Memory Match';
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.stopTimer();
        
        if (this.showTimer) {
            clearTimeout(this.showTimer);
        }
        
        super.cleanup();
    }
}

export default Memory;