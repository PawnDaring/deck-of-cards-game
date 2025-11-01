/**
 * DeckBrowser.js - Deck browser for exploring all 52 cards
 * Allows users to view, sort, and filter the entire deck
 */

import Card from '../core/Card.js';
import Deck from '../core/Deck.js';
import { GameEngine } from '../core/GameEngine.js';

export class DeckBrowser extends GameEngine {
    constructor(options = {}) {
        super(options);
        
        // Browser properties
        this.deck = new Deck(null, false); // Don't shuffle for browsing
        this.filteredCards = [];
        this.currentView = 'grid'; // 'grid' or 'list'
        this.selectedCard = null;
        this.allFaceUp = true; // Show cards face-up by default in browser
        
        // Filter settings
        this.filters = {
            suit: 'all',
            rank: 'all',
            color: 'all'
        };
        this.sortBy = 'suit-rank';
        
        // UI elements
        this.deckDisplay = null;
        this.cardDetailsPanel = null;
    }

    /**
     * Initialize the deck browser
     */
    async init() {
        console.log('🔍 Initializing Deck Browser...');
        
        await super.init();
        
        this.setupUI();
        this.setupEventListeners();
        this.applyFiltersAndSort();
        this.renderCards();
        
        this.state = 'ready';
        console.log('✅ Deck Browser initialized');
    }

    /**
     * Setup the browser UI elements
     */
    setupUI() {
        if (!this.container) {
            console.error('No container provided for Deck Browser');
            return;
        }

        // Get UI elements
        this.deckDisplay = document.getElementById('deck-display');
        this.cardDetailsPanel = document.getElementById('card-details');
        
        if (!this.deckDisplay) {
            console.error('Deck display element not found');
            return;
        }

        // Set initial view
        this.updateView();
    }

    /**
     * Setup event listeners for browser controls
     */
    setupEventListeners() {
        // Filter controls
        const suitFilter = document.getElementById('suit-filter');
        const rankFilter = document.getElementById('rank-filter');
        const colorFilter = document.getElementById('color-filter');
        
        if (suitFilter) {
            suitFilter.addEventListener('change', (e) => {
                this.filters.suit = e.target.value;
                this.applyFiltersAndSort();
                this.renderCards();
            });
        }
        
        if (rankFilter) {
            rankFilter.addEventListener('change', (e) => {
                this.filters.rank = e.target.value;
                this.applyFiltersAndSort();
                this.renderCards();
            });
        }
        
        if (colorFilter) {
            colorFilter.addEventListener('change', (e) => {
                this.filters.color = e.target.value;
                this.applyFiltersAndSort();
                this.renderCards();
            });
        }

        // Sort control
        const sortBy = document.getElementById('sort-by');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFiltersAndSort();
                this.renderCards();
            });
        }

        // View controls
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');
        
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                this.setView('grid');
            });
        }
        
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => {
                this.setView('list');
            });
        }

        // Action buttons
        const flipAllBtn = document.getElementById('flip-all-btn');
        const resetFiltersBtn = document.getElementById('reset-filters-btn');
        
        if (flipAllBtn) {
            flipAllBtn.addEventListener('click', () => {
                this.toggleAllCards();
            });
        }
        
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }

    /**
     * Apply filters and sorting to the deck
     */
    applyFiltersAndSort() {
        // Start with all cards
        this.filteredCards = [...this.deck.cards];

        // Apply suit filter
        if (this.filters.suit !== 'all') {
            this.filteredCards = this.filteredCards.filter(card => 
                card.suit === this.filters.suit
            );
        }

        // Apply rank filter
        if (this.filters.rank !== 'all') {
            const ranks = this.filters.rank.split(',');
            this.filteredCards = this.filteredCards.filter(card => 
                ranks.includes(card.rank)
            );
        }

        // Apply color filter
        if (this.filters.color !== 'all') {
            this.filteredCards = this.filteredCards.filter(card => {
                const isRed = card.isRed();
                return this.filters.color === 'red' ? isRed : !isRed;
            });
        }

        // Apply sorting
        this.sortCards();

        // Update cards shown count
        const cardsShownEl = document.getElementById('cards-shown');
        if (cardsShownEl) {
            cardsShownEl.textContent = this.filteredCards.length;
        }
    }

    /**
     * Sort cards based on current sort setting
     */
    sortCards() {
        switch (this.sortBy) {
            case 'suit-rank':
                this.filteredCards.sort((a, b) => {
                    const suitOrder = ['spades', 'hearts', 'diamonds', 'clubs'];
                    const suitCompare = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
                    if (suitCompare !== 0) return suitCompare;
                    return a.getValue() - b.getValue();
                });
                break;
                
            case 'rank-suit':
                this.filteredCards.sort((a, b) => {
                    const rankCompare = a.getValue() - b.getValue();
                    if (rankCompare !== 0) return rankCompare;
                    const suitOrder = ['spades', 'hearts', 'diamonds', 'clubs'];
                    return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
                });
                break;
                
            case 'color-suit':
                this.filteredCards.sort((a, b) => {
                    const colorCompare = (a.isRed() ? 1 : 0) - (b.isRed() ? 1 : 0);
                    if (colorCompare !== 0) return colorCompare;
                    const suitOrder = ['spades', 'clubs', 'hearts', 'diamonds'];
                    return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
                });
                break;
                
            case 'shuffle':
                this.shuffleArray(this.filteredCards);
                break;
        }
    }

    /**
     * Render cards in the current view
     */
    renderCards() {
        if (!this.deckDisplay) return;

        this.deckDisplay.innerHTML = '';
        
        if (this.currentView === 'grid') {
            this.renderGridView();
        } else {
            this.renderListView();
        }
    }

    /**
     * Render cards in grid view
     */
    renderGridView() {
        this.filteredCards.forEach((card, index) => {
            const cardElement = this.createBrowserCardElement(card, index);
            this.deckDisplay.appendChild(cardElement);
        });
    }

    /**
     * Render cards in list view
     */
    renderListView() {
        this.filteredCards.forEach((card, index) => {
            const listItem = this.createListItemElement(card, index);
            this.deckDisplay.appendChild(listItem);
        });
    }

    /**
     * Create a card element for the browser
     * @param {Card} card - The card object
     * @param {number} index - Card index
     * @returns {HTMLElement} Card element
     */
    createBrowserCardElement(card, index) {
        const cardEl = this.createCardElement(card, { size: 'small' });
        cardEl.classList.add('browser-card');
        cardEl.dataset.cardIndex = index;
        
        // Set face up/down based on current state
        if (this.allFaceUp || card.faceUp) {
            cardEl.classList.add('face-up');
            card.turnFaceUp();
        } else {
            cardEl.classList.remove('face-up');
            card.turnFaceDown();
        }
        
        // Add click handler
        cardEl.addEventListener('click', () => {
            this.selectCard(card, cardEl);
        });
        
        return cardEl;
    }

    /**
     * Create a list item element for list view
     * @param {Card} card - The card object
     * @param {number} index - Card index
     * @returns {HTMLElement} List item element
     */
    createListItemElement(card, index) {
        const listItem = document.createElement('div');
        listItem.className = 'card-list-item';
        listItem.dataset.cardIndex = index;
        
        // Create mini card
        const miniCard = this.createCardElement(card, { size: 'small' });
        miniCard.classList.add('face-up'); // Always show face up in list
        
        // Create info section
        const infoEl = document.createElement('div');
        infoEl.className = 'card-list-info';
        
        const nameEl = document.createElement('div');
        nameEl.className = 'card-list-name';
        nameEl.textContent = card.getDisplayName();
        
        const detailsEl = document.createElement('div');
        detailsEl.className = 'card-list-details';
        detailsEl.textContent = `${card.isRed() ? 'Red' : 'Black'} • Value: ${card.getValue()} • ${card.isFaceCard() ? 'Face Card' : card.isAce() ? 'Ace' : 'Number Card'}`;
        
        infoEl.appendChild(nameEl);
        infoEl.appendChild(detailsEl);
        
        listItem.appendChild(miniCard);
        listItem.appendChild(infoEl);
        
        // Add click handler
        listItem.addEventListener('click', () => {
            this.selectCard(card, listItem);
        });
        
        return listItem;
    }

    /**
     * Select a card and show details
     * @param {Card} card - Selected card
     * @param {HTMLElement} element - Card element
     */
    selectCard(card, element) {
        // Remove previous selection
        document.querySelectorAll('.browser-card.selected, .card-list-item.selected')
            .forEach(el => el.classList.remove('selected'));
        
        // Select current card
        element.classList.add('selected');
        this.selectedCard = card;
        
        // Show card details
        this.showCardDetails(card);
        
        this.playSound('card-flip');
    }

    /**
     * Show detailed information about a card
     * @param {Card} card - Card to show details for
     */
    showCardDetails(card) {
        if (!this.cardDetailsPanel) return;

        const largeCard = this.createCardElement(card, { size: 'large' });
        largeCard.classList.add('face-up');
        
        this.cardDetailsPanel.innerHTML = `
            <div class="card-details-header">
                <div class="large-card-container"></div>
                <div class="card-details-info">
                    <h3>${card.getDisplayName()}</h3>
                    <p>Click and explore this card's properties below.</p>
                </div>
            </div>
            
            <div class="card-details-properties">
                <div class="property-item">
                    <span class="property-label">Short Name:</span>
                    <span class="property-value">${card.getShortName()}</span>
                </div>
                <div class="property-item">
                    <span class="property-label">Suit:</span>
                    <span class="property-value">${this.getSuitSymbol(card.suit)} ${card.suit.charAt(0).toUpperCase() + card.suit.slice(1)}</span>
                </div>
                <div class="property-item">
                    <span class="property-label">Rank:</span>
                    <span class="property-value">${card.rank}</span>
                </div>
                <div class="property-item">
                    <span class="property-label">Color:</span>
                    <span class="property-value" style="color: ${card.isRed() ? '#e74c3c' : '#2c3e50'}">${card.isRed() ? 'Red' : 'Black'}</span>
                </div>
                <div class="property-item">
                    <span class="property-label">Value (Ace Low):</span>
                    <span class="property-value">${card.getValue(false)}</span>
                </div>
                <div class="property-item">
                    <span class="property-label">Value (Ace High):</span>
                    <span class="property-value">${card.getValue(true)}</span>
                </div>
                <div class="property-item">
                    <span class="property-label">Type:</span>
                    <span class="property-value">${card.isFaceCard() ? 'Face Card' : card.isAce() ? 'Ace' : 'Number Card'}</span>
                </div>
                <div class="property-item">
                    <span class="property-label">Card ID:</span>
                    <span class="property-value">${card.id}</span>
                </div>
            </div>
        `;
        
        // Add the large card
        const cardContainer = this.cardDetailsPanel.querySelector('.large-card-container');
        if (cardContainer) {
            cardContainer.appendChild(largeCard);
        }
        
        this.cardDetailsPanel.classList.add('active');
        this.cardDetailsPanel.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Toggle all cards face up/down
     */
    toggleAllCards() {
        this.allFaceUp = !this.allFaceUp;
        
        // Update button text
        const flipAllBtn = document.getElementById('flip-all-btn');
        if (flipAllBtn) {
            flipAllBtn.textContent = this.allFaceUp ? 'Flip All Face Down' : 'Flip All Face Up';
        }
        
        // Update all cards
        this.deck.cards.forEach(card => {
            if (this.allFaceUp) {
                card.turnFaceUp();
            } else {
                card.turnFaceDown();
            }
        });
        
        this.renderCards();
        this.playSound('card-shuffle');
    }

    /**
     * Reset all filters to default
     */
    resetFilters() {
        this.filters = {
            suit: 'all',
            rank: 'all',
            color: 'all'
        };
        this.sortBy = 'suit-rank';
        
        // Reset UI controls
        const suitFilter = document.getElementById('suit-filter');
        const rankFilter = document.getElementById('rank-filter');
        const colorFilter = document.getElementById('color-filter');
        const sortBy = document.getElementById('sort-by');
        
        if (suitFilter) suitFilter.value = 'all';
        if (rankFilter) rankFilter.value = 'all';
        if (colorFilter) colorFilter.value = 'all';
        if (sortBy) sortBy.value = 'suit-rank';
        
        this.applyFiltersAndSort();
        this.renderCards();
        
        // Hide card details
        if (this.cardDetailsPanel) {
            this.cardDetailsPanel.classList.remove('active');
        }
        
        this.playSound('button-click');
    }

    /**
     * Set the view mode (grid or list)
     * @param {string} view - 'grid' or 'list'
     */
    setView(view) {
        this.currentView = view;
        this.updateView();
        this.renderCards();
        
        this.playSound('button-click');
    }

    /**
     * Update view-related UI elements
     */
    updateView() {
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(`${this.currentView}-view-btn`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update deck display class
        if (this.deckDisplay) {
            this.deckDisplay.className = this.currentView === 'grid' ? 'deck-grid' : 'deck-list';
        }
    }

    /**
     * Utility method to shuffle an array
     * @param {Array} array - Array to shuffle
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Get game type
     */
    getGameType() {
        return 'deck-browser';
    }

    /**
     * Get display name
     */
    getDisplayName() {
        return 'Deck Browser';
    }

    /**
     * Start method (not really needed for browser, but required by base class)
     */
    start() {
        this.state = 'playing';
        return true;
    }

    /**
     * Reset the browser
     */
    reset() {
        this.resetFilters();
        this.selectedCard = null;
        this.allFaceUp = true; // Default to face-up in browser
        
        const flipAllBtn = document.getElementById('flip-all-btn');
        if (flipAllBtn) {
            flipAllBtn.textContent = 'Flip All Face Down';
        }
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.cardDetailsPanel) {
            this.cardDetailsPanel.classList.remove('active');
        }
        
        super.cleanup();
    }
}

export default DeckBrowser;