import { createMutationHook } from '@/api/client/query/factory';
import { submitContactAction } from './actions';
import type { ContactPayload, ContactResponse } from '@/types';

export const useSubmitContact = createMutationHook<ContactResponse, ContactPayload>(submitContactAction);
