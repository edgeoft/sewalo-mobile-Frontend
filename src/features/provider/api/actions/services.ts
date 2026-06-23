import { internalClient } from '@/api/client/instances/internal';
import { Category, SubCategory } from '@/types';

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
  portfolio: string[];
  portfolio_url: string;
  service_location: string[];
  tags: string[];
  has_service_packages: boolean;
  service_offerings: ServiceOffering[];
  service_packages: ServicePackage[];
  provider?: {
    status: string;
  };
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

export const getCategoriesAction = async (): Promise<CategoryListResponse> => {
  return internalClient.get<CategoryListResponse>('/categories');
};

export const getSubCategoriesAction = async (slug: string): Promise<SubCategoryListResponse> => {
  return internalClient.get<SubCategoryListResponse>(`/categories/${slug}/sub-categories`);
};

export const getMyServicesAction = async (): Promise<GetMyServicesResponse> => {
  return internalClient.get<GetMyServicesResponse>('/services/my-services');
};

export const createServiceAction = async (payload: CreateServiceParams): Promise<Service> => {
  return internalClient.post<Service>('/services', payload);
};

export interface UpdateServiceParams extends CreateServiceParams {
  id: string;
}

export const updateServiceAction = async (payload: UpdateServiceParams): Promise<Service> => {
  const { id, ...rest } = payload;
  return internalClient.put<Service>(`/services/${id}`, rest);
};

export const deleteServiceAction = async (id: string): Promise<void> => {
  return internalClient.delete<void>(`/services/${id}`);
};
