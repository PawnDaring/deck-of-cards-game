/**
 * Deck.js - Core Deck class for managing a collection of playing cards
 * Handles shuffling, dealing, and deck operations
 */

import Card from './Card.js';

export class Deck {
    /**
     * Create a new Deck
     * @param {Array<Card>} cards - Optional array of cards to initialize with
     * @param {boolean} shuffled - Whether to shuffle the deck on creation
     */
    constructor(cards = null, shuffled = true) {
        if (cards) {
            this.cards = [...cards]; // Create a copy
        } else {
            this.cards = this.createStandardDeck();
        }
        
        if (shuffled) {
            this.shuffle();
        }
        
        this.originalSize = this.cards.length;
        this.shuffleCount = shuffled ? 1 : 0;
    }

    /**
     * Create a standard 52-card deck
     * @returns {Array<Card>} Array of 52 cards
     */
    createStandardDeck() {
        return Card.getAllCards();
    }

    /**
     * Get the number of cards remaining in the deck
     * @returns {number} Number of cards in the deck
     */
    size() {
        return this.cards.length;
    }

    /**
     * Check if the deck is empty
     * @returns {boolean} True if no cards remain
     */
    isEmpty() {
        return this.cards.length === 0;
    }

    /**
     * Check if the deck has cards
     * @returns {boolean} True if cards remain
     */
    hasCards() {
        return this.cards.length > 0;
    }

    /**
     * Shuffle the deck using Fisher-Yates algorithm
     * @param {number} times - Number of times to shuffle (default: 1)
     */
    shuffle(times = 1) {
        for (let shuffleRound = 0; shuffleRound < times; shuffleRound++) {
            for (let i = this.cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
            }
        }
        this.shuffleCount += times;
    }

    /**
     * Deal a single card from the top of the deck
     * @param {boolean} faceUp - Whether the card should be face up
     * @returns {Card|null} The dealt card, or null if deck is empty
     */
    deal(faceUp = false) {
        if (this.isEmpty()) {
            return null;
        }
        
        const card = this.cards.pop();
        if (faceUp) {
            card.turnFaceUp();
        } else {
            card.turnFaceDown();
        }
        
        return card;
    }

    /**
     * Deal multiple cards from the deck
     * @param {number} count - Number of cards to deal
     * @param {boolean} faceUp - Whether cards should be face up
     * @returns {Array<Card>} Array of dealt cards
     */
    dealMultiple(count, faceUp = false) {
        const dealtCards = [];
        for (let i = 0; i < count && this.hasCards(); i++) {
            const card = this.deal(faceUp);
            if (card) {
                dealtCards.push(card);
            }
        }
        return dealtCards;
    }

    /**
     * Deal cards to multiple players
     * @param {number} playerCount - Number of players
     * @param {number} cardsPerPlayer - Cards to deal to each player
     * @param {boolean} faceUp - Whether cards should be face up
     * @returns {Array<Array<Card>>} Array of hands (each hand is an array of cards)
     */
    dealToPlayers(playerCount, cardsPerPlayer, faceUp = false) {
        const hands = Array(playerCount).fill(null).map(() => []);
        
        // Deal one card at a time to each player in round-robin fashion
        for (let round = 0; round < cardsPerPlayer; round++) {
            for (let player = 0; player < playerCount; player++) {
                const card = this.deal(faceUp);
                if (card) {
                    hands[player].push(card);
                } else {
                    // Not enough cards for all players
                    return hands;
                }
            }
        }
        
        return hands;
    }

    /**
     * Peek at the top card without removing it
     * @returns {Card|null} The top card, or null if deck is empty
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.cards[this.cards.length - 1];
    }

    /**
     * Peek at multiple cards from the top without removing them
     * @param {number} count - Number of cards to peek at
     * @returns {Array<Card>} Array of cards from the top
     */
    peekMultiple(count) {
        const startIndex = Math.max(0, this.cards.length - count);
        return this.cards.slice(startIndex);
    }

    /**
     * Add a card to the bottom of the deck
     * @param {Card} card - The card to add
     */
    addToBottom(card) {
        this.cards.unshift(card);
    }

    /**
     * Add a card to the top of the deck
     * @param {Card} card - The card to add
     */
    addToTop(card) {
        this.cards.push(card);
    }

    /**
     * Add multiple cards to the deck
     * @param {Array<Card>} cards - Cards to add
     * @param {string} position - 'top' or 'bottom' (default: 'bottom')
     * @param {boolean} shuffle - Whether to shuffle the added cards
     */
    addCards(cards, position = 'bottom', shuffle = false) {
        const cardsToAdd = shuffle ? this.shuffleArray([...cards]) : [...cards];
        
        if (position === 'top') {
            this.cards.push(...cardsToAdd);
        } else {
            this.cards.unshift(...cardsToAdd);
        }
    }

    /**
     * Remove a specific card from the deck
     * @param {Card} targetCard - The card to remove
     * @returns {Card|null} The removed card, or null if not found
     */
    removeCard(targetCard) {
        const index = this.cards.findIndex(card => card.equals(targetCard));
        if (index !== -1) {
            return this.cards.splice(index, 1)[0];
        }
        return null;
    }

    /**
     * Find cards matching specific criteria
     * @param {Function} predicate - Function to test each card
     * @returns {Array<Card>} Array of matching cards
     */
    findCards(predicate) {
        return this.cards.filter(predicate);
    }

    /**
     * Find cards by rank
     * @param {string} rank - The rank to find
     * @returns {Array<Card>} Array of matching cards
     */
    findByRank(rank) {
        return this.findCards(card => card.rank === rank);
    }

    /**
     * Find cards by suit
     * @param {string} suit - The suit to find
     * @returns {Array<Card>} Array of matching cards
     */
    findBySuit(suit) {
        return this.findCards(card => card.suit === suit);
    }

    /**
     * Find cards by color
     * @param {boolean} red - True for red cards, false for black cards
     * @returns {Array<Card>} Array of matching cards
     */
    findByColor(red = true) {
        return this.findCards(card => red ? card.isRed() : card.isBlack());
    }

    /**
     * Cut the deck at a specific position
     * @param {number} position - Position to cut (default: middle)
     */
    cut(position = null) {
        if (position === null) {
            position = Math.floor(this.cards.length / 2);
        }
        
        position = Math.max(0, Math.min(position, this.cards.length));
        
        const topHalf = this.cards.slice(position);
        const bottomHalf = this.cards.slice(0, position);
        
        this.cards = [...topHalf, ...bottomHalf];
    }

    /**
     * Reset the deck to its original state and shuffle
     */
    reset() {
        this.cards = this.createStandardDeck();
        this.shuffle();
        this.shuffleCount = 1;
    }

    /**
     * Create a copy of this deck
     * @returns {Deck} A new Deck instance with copied cards
     */
    clone() {
        const clonedCards = this.cards.map(card => card.clone());
        const clonedDeck = new Deck(clonedCards, false);
        clonedDeck.originalSize = this.originalSize;
        clonedDeck.shuffleCount = this.shuffleCount;
        return clonedDeck;
    }

    /**
     * Get statistics about the deck
     * @returns {Object} Deck statistics
     */
    getStats() {
        const suits = {};
        const ranks = {};
        let faceUpCount = 0;
        let redCards = 0;
        let blackCards = 0;
        let faceCards = 0;
        let aces = 0;
        
        this.cards.forEach(card => {
            // Count suits
            suits[card.suit] = (suits[card.suit] || 0) + 1;
            
            // Count ranks
            ranks[card.rank] = (ranks[card.rank] || 0) + 1;
            
            // Other statistics
            if (card.faceUp) faceUpCount++;
            if (card.isRed()) redCards++;
            if (card.isBlack()) blackCards++;
            if (card.isFaceCard()) faceCards++;
            if (card.isAce()) aces++;
        });
        
        return {
            totalCards: this.size(),
            originalSize: this.originalSize,
            shuffleCount: this.shuffleCount,
            suits,
            ranks,
            faceUpCount,
            faceDownCount: this.size() - faceUpCount,
            redCards,
            blackCards,
            faceCards,
            aces,
            isEmpty: this.isEmpty()
        };
    }

    /**
     * Sort the deck
     * @param {Function} compareFn - Optional comparison function
     */
    sort(compareFn = null) {
        if (compareFn) {
            this.cards.sort(compareFn);
        } else {
            // Default sort: by suit, then by rank
            this.cards.sort((a, b) => {
                const suitCompare = Card.sortBySuit()(a, b);
                if (suitCompare !== 0) return suitCompare;
                return Card.sortByRank()(a, b);
            });
        }
    }

    /**
     * Utility method to shuffle an array (Fisher-Yates)
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Convert deck to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            cards: this.cards.map(card => card.toJSON()),
            originalSize: this.originalSize,
            shuffleCount: this.shuffleCount
        };
    }

    /**
     * Create a Deck from JSON
     * @param {Object} json - JSON representation
     * @returns {Deck} New Deck instance
     */
    static fromJSON(json) {
        const cards = json.cards.map(cardData => Card.fromJSON(cardData));
        const deck = new Deck(cards, false);
        deck.originalSize = json.originalSize;
        deck.shuffleCount = json.shuffleCount;
        return deck;
    }

    /**
     * Create a deck with specific cards removed
     * @param {Array<Card>} cardsToRemove - Cards to exclude
     * @returns {Deck} New deck without the specified cards
     */
    static createWithoutCards(cardsToRemove) {
        const allCards = Card.getAllCards();
        const filteredCards = allCards.filter(card => 
            !cardsToRemove.some(removeCard => card.equals(removeCard))
        );
        return new Deck(filteredCards);
    }

    /**
     * Create a deck with only specific suits
     * @param {Array<string>} suits - Suits to include
     * @returns {Deck} New deck with only specified suits
     */
    static createWithSuits(suits) {
        const cards = Card.getAllCards().filter(card => 
            suits.includes(card.suit)
        );
        return new Deck(cards);
    }

    /**
     * Create a deck with only specific ranks
     * @param {Array<string>} ranks - Ranks to include
     * @returns {Deck} New deck with only specified ranks
     */
    static createWithRanks(ranks) {
        const cards = Card.getAllCards().filter(card => 
            ranks.includes(card.rank)
        );
        return new Deck(cards);
    }

    /**
     * String representation of the deck
     * @returns {string} String representation
     */
    toString() {
        return `Deck: ${this.size()} cards (shuffled ${this.shuffleCount} times)`;
    }
}

export default Deck;