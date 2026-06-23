export interface Category {
  id: string;
  name: string;
  img: string | null;
  slug: string;
  show_on_homepage: boolean;
}

export interface CategoryResponse {
  data: Category[];
}
