import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';

import type { ApiError } from '@/api/client/types';

export function createQueryHook<TData, TParams = void, TError = ApiError>(
  getKey: (params: TParams) => QueryKey,
  fetcher: (params: TParams) => Promise<TData>,
  defaultOptions?: Partial<UseQueryOptions<TData, TError>>,
) {
  return function useGeneratedQuery(params: TParams, options?: Partial<UseQueryOptions<TData, TError>>) {
    return useQuery<TData, TError>({
      queryKey: getKey(params),
      queryFn: () => fetcher(params),
      ...defaultOptions,
      ...options,
    });
  };
}

export function createMutationHook<TData, TVariables, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    invalidateKeys?: (data: TData, variables: TVariables) => QueryKey[];
  } & Partial<UseMutationOptions<TData, TError, TVariables>>,
) {
  return function useGeneratedMutation(customOptions?: Partial<UseMutationOptions<TData, TError, TVariables>>) {
    const queryClient = useQueryClient();
    return useMutation<TData, TError, TVariables>({
      mutationFn,
      onSuccess: (data, variables, context) => {
        if (options?.invalidateKeys) {
          const keys = options.invalidateKeys(data, variables);
          keys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
        }
        if (options?.onSuccess) {
          (options.onSuccess as (d: TData, v: TVariables, c: unknown) => void)(data, variables, context);
        }
        if (customOptions?.onSuccess) {
          (customOptions.onSuccess as (d: TData, v: TVariables, c: unknown) => void)(data, variables, context);
        }
      },
      ...options,
      ...customOptions,
    });
  };
}
