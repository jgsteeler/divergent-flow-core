import { injectable, inject } from 'tsyringe';
import { IUserRepository, IUserService } from '@div-flo/models';
import { User, OAuthAccount, UserProfile } from '@prisma/client';

@injectable()
export class UserService implements IUserService {
  private prisma: PrismaClient;

  constructor(
    @inject('IUserRepository') private repo: IUserRepository
  ) {
    this.prisma = new PrismaClient();
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