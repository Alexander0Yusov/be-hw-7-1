export type PostDbDto = {
  id: number;
  title: string;
  short_description: string;
  content: string;
  blog_id: number;
  created_at: Date;
  updated_at: Date;
};

export type LikeForArrayViewDto = {
  addedAt: string;
  userId: string;
  login: string;
};
