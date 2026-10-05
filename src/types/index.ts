export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PostAuthor {
  id: string;
  name: string;
  email?: string;
  photo?: string | null;
}

export interface PostComment {
  id: string;
  post_id?: string;
  user_id?: string;
  author?: PostAuthor;
  user?: PostAuthor;
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  author: PostAuthor;
  description: string;
  cover?: string | null;
  total_likes: number;
  is_liked: boolean;
  total_comments: number;
  comments?: PostComment[];
  created_at: string;
  updated_at?: string;
}

export interface ApiResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name: string;
}

export interface ChangePasswordPayload {
  old_password?: string;
  password?: string;
  new_password?: string;
  confirm_password?: string;
}

export interface CreatePostPayload {
  description: string;
  cover?: File;
}

export interface UpdatePostPayload {
  id: string;
  description: string;
}

