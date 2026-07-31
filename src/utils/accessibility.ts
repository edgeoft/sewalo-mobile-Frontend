import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Post a message to the platform screen reader (TalkBack / VoiceOver).
 * Use for transient, important state changes that are not announced by default.
 */
export function announceForAccessibility(message: string): void {
  if (!message) return;
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Returns `true` when the user has requested reduced motion (iOS Reduce Motion /
 * Android "Remove animations"). Use it to disable autoplay and heavy animations.
 */
export function useAppReducedMotion(): boolean {
  const [reducesMotion, setReducesMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReducesMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (mounted) setReducesMotion(enabled);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reducesMotion;
}
