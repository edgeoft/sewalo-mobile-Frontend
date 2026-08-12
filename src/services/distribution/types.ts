export interface DistributionVersionInfo {
  version: string;
  buildNumber: string | number;
  isBeta: boolean;
  variant: string;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  latestVersion?: string;
  releaseNotes?: string;
  isMandatory?: boolean;
}

export interface IDistributionService {
  getVersionInfo(): DistributionVersionInfo;
  checkForUpdate(): Promise<UpdateCheckResult>;
  startTesterFeedback(): Promise<boolean>;
  isFeedbackSupported(): boolean;
}
