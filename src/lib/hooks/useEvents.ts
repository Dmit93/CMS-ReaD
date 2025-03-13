import { useEffect } from "react";
import events from "../events";
import type { EventMap } from "../events";

/**
 * Hook to subscribe to events
 * @param event The event name to subscribe to
 * @param callback The callback function to execute when the event is triggered
 */
export function useEvent<T extends keyof EventMap>(
  event: T,
  callback: (...args: EventMap[T]) => void,
) {
  useEffect(() => {
    // Subscribe to the event
    const unsubscribe = events.on(event, callback as any);

    // Unsubscribe when the component unmounts
    return unsubscribe;
  }, [event, callback]);
}

/**
 * Hook to subscribe to an event once
 * @param event The event name to subscribe to
 * @param callback The callback function to execute when the event is triggered
 */
export function useEventOnce<T extends keyof EventMap>(
  event: T,
  callback: (...args: EventMap[T]) => void,
) {
  useEffect(() => {
    // Subscribe to the event once
    const unsubscribe = events.once(event, callback as any);

    // Unsubscribe when the component unmounts
    return unsubscribe;
  }, [event, callback]);
}

/**
 * Hook to emit an event
 * @param event The event name to emit
 * @param args The arguments to pass to the event callbacks
 */
export function useEmitEvent<T extends keyof EventMap>(
  event: T,
  ...args: EventMap[T]
) {
  return () => events.emit(event, ...args);
}

export default {
  useEvent,
  useEventOnce,
  useEmitEvent,
};
