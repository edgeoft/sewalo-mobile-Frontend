export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

export interface CategoryResponse {
  data: Category[];
}
