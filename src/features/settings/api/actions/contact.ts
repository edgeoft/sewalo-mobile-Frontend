import { internalClient } from '@/api/clients/internal';
import { ContactPayload, ContactResponse } from '../types/contact';

export const submitContactAction = async (data: ContactPayload): Promise<ContactResponse> => {
  return internalClient.post<ContactResponse>('/contact-us', data);
};
