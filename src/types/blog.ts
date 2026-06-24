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

export interface GetBlogsResponse {
  data: Blog[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface GetFeaturedBlogResponse {
  data: Blog | null;
}

export interface GetBlogBySlugResponse {
  data: Blog;
}

export interface GetBlogCategoriesResponse {
  data: BlogCategory[];
}
