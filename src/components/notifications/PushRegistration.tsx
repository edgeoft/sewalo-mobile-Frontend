import React from 'react';
import { usePushRegistration } from '@/hooks/usePushRegistration';

export function PushRegistration(): React.ReactNode {
  usePushRegistration();
  return null;
}
