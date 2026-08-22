import type { Category } from '@/types';

export interface ServiceType {
  id: string;
  categoryId: string;
  name: string;
}

/** Offline fallback used only when the categories API returns empty. */
export const SERVICE_CATEGORIES: Category[] = [
  { id: 'cleaning', name: 'Cleaning Services', slug: 'cleaning' },
  { id: 'design', name: 'Design Services', slug: 'design' },
  { id: 'computers', name: 'IT Support & Computers', slug: 'computers' },
  { id: 'beauty', name: 'Beauty & Saloon', slug: 'beauty' },
];

export const SERVICE_TYPES: ServiceType[] = [
  // Cleaning
  { id: 'sub-1', categoryId: 'cleaning', name: 'Bathroom Deep Cleaning' },
  { id: 'sub-2', categoryId: 'cleaning', name: 'Kitchen Sanitization' },
  { id: 'sub-3', categoryId: 'cleaning', name: 'Sofa & Carpet Shampooing' },
  { id: 'sub-4', categoryId: 'cleaning', name: 'Full House Dusting & Polish' },
  { id: 'sub-5', categoryId: 'cleaning', name: 'Window Cleaning' },

  // Design
  { id: 'des-1', categoryId: 'design', name: 'Logo Design' },
  { id: 'des-2', categoryId: 'design', name: 'Website Design' },
  { id: 'des-3', categoryId: 'design', name: 'Mobile App UI/UX' },
  { id: 'des-4', categoryId: 'design', name: 'Brand Guidelines' },

  // Computers & IT
  { id: 'it-1', categoryId: 'computers', name: 'OS Installation' },
  { id: 'it-2', categoryId: 'computers', name: 'Hardware Repair' },
  { id: 'it-3', categoryId: 'computers', name: 'WiFi Troubleshooting' },
  { id: 'it-4', categoryId: 'computers', name: 'Data Recovery' },

  // Beauty
  { id: 'bt-1', categoryId: 'beauty', name: 'Hair Styling' },
  { id: 'bt-2', categoryId: 'beauty', name: 'Makeup Artist' },
  { id: 'bt-3', categoryId: 'beauty', name: 'Manicure & Pedicure' },
  { id: 'bt-4', categoryId: 'beauty', name: 'Facial & Skincare' },
];

export function getServiceTypesByCategory(categoryId: string): ServiceType[] {
  return SERVICE_TYPES.filter((type) => type.categoryId === categoryId);
}
