import { internalClient } from '@/api/client/instances/internal';
import type {
  CreateRatingPayload,
  UpdateRatingPayload,
  Rating,
  GetMyRatingsResponse,
  GetMyRatingsParams,
} from '@/types';

export const createRatingAction = async (payload: CreateRatingPayload): Promise<Rating> => {
  return internalClient.post('/ratings', payload);
};

export const getMyRatingsAction = async (params: GetMyRatingsParams = {}): Promise<GetMyRatingsResponse> => {
  return internalClient.get('/ratings/my-ratings', { params });
};

export const updateRatingAction = async ({ id, ...payload }: UpdateRatingPayload): Promise<Rating> => {
  return internalClient.put(`/ratings/${id}`, payload);
};

export const deleteRatingAction = async (id: string): Promise<void> => {
  return internalClient.delete(`/ratings/${id}`);
};
