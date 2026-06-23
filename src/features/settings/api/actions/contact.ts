import { internalClient } from '@/api/client/instances/internal';
import { ContactPayload, ContactResponse } from '@/types';

export const submitContactAction = async (data: ContactPayload): Promise<ContactResponse> => {
  return internalClient.post<ContactResponse>('/contact-us', data);
};
