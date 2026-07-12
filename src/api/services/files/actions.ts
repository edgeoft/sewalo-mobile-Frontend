import { internalClient } from '@/api/client/instances/internal';
import { API_ENDPOINTS } from '@/constants/api';
import type { UploadFileResponse, UploadFilePayload } from '@/types';

/**
 * Uploads a file (image/doc) to the backend storage.
 */
export const uploadFileAction = async (uri: string, folder: string): Promise<UploadFileResponse> => {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri,
    name: filename,
    type,
  } as unknown as Blob);

  formData.append('folder', folder);

  return internalClient.post<UploadFileResponse>(API_ENDPOINTS.FILES.UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Deletes a file from the backend storage by path.
 */
export const deleteFileAction = async (path: string): Promise<{ success: boolean }> => {
  return internalClient.delete<{ success: boolean }>(API_ENDPOINTS.FILES.DELETE, {
    data: { path },
  });
};
