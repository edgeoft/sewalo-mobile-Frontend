import { useQuery } from '@tanstack/react-query';
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
    queryKey: ['blogs', params],
    queryFn: () => getBlogsAction(params),
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetFeaturedBlogQuery = () => {
  return useQuery<GetFeaturedBlogResponse, Error>({
    queryKey: ['featured-blog'],
    queryFn: getFeaturedBlogAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetBlogBySlugQuery = (slug: string) => {
  return useQuery<GetBlogBySlugResponse, Error>({
    queryKey: ['blog', slug],
    queryFn: () => getBlogBySlugAction(slug),
    enabled: !!slug,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetBlogCategoriesQuery = () => {
  return useQuery<GetBlogCategoriesResponse, Error>({
    queryKey: ['blog-categories'],
    queryFn: getBlogCategoriesAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
