import { useMutation } from '@tanstack/react-query';
import type { UploadFileResponse, UploadFilePayload } from '@/types';

import { uploadFileAction, deleteFileAction } from './actions';

/**
 * Hook to execute file upload mutation.
 */
export const useUploadFile = () => {
  return useMutation<UploadFileResponse, Error, UploadFilePayload>({
    mutationFn: ({ uri, folder }) => uploadFileAction(uri, folder),
  });
};

/**
 * Hook to execute file deletion mutation.
 */
export const useDeleteFile = () => {
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (path) => deleteFileAction(path),
  });
};
