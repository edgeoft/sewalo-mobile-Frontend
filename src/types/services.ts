import { Category, SubCategory } from './categories';
import { UserProfile } from './user';
import { PaginatedResponse } from './common';

// Service API Types
export interface ServiceOffering {
  id: string;
  service_id: string;
  sub_category_id: string;
  price: string;
  duration: number;
  duration_unit: string;
  sub_category: SubCategory;
}

export interface ServicePackage {
  id: string;
  service_id: string;
  name: string;
  services_offered: string[];
  price: string;
  duration: number;
  duration_unit: string;
  description: string | null;
  is_active: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category_id: string;
  provider_id: string;
  category: Category;
  provider: UserProfile;
  currency: string;
  average_rating: string;
  total_ratings: number;
  portfolio: string[];
  portfolio_url: string;
  service_location: string[];
  tags: string[];
  has_service_packages: boolean;
  service_offerings: ServiceOffering[];
  service_packages: ServicePackage[];
  is_favourite?: boolean;
}

export interface GetServiceListParams {
  page?: number;
  limit?: number;
  all?: string;
  category?: string;
  sub_category?: string;
  min_rating?: number;
  max_rating?: number;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  languages?: string;
  service_location?: string;
  provider_status?: string;
  provider_available?: boolean;
  search?: string;
}

export type GetServiceListResponse = PaginatedResponse<Service>;

export interface FavoriteProvider {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  average_rating?: string;
  avg_rating: number | null;
  total_ratings?: number;
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

export type GetFavoritesResponse = PaginatedResponse<FavoriteItem>;

// Provider Creation Params Types (Moved from features/provider)
export interface CreateServiceOffering {
  sub_category_id: string;
  price: number;
  duration: number;
  duration_unit: string;
  services_offered: string[];
}

export interface CreateServicePackage {
  name: string;
  services_offered: string[];
  price: number;
  duration: number;
  duration_unit: string;
}

export interface CreateServiceParams {
  name: string;
  category_id: string;
  service_location: string[];
  description: string;
  tags: string[];
  portfolio: string[];
  portfolio_url: string;
  has_service_packages: boolean;
  service_offerings: CreateServiceOffering[];
  service_packages: CreateServicePackage[];
}

export interface GetMyServicesResponse {
  data: Service;
}

export interface CategoryListResponse {
  data: Category[];
}

export interface SubCategoryListResponse {
  data: SubCategory[];
}

export interface UpdateServiceParams extends CreateServiceParams {
  id: string;
}

// UI Detail Types (Moved from features/services/types.ts)
export interface PackageDeal {
  title: string;
  description: string;
  inclusions: string[];
  price: string;
  durationLabel: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price: string;
  durationLabel: string;
}

export interface PortfolioItem {
  id: string;
  uri: string;
  title?: string;
}

export interface ReviewItem {
  id: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  date: string;
  comment: string;
  reply?: string;
}

export interface ProviderDetail {
  id: string;
  serviceId?: string;
  isFavourite?: boolean;
  name: string;
  avatarUri: string;
  isVerified: boolean;
  serviceLabel: string;
  location: string;
  fullLocation: string;
  rating: string;
  reviewCount: number;
  startingPrice: string;
  ordersCompleted: string;
  specialPackagesCount: number;
  availability: string;
  availabilityLabel: string;
  workingHours: string;
  phone: string;
  email: string;
  bio: string;
  languages: string[];
  skills: string[];
  experience: string;
  education?:
    | {
        id: number;
        degree: string;
        institute: string;
        start_date: string;
        end_date?: string | null;
      }[]
    | null;
  experienceList?:
    | {
        id: number;
        title: string;
        company_name: string;
        start_date: string;
        end_date: string | null;
      }[]
    | null;
  certificates?:
    | {
        id: number;
        value: string;
      }[]
    | string[]
    | null;
  specialPackage?: PackageDeal | null;
  individualServices: ServiceItem[];
  portfolio: PortfolioItem[];
  reviews: ReviewItem[];
}
