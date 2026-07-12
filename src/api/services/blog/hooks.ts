import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getBlogsAction, getFeaturedBlogAction, getBlogBySlugAction, getBlogCategoriesAction } from './actions';
import type {
  GetBlogsResponse,
  GetFeaturedBlogResponse,
  GetBlogBySlugResponse,
  GetBlogCategoriesResponse,
} from '@/types';

export const useGetBlogsQuery = (
  params: {
    page?: number;
    limit?: number;
    category_id?: string;
    search?: string;
    show?: string;
  } = {},
) => {
  return useQuery<GetBlogsResponse, Error>({
    queryKey: QUERY_KEYS.BLOGS.LIST(params),
    queryFn: () => getBlogsAction(params),
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetFeaturedBlogQuery = () => {
  return useQuery<GetFeaturedBlogResponse, Error>({
    queryKey: QUERY_KEYS.BLOGS.FEATURED,
    queryFn: getFeaturedBlogAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetBlogBySlugQuery = (slug: string) => {
  return useQuery<GetBlogBySlugResponse, Error>({
    queryKey: QUERY_KEYS.BLOGS.DETAIL(slug),
    queryFn: () => getBlogBySlugAction(slug),
    enabled: !!slug,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetBlogCategoriesQuery = () => {
  return useQuery<GetBlogCategoriesResponse, Error>({
    queryKey: QUERY_KEYS.BLOGS.CATEGORIES,
    queryFn: getBlogCategoriesAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
