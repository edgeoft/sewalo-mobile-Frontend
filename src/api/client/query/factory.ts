import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';

export function createQueryHook<TData, TParams = void>(
  getKey: (params: TParams) => QueryKey,
  fetcher: (params: TParams) => Promise<TData>,
  defaultOptions?: Partial<UseQueryOptions<TData, Error>>,
) {
  return function useGeneratedQuery(params: TParams, options?: Partial<UseQueryOptions<TData, Error>>) {
    return useQuery<TData, Error>({
      queryKey: getKey(params),
      queryFn: () => fetcher(params),
      ...defaultOptions,
      ...options,
    });
  };
}

export function createMutationHook<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    invalidateKeys?: (data: TData, variables: TVariables) => QueryKey[];
  } & Partial<UseMutationOptions<TData, Error, TVariables>>,
) {
  return function useGeneratedMutation(customOptions?: Partial<UseMutationOptions<TData, Error, TVariables>>) {
    const queryClient = useQueryClient();
    return useMutation<TData, Error, TVariables>({
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
