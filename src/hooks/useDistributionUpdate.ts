import { useState, useCallback } from 'react';
import { distributionService, UpdateCheckResult, DistributionVersionInfo } from '@/services/distribution';

export function useDistributionUpdate() {
  const [isChecking, setIsChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);

  const versionInfo: DistributionVersionInfo = distributionService.getVersionInfo();
  const isFeedbackSupported = distributionService.isFeedbackSupported();

  const checkForUpdate = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await distributionService.checkForUpdate();
      setUpdateInfo(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const startFeedback = useCallback(async () => {
    return distributionService.startTesterFeedback();
  }, []);

  return {
    versionInfo,
    version: versionInfo.version,
    buildNumber: versionInfo.buildNumber,
    isBeta: versionInfo.isBeta,
    variant: versionInfo.variant,
    isChecking,
    updateInfo,
    isUpdateAvailable: Boolean(updateInfo?.updateAvailable),
    isFeedbackSupported,
    checkForUpdate,
    startFeedback,
  };
}
