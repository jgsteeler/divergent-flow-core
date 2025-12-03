import { injectable, inject } from "tsyringe";
import { IUserRepository } from "@div-flo/models";
import { User, OAuthAccount, UserProfile, PrismaClient, Prisma } from "@prisma/client";

@injectable()
export class UserRepository implements IUserRepository {
      async updateUserProfile(profile: Partial<UserProfile> & { userId: string }): Promise<UserProfile> {
        // Only update allowed fields
        const data: Prisma.UserProfileUpdateInput = {
          displayName: profile.displayName ?? undefined,
          firstName: profile.firstName ?? undefined,
          lastName: profile.lastName ?? undefined,
          bio: profile.bio ?? undefined,
          avatarUrl: profile.avatarUrl ?? undefined,
        };
        return this.prisma.userProfile.update({
          where: { userId: profile.userId },
          data,
        });
      }
    async findUserProfileByUserId(userId: string): Promise<UserProfile | null> {
      return this.prisma.userProfile.findUnique({
        where: { userId },
      });
    }
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
    // Map only allowed fields to ensure type safety
    const data: Prisma.OAuthAccountCreateInput = {
      user: { connect: { id: account.userId } },
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      accessToken: account.accessToken ?? null,
      scope: account.scope ?? null,
      tokenType: account.tokenType ?? null,
      idToken: account.idToken ?? null,
    };
    return this.prisma.oAuthAccount.create({
      data,
    });
  }

  async createUserProfile(profile: Partial<UserProfile> & { userId: string }): Promise<UserProfile> {
    // Map only allowed fields to ensure type safety
    const data: Prisma.UserProfileCreateInput = {
      user: { connect: { id: profile.userId } },
      firstName: profile.firstName ?? null,
      lastName: profile.lastName ?? null,
      bio: profile.bio ?? null,
      avatarUrl: profile.avatarUrl ?? null,
    };
    return this.prisma.userProfile.create({
      data,
    });
  }
}
