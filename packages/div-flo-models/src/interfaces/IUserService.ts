import type { User, OAuthAccount, UserProfile } from '@prisma/client';

export interface IUserService {
  createUser(user: Partial<User> & { email: string; username: string }): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByOAuthAccount(provider: string, providerAccountId: string): Promise<User | null>;
  updateUser(user: Partial<User> & { id: string }): Promise<User>;
  deleteUser(id: string): Promise<void>;
  listUsers(): Promise<User[]>;
  createOAuthAccount(account: Partial<OAuthAccount> & { userId: string; provider: string; providerAccountId: string }): Promise<OAuthAccount>;
  createUserProfile(profile: Partial<UserProfile> & { userId: string }): Promise<UserProfile>;
}
