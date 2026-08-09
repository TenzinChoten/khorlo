export interface BusinessProfileDTO {
  id: string;
  userId: string;
  companyName: string;
  companyLogo: string | null;
  website: string | null;
  companyDescription: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessProfileResponse {
  profile: BusinessProfileDTO;
}
