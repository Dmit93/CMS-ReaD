type EventCallback = (...args: any[]) => void;

export class EventSystem {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   * @param event The event name to subscribe to
   * @param callback The callback function to execute when the event is triggered
   * @returns A function to unsubscribe from the event
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Subscribe to an event and unsubscribe after it's triggered once
   * @param event The event name to subscribe to
   * @param callback The callback function to execute when the event is triggered
   * @returns A function to unsubscribe from the event
   */
  once(event: string, callback: EventCallback): () => void {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      callback(...args);
    };

    return this.on(event, onceCallback);
  }

  /**
   * Unsubscribe from an event
   * @param event The event name to unsubscribe from
   * @param callback The callback function to remove
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Trigger an event
   * @param event The event name to trigger
   * @param args The arguments to pass to the event callbacks
   */
  emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Check if an event has listeners
   * @param event The event name to check
   * @returns True if the event has listeners, false otherwise
   */
  hasListeners(event: string): boolean {
    const callbacks = this.listeners.get(event);
    return !!callbacks && callbacks.size > 0;
  }

  /**
   * Get the number of listeners for an event
   * @param event The event name to check
   * @returns The number of listeners for the event
   */
  listenerCount(event: string): number {
    const callbacks = this.listeners.get(event);
    return callbacks ? callbacks.size : 0;
  }

  /**
   * Remove all listeners for an event or all events
   * @param event Optional event name to clear listeners for
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Create a singleton instance
const events = new EventSystem();

export default events;
