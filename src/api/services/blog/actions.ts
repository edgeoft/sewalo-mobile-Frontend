import { internalClient } from '@/api/client/instances/internal';
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
  return internalClient.get('/blog', { params });
};

export const getFeaturedBlogAction = async (): Promise<GetFeaturedBlogResponse> => {
  return internalClient.get('/blog/featured');
};

export const getBlogBySlugAction = async (slug: string): Promise<GetBlogBySlugResponse> => {
  return internalClient.get(`/blog/${slug}`);
};

export const getBlogCategoriesAction = async (): Promise<GetBlogCategoriesResponse> => {
  return internalClient.get('/blog/categories');
};
