type EventCallback = (...args: any[]) => void;

type EventMap = {
  // Lifecycle events
  "cms:beforeInit": [];
  "cms:afterInit": [];
  "cms:beforeRender": [];
  "cms:afterRender": [];

  // Content events
  "content:beforeCreate": [content: any];
  "content:afterCreate": [content: any];
  "content:beforeUpdate": [content: any, newContent: any];
  "content:afterUpdate": [content: any];
  "content:beforeDelete": [contentId: string];
  "content:afterDelete": [contentId: string];

  // Media events
  "media:beforeUpload": [file: File];
  "media:afterUpload": [media: any];
  "media:beforeDelete": [mediaId: string];
  "media:afterDelete": [mediaId: string];

  // User events
  "user:beforeLogin": [credentials: any];
  "user:afterLogin": [user: any];
  "user:beforeLogout": [user: any];
  "user:afterLogout": [];

  // Plugin events
  "plugin:beforeInstall": [pluginId: string];
  "plugin:afterInstall": [plugin: any];
  "plugin:beforeUninstall": [pluginId: string];
  "plugin:afterUninstall": [pluginId: string];
  "plugin:beforeActivate": [pluginId: string];
  "plugin:afterActivate": [plugin: any];
  "plugin:beforeDeactivate": [pluginId: string];
  "plugin:afterDeactivate": [pluginId: string];

  // Custom events can be added by plugins
  [key: string]: any[];
};

type EventName = keyof EventMap;

class EventSystem {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   * @param event The event name to subscribe to
   * @param callback The callback function to execute when the event is triggered
   * @returns A function to unsubscribe from the event
   */
  on<T extends EventName>(
    event: T,
    callback: (...args: EventMap[T]) => void,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(callback as EventCallback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback as EventCallback);
    };
  }

  /**
   * Subscribe to an event and unsubscribe after it's triggered once
   * @param event The event name to subscribe to
   * @param callback The callback function to execute when the event is triggered
   * @returns A function to unsubscribe from the event
   */
  once<T extends EventName>(
    event: T,
    callback: (...args: EventMap[T]) => void,
  ): () => void {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      (callback as EventCallback)(...args);
    };

    return this.on(event, onceCallback as any);
  }

  /**
   * Unsubscribe from an event
   * @param event The event name to unsubscribe from
   * @param callback The callback function to remove
   */
  off<T extends EventName>(
    event: T,
    callback: (...args: EventMap[T]) => void,
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
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
  emit<T extends EventName>(event: T, ...args: EventMap[T]): void {
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
  hasListeners(event: EventName): boolean {
    const callbacks = this.listeners.get(event);
    return !!callbacks && callbacks.size > 0;
  }

  /**
   * Get the number of listeners for an event
   * @param event The event name to check
   * @returns The number of listeners for the event
   */
  listenerCount(event: EventName): number {
    const callbacks = this.listeners.get(event);
    return callbacks ? callbacks.size : 0;
  }

  /**
   * Remove all listeners for an event or all events
   * @param event Optional event name to clear listeners for
   */
  removeAllListeners(event?: EventName): void {
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
