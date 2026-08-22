import type { TFunction } from 'i18next';

import {
  USER_STATUSES,
  type ProviderDetail,
  type ProviderDetailsResponse,
  type Rating,
  type ReviewItem,
  type ServiceOffering,
} from '@/types';
import { FALLBACKS, getAvatarUrl, getImageUrl } from '@/utils/image';
import { getStartingPrice } from '@/utils/currency';
import { formatProviderLocation } from '@/utils/location';
import { toStringArray } from '@/utils/text';

export function mapRatingToReviewItem(rating: Rating): ReviewItem {
  return {
    id: rating.id,
    customerName: rating.user?.name || 'Customer',
    customerAvatar: getImageUrl(rating.user?.avatar) || FALLBACKS.avatar,
    rating: rating.rate,
    date: rating.created_at,
    comment: rating.review,
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Maps the raw provider-details API payload into the UI view-model.
 */
export function mapApiToProviderDetail(
  data: ProviderDetailsResponse,
  reviews: ReviewItem[],
  t: TFunction,
  providerSlug: string,
): ProviderDetail | null {
  if (!data || !data.provider) return null;
  const { provider, services } = data;
  const firstService = services?.[0];

  const offeringsMap = new Map<string, string>();
  firstService?.service_offerings?.forEach((o: ServiceOffering) => {
    if (o.sub_category?.name) {
      if (o.id) offeringsMap.set(o.id, o.sub_category.name);
      if (o.sub_category_id) offeringsMap.set(o.sub_category_id, o.sub_category.name);
      if (o.sub_category?.id) offeringsMap.set(o.sub_category.id, o.sub_category.name);
    }
  });

  const resolveInclusion = (item: string): string => {
    if (!item) return '';
    const mapped = offeringsMap.get(item);
    if (mapped) return mapped;
    if (UUID_REGEX.test(item)) {
      return firstService?.category?.name || t('services.service');
    }
    return item;
  };

  const pkg = firstService?.service_packages?.[0];
  const specialPackage = pkg
    ? {
        id: pkg.id,
        title: pkg.name,
        description: pkg.description || '',
        inclusions: pkg.services_offered?.map(resolveInclusion).filter(Boolean) || [],
        price: `Rs. ${pkg.price}`,
        durationLabel: `${pkg.duration} ${pkg.duration_unit || t('services.days')}`,
      }
    : null;

  const individualServices =
    firstService?.service_offerings?.map((o: ServiceOffering) => ({
      id: o.id,
      title: o.sub_category?.name || t('services.serviceOffering'),
      category: firstService?.category?.name || t('services.services'),
      price: `Rs. ${o.price}`,
      durationLabel: `${o.duration} ${o.duration_unit || t('services.hrs')}`,
    })) || [];

  const portfolio =
    firstService?.portfolio?.map((uri: string, idx: number) => ({
      id: `port-${idx}`,
      uri: getImageUrl(uri) || FALLBACKS.image,
      title: t('services.project', { number: idx + 1 }),
    })) || [];

  const providerRating =
    provider.average_rating || provider.avg_rating?.toString() || firstService?.average_rating || '0';
  const providerReviewCount = provider.total_ratings || firstService?.total_ratings || reviews.length || 0;

  const availability = provider.availability || t('services.always');

  let experienceSummary = '';
  if (provider.experience && provider.experience.length > 0) {
    const firstExp = provider.experience[0];
    const title = firstExp.title || '';
    const company = firstExp.company_name || '';
    experienceSummary = title && company ? `${title} at ${company}` : title || company;
  }

  return {
    id: provider.id,
    slug: provider.slug || providerSlug,
    serviceId: firstService?.id,
    isFavourite: firstService?.is_favourite || false,
    name: provider.name,
    avatarUri: getAvatarUrl(provider.avatar),
    isVerified: provider.status === USER_STATUSES.Verified,
    serviceLabel: firstService?.category?.name || t('services.services'),
    location: formatProviderLocation(provider, t('home.nepal')),
    fullLocation: provider.address ? `${provider.address}, ${provider.city || ''}` : provider.city || t('home.nepal'),
    rating: Number(providerRating).toFixed(1),
    reviewCount: providerReviewCount,
    startingPrice: getStartingPrice(firstService?.service_offerings),
    ordersCompleted: `${providerReviewCount} ${t('home.orders')}`,
    specialPackagesCount: firstService?.service_packages?.length || 0,
    availabilityLabel: availability,
    availability_days: provider.availability_days || null,
    start_time: provider.start_time || null,
    end_time: provider.end_time || null,
    phone: provider.phone || '',
    email: provider.email || '',
    bio: provider.description || firstService?.description || t('services.noBio'),
    languages: toStringArray(provider.language),
    skills: toStringArray(firstService?.tags),
    experience:
      experienceSummary ||
      (provider.experience && provider.experience.length > 0 ? '' : t('services.experiencedProfessional')),
    education: provider.education || [],
    experienceList: provider.experience || [],
    certificates: provider.certificates || [],
    specialPackage,
    individualServices,
    portfolio,
    reviews,
  };
}
