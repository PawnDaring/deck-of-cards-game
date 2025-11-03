/**
 * Card.js - Core Card class for the deck of cards application
 * Represents a single playing card with suit, rank, and utility methods
 */

export class Card {
    // Static constants for suits and ranks
    static SUITS = {
        SPADES: 'spades',
        HEARTS: 'hearts',
        DIAMONDS: 'diamonds',
        CLUBS: 'clubs'
    };

    static RANKS = {
        ACE: 'A',
        TWO: '2',
        THREE: '3',
        FOUR: '4',
        FIVE: '5',
        SIX: '6',
        SEVEN: '7',
        EIGHT: '8',
        NINE: '9',
        TEN: '10',
        JACK: 'J',
        QUEEN: 'Q',
        KING: 'K'
    };

    // Rank values for comparison (Ace low = 1, Ace high = 14)
    static RANK_VALUES = {
        'A': 1,   // Can also be 14 for Ace high
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        'J': 11,
        'Q': 12,
        'K': 13
    };

    static RANK_VALUES_ACE_HIGH = {
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        'J': 11,
        'Q': 12,
        'K': 13,
        'A': 14
    };

    /**
     * Create a new Card
     * @param {string} suit - The suit of the card (spades, hearts, diamonds, clubs)
     * @param {string} rank - The rank of the card (A, 2-10, J, Q, K)
     * @param {boolean} faceUp - Whether the card is face up (default: false)
     */
    constructor(suit, rank, faceUp = false) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = faceUp;
        this.id = `${suit}_${rank}`;
        
        // Validate suit and rank
        if (!Object.values(Card.SUITS).includes(suit)) {
            throw new Error(`Invalid suit: ${suit}`);
        }
        if (!Object.values(Card.RANKS).includes(rank)) {
            throw new Error(`Invalid rank: ${rank}`);
        }
    }

    /**
     * Get the numeric value of the card for comparison
     * @param {boolean} aceHigh - Whether Ace should be high (14) or low (1)
     * @returns {number} The numeric value of the card
     */
    getValue(aceHigh = false) {
        const values = aceHigh ? Card.RANK_VALUES_ACE_HIGH : Card.RANK_VALUES;
        return values[this.rank];
    }

    /**
     * Check if this card is red (hearts or diamonds)
     * @returns {boolean} True if the card is red
     */
    isRed() {
        return this.suit === Card.SUITS.HEARTS || this.suit === Card.SUITS.DIAMONDS;
    }

    /**
     * Check if this card is black (spades or clubs)
     * @returns {boolean} True if the card is black
     */
    isBlack() {
        return this.suit === Card.SUITS.SPADES || this.suit === Card.SUITS.CLUBS;
    }

    /**
     * Check if this card is a face card (J, Q, K)
     * @returns {boolean} True if the card is a face card
     */
    isFaceCard() {
        return ['J', 'Q', 'K'].includes(this.rank);
    }

    /**
     * Check if this card is an Ace
     * @returns {boolean} True if the card is an Ace
     */
    isAce() {
        return this.rank === 'A';
    }

    /**
     * Check if this card is a number card (2-10)
     * @returns {boolean} True if the card is a number card
     */
    isNumberCard() {
        return !this.isFaceCard() && !this.isAce();
    }

    /**
     * Flip the card (toggle face up/down)
     */
    flip() {
        this.faceUp = !this.faceUp;
    }

    /**
     * Turn the card face up
     */
    turnFaceUp() {
        this.faceUp = true;
    }

    /**
     * Turn the card face down
     */
    turnFaceDown() {
        this.faceUp = false;
    }

    /**
     * Get the display name of the card
     * @returns {string} Human-readable card name
     */
    getDisplayName() {
        const suitNames = {
            [Card.SUITS.SPADES]: 'Spades',
            [Card.SUITS.HEARTS]: 'Hearts',
            [Card.SUITS.DIAMONDS]: 'Diamonds',
            [Card.SUITS.CLUBS]: 'Clubs'
        };

        const rankNames = {
            'A': 'Ace',
            'J': 'Jack',
            'Q': 'Queen',
            'K': 'King'
        };

        const rankName = rankNames[this.rank] || this.rank;
        const suitName = suitNames[this.suit];
        
        return `${rankName} of ${suitName}`;
    }

    /**
     * Get the short display name of the card
     * @returns {string} Short card name (e.g., "AH", "KS")
     */
    getShortName() {
        const suitSymbols = {
            [Card.SUITS.SPADES]: '♠',
            [Card.SUITS.HEARTS]: '♥',
            [Card.SUITS.DIAMONDS]: '♦',
            [Card.SUITS.CLUBS]: '♣'
        };
        
        return `${this.rank}${suitSymbols[this.suit]}`;
    }

    /**
     * Get the image path for this card
     * @returns {string} Path to the card image
     */
    getImagePath() {
        if (!this.faceUp) {
            return 'assets/cards/back/default.png';
        }
        return `assets/cards/suits/${this.suit}/${this.rank}.png`;
    }

    /**
     * Get all possible image paths for this card (trying different extensions)
     * @returns {Array<string>} Array of possible image paths
     */
    getPossibleImagePaths() {
        if (!this.faceUp) {
            return ['assets/cards/back/default.png'];
        }
        const basePath = `assets/cards/suits/${this.suit}/${this.rank}`;
        return [
            `${basePath}.png`,
            `${basePath}.jpg`,
            `${basePath}.jpeg`,
            `${basePath}.webp`
        ];
    }

    /**
     * Compare this card to another card by rank
     * @param {Card} otherCard - The card to compare to
     * @param {boolean} aceHigh - Whether Ace should be high
     * @returns {number} -1 if this card is lower, 0 if equal, 1 if higher
     */
    compareRank(otherCard, aceHigh = false) {
        const thisValue = this.getValue(aceHigh);
        const otherValue = otherCard.getValue(aceHigh);
        
        if (thisValue < otherValue) return -1;
        if (thisValue > otherValue) return 1;
        return 0;
    }

    /**
     * Check if this card equals another card (same suit and rank)
     * @param {Card} otherCard - The card to compare to
     * @returns {boolean} True if the cards are equal
     */
    equals(otherCard) {
        return this.suit === otherCard.suit && this.rank === otherCard.rank;
    }

    /**
     * Check if this card has the same rank as another card
     * @param {Card} otherCard - The card to compare to
     * @returns {boolean} True if the ranks are the same
     */
    sameRank(otherCard) {
        return this.rank === otherCard.rank;
    }

    /**
     * Check if this card has the same suit as another card
     * @param {Card} otherCard - The card to compare to
     * @returns {boolean} True if the suits are the same
     */
    sameSuit(otherCard) {
        return this.suit === otherCard.suit;
    }

    /**
     * Check if this card has the same color as another card
     * @param {Card} otherCard - The card to compare to
     * @returns {boolean} True if the colors are the same
     */
    sameColor(otherCard) {
        return this.isRed() === otherCard.isRed();
    }

    /**
     * Create a copy of this card
     * @returns {Card} A new Card instance with the same properties
     */
    clone() {
        return new Card(this.suit, this.rank, this.faceUp);
    }

    /**
     * Convert the card to a JSON object
     * @returns {Object} JSON representation of the card
     */
    toJSON() {
        return {
            suit: this.suit,
            rank: this.rank,
            faceUp: this.faceUp,
            id: this.id
        };
    }

    /**
     * Create a Card from a JSON object
     * @param {Object} json - JSON representation of a card
     * @returns {Card} A new Card instance
     */
    static fromJSON(json) {
        const card = new Card(json.suit, json.rank, json.faceUp);
        return card;
    }

    /**
     * Create a random card
     * @param {boolean} faceUp - Whether the card should be face up
     * @returns {Card} A randomly generated card
     */
    static createRandom(faceUp = false) {
        const suits = Object.values(Card.SUITS);
        const ranks = Object.values(Card.RANKS);
        
        const randomSuit = suits[Math.floor(Math.random() * suits.length)];
        const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
        
        return new Card(randomSuit, randomRank, faceUp);
    }

    /**
     * Get all possible cards in a standard deck
     * @returns {Array<Card>} Array of all 52 cards
     */
    static getAllCards() {
        const cards = [];
        for (const suit of Object.values(Card.SUITS)) {
            for (const rank of Object.values(Card.RANKS)) {
                cards.push(new Card(suit, rank));
            }
        }
        return cards;
    }

    /**
     * Sort function for cards by rank
     * @param {boolean} aceHigh - Whether Ace should be high
     * @returns {Function} Sort function for Array.sort()
     */
    static sortByRank(aceHigh = false) {
        return (a, b) => a.compareRank(b, aceHigh);
    }

    /**
     * Sort function for cards by suit
     * @returns {Function} Sort function for Array.sort()
     */
    static sortBySuit() {
        const suitOrder = [Card.SUITS.SPADES, Card.SUITS.HEARTS, Card.SUITS.DIAMONDS, Card.SUITS.CLUBS];
        return (a, b) => {
            const aSuitIndex = suitOrder.indexOf(a.suit);
            const bSuitIndex = suitOrder.indexOf(b.suit);
            return aSuitIndex - bSuitIndex;
        };
    }

    /**
     * String representation of the card
     * @returns {string} String representation
     */
    toString() {
        return this.getDisplayName();
    }
}

// Export as default for easier importing
export default Card;