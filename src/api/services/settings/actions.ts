import { internalClient } from '@/api/client/instances/internal';
import { API_ENDPOINTS } from '@/constants/api';
import { ContactPayload, ContactResponse } from '@/types';

export const submitContactAction = async (data: ContactPayload): Promise<ContactResponse> => {
  return internalClient.post<ContactResponse>(API_ENDPOINTS.CONTACT_US, data);
};
