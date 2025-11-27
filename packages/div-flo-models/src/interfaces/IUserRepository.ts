import type { User, OAuthAccount, UserProfile } from '@prisma/client';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByOAuthAccount(provider: string, providerAccountId: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  list(): Promise<User[]>;
  createOAuthAccount(account: Partial<OAuthAccount> & { userId: string; provider: string; providerAccountId: string }): Promise<OAuthAccount>;
  createUserProfile(profile: Partial<UserProfile> & { userId: string }): Promise<UserProfile>;
}
