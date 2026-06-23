export interface CreateRatingPayload {
  rate: number;
  review: string;
  provider_id: string;
  booking_id: string;
}

export interface UpdateRatingPayload {
  id: string;
  rate: number;
  review: string;
  provider_id: string;
  booking_id: string;
}

export interface Rating {
  id: string;
  rate: number;
  review: string;
  provider_id: string;
  user_id: string;
  booking_id: string;
  created_at: string;
  updated_at: string;
  provider: {
    id: string;
    name: string;
    avatar: string | null;
  };
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  booking: {
    id: string;
    service: {
      name: string;
    };
  };
}

export interface GetMyRatingsResponse {
  current_page: number;
  data: Rating[];
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

export interface GetMyRatingsParams {
  page?: number;
  limit?: number;
}
