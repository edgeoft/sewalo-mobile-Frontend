import { createQueryHook } from '@/api/client/query/factory';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getBlogsAction, getFeaturedBlogAction, getBlogBySlugAction } from './actions';
import type { GetBlogsResponse, GetFeaturedBlogResponse, GetBlogBySlugResponse } from '@/types';

export interface GetBlogsQueryParams {
  page?: number;
  limit?: number;
  category_id?: string;
  search?: string;
  show?: string;
}

const getBlogsQueryHook = createQueryHook<GetBlogsResponse, GetBlogsQueryParams | undefined>(
  (params) => QUERY_KEYS.BLOGS.LIST(params ?? {}),
  (params) => getBlogsAction(params ?? {}),
);

export const useGetBlogsQuery = (params: GetBlogsQueryParams = {}) => getBlogsQueryHook(params);

export const useGetFeaturedBlogQuery = createQueryHook<GetFeaturedBlogResponse, void>(
  () => QUERY_KEYS.BLOGS.FEATURED,
  getFeaturedBlogAction,
);

const blogBySlugQueryHook = createQueryHook<GetBlogBySlugResponse, string>(
  (slug) => QUERY_KEYS.BLOGS.DETAIL(slug),
  (slug) => getBlogBySlugAction(slug),
);

export const useGetBlogBySlugQuery = (slug: string) => blogBySlugQueryHook(slug, { enabled: !!slug });
