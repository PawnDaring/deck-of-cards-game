/**
 * EventManager.js - Centralized event management system
 * Handles custom events and event delegation throughout the application
 */

export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.delegatedListeners = new Map();
    }

    /**
     * Add an event listener
     * @param {string} eventType - The event type to listen for
     * @param {Function} callback - The callback function
     * @param {Object} options - Optional event options
     */
    on(eventType, callback, options = {}) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        
        const listener = {
            callback,
            options,
            once: options.once || false
        };
        
        this.listeners.get(eventType).add(listener);
        
        return () => this.off(eventType, callback);
    }

    /**
     * Remove an event listener
     * @param {string} eventType - The event type
     * @param {Function} callback - The callback function to remove
     */
    off(eventType, callback) {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            for (const listener of listeners) {
                if (listener.callback === callback) {
                    listeners.delete(listener);
                    break;
                }
            }
            
            if (listeners.size === 0) {
                this.listeners.delete(eventType);
            }
        }
    }

    /**
     * Add a one-time event listener
     * @param {string} eventType - The event type
     * @param {Function} callback - The callback function
     */
    once(eventType, callback) {
        return this.on(eventType, callback, { once: true });
    }

    /**
     * Emit a custom event
     * @param {string} eventType - The event type to emit
     * @param {*} data - Data to pass with the event
     */
    emit(eventType, data = null) {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            const listenersToRemove = [];
            
            for (const listener of listeners) {
                try {
                    listener.callback(data);
                    
                    if (listener.once) {
                        listenersToRemove.push(listener);
                    }
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            }
            
            // Remove one-time listeners
            listenersToRemove.forEach(listener => listeners.delete(listener));
        }
    }

    /**
     * Set up delegated event listening on a container
     * @param {HTMLElement} container - The container element
     * @param {string} selector - CSS selector for target elements
     * @param {string} eventType - The event type to listen for
     * @param {Function} callback - The callback function
     */
    delegate(container, selector, eventType, callback) {
        const delegatedCallback = (event) => {
            const target = event.target.closest(selector);
            if (target && container.contains(target)) {
                callback(event, target);
            }
        };
        
        container.addEventListener(eventType, delegatedCallback);
        
        // Store for cleanup
        const key = `${container}_${selector}_${eventType}`;
        this.delegatedListeners.set(key, {
            container,
            eventType,
            callback: delegatedCallback
        });
        
        return () => this.undelegate(container, selector, eventType);
    }

    /**
     * Remove delegated event listener
     * @param {HTMLElement} container - The container element
     * @param {string} selector - CSS selector
     * @param {string} eventType - The event type
     */
    undelegate(container, selector, eventType) {
        const key = `${container}_${selector}_${eventType}`;
        const listener = this.delegatedListeners.get(key);
        
        if (listener) {
            listener.container.removeEventListener(listener.eventType, listener.callback);
            this.delegatedListeners.delete(key);
        }
    }

    /**
     * Remove all event listeners
     */
    removeAllListeners() {
        this.listeners.clear();
        
        // Clean up delegated listeners
        for (const listener of this.delegatedListeners.values()) {
            listener.container.removeEventListener(listener.eventType, listener.callback);
        }
        this.delegatedListeners.clear();
    }

    /**
     * Get the number of listeners for an event type
     * @param {string} eventType - The event type
     * @returns {number} Number of listeners
     */
    getListenerCount(eventType) {
        const listeners = this.listeners.get(eventType);
        return listeners ? listeners.size : 0;
    }

    /**
     * Check if there are any listeners for an event type
     * @param {string} eventType - The event type
     * @returns {boolean} True if there are listeners
     */
    hasListeners(eventType) {
        return this.getListenerCount(eventType) > 0;
    }

    /**
     * Get all registered event types
     * @returns {Array<string>} Array of event types
     */
    getEventTypes() {
        return Array.from(this.listeners.keys());
    }
}

export default EventManager;