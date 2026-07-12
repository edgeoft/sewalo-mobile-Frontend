import { internalClient } from '@/api/client/instances/internal';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  GetBlogsResponse,
  GetFeaturedBlogResponse,
  GetBlogBySlugResponse,
  GetBlogCategoriesResponse,
} from '@/types';

export const getBlogsAction = async (
  params: {
    page?: number;
    limit?: number;
    category_id?: string;
    search?: string;
    show?: string;
  } = {},
): Promise<GetBlogsResponse> => {
  return internalClient.get(API_ENDPOINTS.BLOG.LIST, { params });
};

export const getFeaturedBlogAction = async (): Promise<GetFeaturedBlogResponse> => {
  return internalClient.get(API_ENDPOINTS.BLOG.FEATURED);
};

export const getBlogBySlugAction = async (slug: string): Promise<GetBlogBySlugResponse> => {
  return internalClient.get(API_ENDPOINTS.BLOG.DETAIL(slug));
};

export const getBlogCategoriesAction = async (): Promise<GetBlogCategoriesResponse> => {
  return internalClient.get(API_ENDPOINTS.BLOG.CATEGORIES);
};
