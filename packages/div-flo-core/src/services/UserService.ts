import { injectable, inject } from 'tsyringe';
import { IUserRepository, IUserService } from '@div-flo/models';
import { User, OAuthAccount, UserProfile} from '@prisma/client';

@injectable()
export class UserService implements IUserService {
    /**
     * Provision or update a user from OAuth (Auth0) claims.
     * Ensures user exists and is linked to the OAuth account.
     */
    async provisionOrUpdateOAuthUser({ sub, email, provider, username, name, given_name, family_name, emailVerified }: {
      sub: string;
      email: string;
      provider: string;
      username?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
      emailVerified?: boolean;
    }): Promise<User> {
      if (!sub || !email || !provider) throw new Error('sub, email, and provider are required');

      // 1. Try to find user by OAuth account (provider + sub)
      let user = await this.getUserByOAuthAccount(provider, sub);
      if (user) {
        // Optionally update user info if changed
        if (email && user.email !== email) {
          user = await this.updateUser({ id: user.id, email });
        }
        // Update last login
        user = await this.updateUser({ id: user.id, lastLoginAt: new Date() });
        return user;
      }

      // 2. Try to find user by email
      user = await this.getUserByEmail(email);
      if (user) {
        // Link OAuth account if not already linked
        const existingOAuth = await this.getUserByOAuthAccount(provider, sub);
        if (!existingOAuth) {
          await this.createOAuthAccount({
            userId: user.id,
            provider,
            providerAccountId: sub,
          });
        }
        // Update last login
        user = await this.updateUser({ id: user.id, lastLoginAt: new Date() });
        return user;
      }

      // 3. Create new user and link OAuth account
      const finalUsername = username || email.split('@')[0];
      user = await this.createUser({
        email,
        username: finalUsername,
        emailVerified: emailVerified || false,
        password: null,
        lastLoginAt: new Date(),
      });
      await this.createOAuthAccount({
        userId: user.id,
        provider,
        providerAccountId: sub,
      });
      if (name || given_name || family_name) {
        await this.createUserProfile({
          userId: user.id,
          displayName: name,
          firstName: given_name,
          lastName: family_name,
        });
      }
      return user;
    }
  constructor(
    @inject('IUserRepository') private repo: IUserRepository
  ) {}

  async createUser(user: Partial<User> & { email: string; username: string }): Promise<User> {
    if (!user.email || !user.username) {
      throw new Error('email and username are required');
    }
    // Check if user already exists
    const existingByEmail = await this.repo.findByEmail(user.email);
    if (existingByEmail) {
      throw new Error('User with this email already exists');
    }
    const existingByUsername = await this.repo.findByUsername(user.username);
    if (existingByUsername) {
      throw new Error('User with this username already exists');
    }
    return this.repo.create(user as User);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.repo.findByEmail(email);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.repo.findByUsername(username);
  }

  async getUserByOAuthAccount(provider: string, providerAccountId: string): Promise<User | null> {
    return this.repo.findByOAuthAccount(provider, providerAccountId);
  }

  async updateUser(user: Partial<User> & { id: string }): Promise<User> {
    if (!user.id) throw new Error('id is required');
    return this.repo.update(user as User);
  }

  async deleteUser(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return this.repo.list();
  }

  async createOAuthAccount(account: Partial<OAuthAccount> & { userId: string; provider: string; providerAccountId: string }): Promise<OAuthAccount> {
    return this.repo.createOAuthAccount(account);
  }

  async createUserProfile(profile: Partial<UserProfile> & { userId: string }): Promise<UserProfile> {
    return this.repo.createUserProfile(profile);
  }
}