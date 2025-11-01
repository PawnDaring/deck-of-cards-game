/**
 * StorageManager.js - Local storage management for game data persistence
 * Handles saving and loading game settings, statistics, and game states
 */

export class StorageManager {
    constructor(prefix = 'cardgame_') {
        this.prefix = prefix;
        this.isSupported = this.checkSupport();
    }

    /**
     * Check if localStorage is supported and available
     * @returns {boolean} True if localStorage is available
     */
    checkSupport() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage not available:', error);
            return false;
        }
    }

    /**
     * Get the full key with prefix
     * @param {string} key - The key to prefix
     * @returns {string} Prefixed key
     */
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Save data to localStorage
     * @param {string} key - The key to save under
     * @param {*} data - The data to save (will be JSON stringified)
     * @returns {boolean} True if save was successful
     */
    save(key, data) {
        if (!this.isSupported) {
            console.warn('localStorage not supported, data not saved');
            return false;
        }

        try {
            const serializedData = JSON.stringify({
                data,
                timestamp: Date.now(),
                version: '1.0.0'
            });
            
            localStorage.setItem(this.getKey(key), serializedData);
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - The key to load
     * @returns {*} The loaded data, or null if not found or invalid
     */
    load(key) {
        if (!this.isSupported) {
            return null;
        }

        try {
            const serializedData = localStorage.getItem(this.getKey(key));
            
            if (!serializedData) {
                return null;
            }

            const parsedData = JSON.parse(serializedData);
            
            // Validate data structure
            if (typeof parsedData !== 'object' || !parsedData.hasOwnProperty('data')) {
                console.warn('Invalid data format for key:', key);
                return null;
            }

            return parsedData.data;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - The key to remove
     * @returns {boolean} True if removal was successful
     */
    remove(key) {
        if (!this.isSupported) {
            return false;
        }

        try {
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error('Failed to remove data:', error);
            return false;
        }
    }

    /**
     * Check if a key exists in localStorage
     * @param {string} key - The key to check
     * @returns {boolean} True if key exists
     */
    exists(key) {
        if (!this.isSupported) {
            return false;
        }

        return localStorage.getItem(this.getKey(key)) !== null;
    }

    /**
     * Get all keys with the current prefix
     * @returns {Array<string>} Array of keys (without prefix)
     */
    getAllKeys() {
        if (!this.isSupported) {
            return [];
        }

        const keys = [];
        const prefixLength = this.prefix.length;

        for (let i = 0; i < localStorage.length; i++) {
            const fullKey = localStorage.key(i);
            if (fullKey && fullKey.startsWith(this.prefix)) {
                keys.push(fullKey.substring(prefixLength));
            }
        }

        return keys;
    }

    /**
     * Clear all data with the current prefix
     * @returns {boolean} True if clear was successful
     */
    clear() {
        if (!this.isSupported) {
            return false;
        }

        try {
            const keys = this.getAllKeys();
            keys.forEach(key => this.remove(key));
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    }

    /**
     * Get the total size of stored data (approximate)
     * @returns {number} Size in bytes
     */
    getStorageSize() {
        if (!this.isSupported) {
            return 0;
        }

        let totalSize = 0;
        const keys = this.getAllKeys();

        keys.forEach(key => {
            const data = localStorage.getItem(this.getKey(key));
            if (data) {
                totalSize += data.length * 2; // Approximate: 2 bytes per character
            }
        });

        return totalSize;
    }

    /**
     * Export all data as a JSON object
     * @returns {Object} All stored data
     */
    export() {
        if (!this.isSupported) {
            return {};
        }

        const exportData = {};
        const keys = this.getAllKeys();

        keys.forEach(key => {
            const data = this.load(key);
            if (data !== null) {
                exportData[key] = data;
            }
        });

        return {
            data: exportData,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Import data from a JSON object
     * @param {Object} importData - The data to import
     * @param {boolean} overwrite - Whether to overwrite existing data
     * @returns {boolean} True if import was successful
     */
    import(importData, overwrite = false) {
        if (!this.isSupported) {
            return false;
        }

        try {
            if (!importData.data || typeof importData.data !== 'object') {
                console.error('Invalid import data format');
                return false;
            }

            const data = importData.data;

            Object.keys(data).forEach(key => {
                if (overwrite || !this.exists(key)) {
                    this.save(key, data[key]);
                }
            });

            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    /**
     * Save game state with compression for large objects
     * @param {string} key - The key to save under
     * @param {Object} gameState - The game state object
     * @returns {boolean} True if save was successful
     */
    saveGameState(key, gameState) {
        // Add metadata to game state
        const stateWithMeta = {
            ...gameState,
            savedAt: Date.now(),
            gameVersion: '1.0.0'
        };

        return this.save(`gamestate_${key}`, stateWithMeta);
    }

    /**
     * Load game state
     * @param {string} key - The key to load
     * @returns {Object|null} The game state or null if not found
     */
    loadGameState(key) {
        return this.load(`gamestate_${key}`);
    }

    /**
     * Save user settings
     * @param {Object} settings - The settings object
     * @returns {boolean} True if save was successful
     */
    saveSettings(settings) {
        return this.save('settings', settings);
    }

    /**
     * Load user settings
     * @returns {Object|null} The settings object or null if not found
     */
    loadSettings() {
        return this.load('settings');
    }

    /**
     * Save game statistics
     * @param {Object} stats - The statistics object
     * @returns {boolean} True if save was successful
     */
    saveStatistics(stats) {
        return this.save('statistics', stats);
    }

    /**
     * Load game statistics
     * @returns {Object|null} The statistics object or null if not found
     */
    loadStatistics() {
        return this.load('statistics');
    }

    /**
     * Save high scores
     * @param {Array} highScores - Array of high score objects
     * @returns {boolean} True if save was successful
     */
    saveHighScores(highScores) {
        return this.save('highscores', highScores);
    }

    /**
     * Load high scores
     * @returns {Array} Array of high score objects
     */
    loadHighScores() {
        return this.load('highscores') || [];
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage details
     */
    getUsageInfo() {
        if (!this.isSupported) {
            return {
                supported: false,
                used: 0,
                available: 0,
                total: 0,
                percentage: 0
            };
        }

        const used = this.getStorageSize();
        const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
        const available = total - used;
        const percentage = (used / total) * 100;

        return {
            supported: true,
            used,
            available,
            total,
            percentage: Math.round(percentage * 100) / 100
        };
    }

    /**
     * Clean up old or expired data
     * @param {number} maxAge - Maximum age in milliseconds (default: 30 days)
     * @returns {number} Number of items cleaned up
     */
    cleanup(maxAge = 30 * 24 * 60 * 60 * 1000) {
        if (!this.isSupported) {
            return 0;
        }

        let cleanedCount = 0;
        const cutoffTime = Date.now() - maxAge;
        const keys = this.getAllKeys();

        keys.forEach(key => {
            try {
                const rawData = localStorage.getItem(this.getKey(key));
                if (rawData) {
                    const parsedData = JSON.parse(rawData);
                    if (parsedData.timestamp && parsedData.timestamp < cutoffTime) {
                        this.remove(key);
                        cleanedCount++;
                    }
                }
            } catch (error) {
                // If we can't parse the data, it might be corrupted, so remove it
                this.remove(key);
                cleanedCount++;
            }
        });

        return cleanedCount;
    }
}

export default StorageManager;