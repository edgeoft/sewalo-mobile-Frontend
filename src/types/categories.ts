export interface Category {
  id: string;
  name: string;
  slug: string;
  img?: string | null;
  icon?: string | null;
  show_on_homepage?: boolean;
}

export interface CategoryResponse {
  data: Category[];
}

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}
