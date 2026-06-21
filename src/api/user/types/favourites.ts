import { Category } from './category';
import { ServiceOffering, ServicePackage } from './service';

export interface FavoriteProvider {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  avg_rating: number | null;
  profile_views: number | null;
  city: string | null;
  address: string | null;
}

export interface FavoriteService {
  id: string;
  name: string;
  description: string;
  category_id: string;
  provider_id: string;
  average_rating: string;
  total_ratings: number;
  provider: FavoriteProvider;
  category: Category;
  service_offerings?: ServiceOffering[];
  service_packages?: ServicePackage[];
}

export interface FavoriteItem {
  id: string;
  user_id: string;
  service_id: string;
  created_at: string;
  updated_at: string;
  service: FavoriteService;
}

export interface AddRemoveFavoritePayload {
  service_id: string;
}

export interface GetFavoritesResponse {
  current_page: number;
  data: FavoriteItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
