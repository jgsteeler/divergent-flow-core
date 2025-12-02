import { injectable, inject } from 'tsyringe';
import { IUserRepository, IUserService } from '@div-flo/models';
import { User, OAuthAccount, UserProfile} from '@prisma/client';

@injectable()
export class UserService implements IUserService {
  
    constructor(
    @inject('IUserRepository') private repo: IUserRepository
  ) {}
  
  /**
     * Provision or update a user from OAuth (Auth0) claims.
     * Ensures user exists and is linked to the OAuth account.
     */
    async provisionOrUpdateOAuthUser({ 
      sub,
      email,
      roles, 
      plan,
      created_at,
      emailVerified,
      provider, 
      username, 
      name, 
      given_name, 
      family_name,
      nickname,
      picture }: {
      sub: string;
      email: string;
      roles?: string[];
      plan?: string;
      created_at?: Date;
      emailVerified?: boolean;
      provider: string;
      username?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
      nickname?: string;
      picture?: string;
    }): Promise<User> {
      console.log('[UserService] Provisioning user:', { sub, email, provider });
      if (!sub || !email || !provider) {
        console.error('[UserService] Missing required fields:', { sub, email, provider });
        throw new Error('sub, email, and provider are required');
      }
      try {
        // 1. Check for user by email
        let user = await this.getUserByEmail(email);
        if (user) {
          console.log('[UserService] Found user by email:', user.id);
          // Update last login and emailVerified
          user = await this.updateUser({ id: user.id, lastLoginAt: new Date(), emailVerified });
        } else {
          // Create user
          const finalUsername = username || email.split('@')[0];
          const usernameToUse = nickname || finalUsername;
          user = await this.createUser({
            email,
            username: usernameToUse,
            emailVerified: emailVerified || false,
            password: null,
            lastLoginAt: new Date(),
          });
          console.log('[UserService] Created new user:', user.id);
        }

        // 2. Check for OAuthAccount by provider + sub
        const oauthAccount = await this.getUserByOAuthAccount(provider, sub);
        if (oauthAccount) {
          if (oauthAccount.id !== user.id) {
            console.warn('[UserService] OAuthAccount userId mismatch:', { oauthAccountUserId: oauthAccount.id, userId: user.id });
            // Optionally handle mismatch (e.g., update, error, etc.)
          } else {
            console.log('[UserService] OAuthAccount already linked:', oauthAccount.id);
          }
        } else {
          await this.createOAuthAccount({
            userId: user.id,
            provider,
            providerAccountId: sub,
          });
          console.log('[UserService] Linked OAuth account:', { userId: user.id, provider, sub });
        }

        // 3. Check for UserProfile by userId
        let profile = await this.repo.findUserProfileByUserId(user.id);
        if (profile) {
          await this.repo.updateUserProfile({
            userId: user.id,
            displayName: name,
            firstName: given_name,
            lastName: family_name,
            avatarUrl: picture,
          });
          console.log('[UserService] Updated user profile:', user.id);
        } else {
          await this.createUserProfile({
            userId: user.id,
            displayName: name,
            firstName: given_name,
            lastName: family_name,
            avatarUrl: picture,
          });
          console.log('[UserService] Created user profile:', user.id);
        }
        // Track duplicate provisioning calls
        if ((global as any).__provisioningCallCount === undefined) {
          (global as any).__provisioningCallCount = 0;
        }
        (global as any).__provisioningCallCount++;
        console.log(`[UserService] Provisioning call count (per process): ${(global as any).__provisioningCallCount}`);
        return user;
      } catch (err) {
        console.error('[UserService] Error during provisioning:', err);
        throw err;
      }
    }


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