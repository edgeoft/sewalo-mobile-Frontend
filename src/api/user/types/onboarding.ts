import { Availability, EducationItemPayload, ExperienceItemPayload } from './profile';

export interface CompleteProfilePayload {
  email: string;
  city: string;
  state: string;
  country: string;
  address: string;
  dob: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  avatar?: string | null;
  document?: string | null;
  description?: string;
  education?: EducationItemPayload[];
  experience?: ExperienceItemPayload[];
  availability?: Availability | string;
  start_time?: string;
  end_time?: string;
  language?: string[];
}
