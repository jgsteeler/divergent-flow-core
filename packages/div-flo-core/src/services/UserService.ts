import { injectable, inject } from 'tsyringe';
import { IUserRepository, IUserService } from '@div-flo/models';
import { User, OAuthAccount, UserProfile, PrismaClient } from '@prisma/client';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('IUserRepository') private repo: IUserRepository,
    @inject('PrismaClient') private prisma: PrismaClient
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
    return this.prisma.user.create({ data: user as any });
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
    const oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });
    return oauthAccount?.user || null;
  }

  async updateUser(user: Partial<User> & { id: string }): Promise<User> {
    if (!user.id) throw new Error('id is required');
    return this.prisma.user.update({
      where: { id: user.id },
      data: user,
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return this.repo.list();
  }

  async createOAuthAccount(account: Partial<OAuthAccount> & { userId: string; provider: string; providerAccountId: string }): Promise<OAuthAccount> {
    return this.prisma.oAuthAccount.create({
      data: account as any,
    });
  }

  async createUserProfile(profile: Partial<UserProfile> & { userId: string }): Promise<UserProfile> {
    return this.prisma.userProfile.create({
      data: profile as any,
    });
  }
}