export interface IEducation {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  grade?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ICreateEducation {
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  grade?: string;
  description?: string;
}

export interface IUserProfile {
  id: string;
  first_name: string;
  image_url?: string;
  email?: string;
  created_at: string;
  
  // Additional profile data
  education: IEducation[];
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
  can_message?: boolean;
}