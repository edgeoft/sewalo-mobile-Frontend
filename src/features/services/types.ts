export interface PackageDeal {
  title: string;
  description: string;
  inclusions: string[];
  price: string;
  durationLabel: string; // e.g. '10 Days'
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price: string;
  durationLabel: string; // e.g. '1 Day'
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
  fullLocation: string; // detailed location for contact card
  rating: string;
  reviewCount: number;
  startingPrice: string;
  ordersCompleted: string;
  specialPackagesCount: number;
  availability: string;
  availabilityLabel: string; // badge text e.g. 'Always'
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
