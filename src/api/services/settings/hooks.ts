import { useMutation } from '@tanstack/react-query';
import { submitContactAction } from './actions';
import { ContactPayload, ContactResponse } from '@/types';

export const useSubmitContact = () => {
  return useMutation<ContactResponse, Error, ContactPayload>({
    mutationFn: submitContactAction,
  });
};
