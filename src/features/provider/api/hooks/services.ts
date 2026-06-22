import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCategoriesAction,
  getSubCategoriesAction,
  getMyServicesAction,
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  CreateServiceParams,
  UpdateServiceParams,
  Service,
  CategoryListResponse,
  SubCategoryListResponse,
  GetMyServicesResponse,
} from '../actions/services';

export const useGetCategoriesQuery = () => {
  return useQuery<CategoryListResponse, Error>({
    queryKey: ['categories'],
    queryFn: getCategoriesAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetSubCategoriesQuery = (slug: string, enabled: boolean = true) => {
  return useQuery<SubCategoryListResponse, Error>({
    queryKey: ['subcategories', slug],
    queryFn: () => getSubCategoriesAction(slug),
    enabled: enabled && !!slug,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetMyServicesQuery = (options: { enabled?: boolean } = {}) => {
  return useQuery<GetMyServicesResponse, Error>({
    queryKey: ['my-services'],
    queryFn: getMyServicesAction,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCreateServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Service, Error, CreateServiceParams>({
    mutationFn: createServiceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
    },
  });
};

export const useDeleteServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteServiceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
    },
  });
};

export const useUpdateServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Service, Error, UpdateServiceParams>({
    mutationFn: updateServiceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
    },
  });
};
