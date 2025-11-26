import { injectable, inject } from "tsyringe";
import { IUserRepository } from "@div-flo/models";
import { User, OAuthAccount, UserProfile, PrismaClient } from "@prisma/client";

@injectable()
export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor(@inject('PrismaClient') prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async create(user: User): Promise<User> {
    return this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        password: user.password,
        emailVerified: user.emailVerified,
      },
      include: {
        profile: true,
      },
    });
  }
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ 
      where: { id },
      include: {
        profile: true,
        oauthAccounts: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ 
      where: { email },
      include: {
        profile: true,
        oauthAccounts: true,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ 
      where: { username },
      include: {
        profile: true,
        oauthAccounts: true,
      },
    });
  }

  async update(user: User): Promise<User> {
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        username: user.username,
        password: user.password,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
      },
      include: {
        profile: true,
        oauthAccounts: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async list(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        profile: true,
      },
    });
  }

  async findByOAuthAccount(provider: string, providerAccountId: string): Promise<User | null> {
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
