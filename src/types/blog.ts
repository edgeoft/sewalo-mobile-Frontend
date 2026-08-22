import type { DataEnvelope } from './common';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  category_id: string;
  author: string;
  img_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  category?: BlogCategory;
}

export type GetBlogsResponse = DataEnvelope<Blog[]>;

export type GetFeaturedBlogResponse = DataEnvelope<Blog | null>;

export type GetBlogBySlugResponse = DataEnvelope<Blog>;

export type GetBlogCategoriesResponse = DataEnvelope<BlogCategory[]>;
