import { createMutationHook } from '@/api/client/query/factory';
import type { UploadFileResponse, UploadFilePayload } from '@/types';
import { uploadFileAction } from './actions';

/**
 * Hook to execute file upload mutation.
 */
export const useUploadFile = createMutationHook<UploadFileResponse, UploadFilePayload>(({ uri, folder }) =>
  uploadFileAction(uri, folder),
);
