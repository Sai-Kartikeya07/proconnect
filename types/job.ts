export interface IJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  description: string;
  requirements: string;
  salary_range?: string;
  posted_by: string;
  posted_by_name: string;
  posted_by_image?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ICreateJob {
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  description: string;
  requirements: string;
  salary_range?: string;
}