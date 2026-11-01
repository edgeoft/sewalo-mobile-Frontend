import { useEffect, useRef, useState } from 'react';

export interface DeferredLoadingOptions {
  /** Milliseconds to wait before showing the loader. Defaults to 300ms. */
  delayMs?: number;
  /** Minimum milliseconds to keep loader visible once displayed, preventing flicker. Defaults to 500ms. */
  minDisplayMs?: number;
}

/**
 * Implements the "Delay, then commit" pattern (Rule 04):
 * - Wait 300ms before showing a loader to eliminate flashing for instant responses.
 * - Once shown, commit to displaying it for at least 500ms to prevent visual jitter.
 */
export function useDeferredLoading(
  isLoading: boolean,
  { delayMs = 300, minDisplayMs = 500 }: DeferredLoadingOptions = {},
): boolean {
  const [shouldShow, setShouldShow] = useState(false);
  const showTimeRef = useRef<number | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Clear any pending removal timer
      if (minTimerRef.current) {
        clearTimeout(minTimerRef.current);
        minTimerRef.current = null;
      }

      // Schedule showing after delayMs
      delayTimerRef.current = setTimeout(() => {
        showTimeRef.current = Date.now();
        setShouldShow(true);
      }, delayMs);
    } else {
      // Loading finished. Clear pending show timer if it hasn't fired yet
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }

      // If it was already shown, ensure it stays for at least minDisplayMs
      if (showTimeRef.current !== null) {
        const elapsed = Date.now() - showTimeRef.current;
        const remaining = Math.max(0, minDisplayMs - elapsed);

        if (remaining > 0) {
          minTimerRef.current = setTimeout(() => {
            showTimeRef.current = null;
            setShouldShow(false);
          }, remaining);
        } else {
          showTimeRef.current = null;
          setShouldShow(false);
        }
      } else {
        setShouldShow(false);
      }
    }

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
    };
  }, [isLoading, delayMs, minDisplayMs]);

  return shouldShow;
}
