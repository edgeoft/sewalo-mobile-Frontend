import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createRatingAction, getMyRatingsAction, updateRatingAction, deleteRatingAction } from '../actions/rating';
import type {
  CreateRatingPayload,
  UpdateRatingPayload,
  Rating,
  GetMyRatingsResponse,
  GetMyRatingsParams,
} from '../types/rating';

export const useCreateRating = () => {
  const queryClient = useQueryClient();
  return useMutation<Rating, Error, CreateRatingPayload>({
    mutationFn: createRatingAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-ratings'] });
    },
  });
};

export const useGetMyRatingsQuery = (params: GetMyRatingsParams = {}) => {
  return useQuery<GetMyRatingsResponse, Error>({
    queryKey: ['my-ratings', params],
    queryFn: () => getMyRatingsAction(params),
    retry: false,
  });
};

export const useUpdateRating = () => {
  const queryClient = useQueryClient();
  return useMutation<Rating, Error, UpdateRatingPayload>({
    mutationFn: updateRatingAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ratings'] });
    },
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteRatingAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ratings'] });
    },
  });
};
