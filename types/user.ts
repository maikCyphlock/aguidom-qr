export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  lastSignInAt: Date;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
  clubId?: string;
}

export interface SyncUserData {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  clubId?: string;
}
