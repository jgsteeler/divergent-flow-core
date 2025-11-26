import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { IUserRepository } from '@div-flo/models';
import { PrismaClient } from '@prisma/client';

// Mock tsyringe container
vi.mock('tsyringe', () => ({
  inject: () => () => {},
  injectable: () => () => {},
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockPrisma: any;

  beforeEach(() => {
    // Mock PrismaClient
    mockPrisma = {
      user: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      oAuthAccount: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
      userProfile: {
        create: vi.fn(),
      },
    };

    // Create repository with mocked Prisma
    userRepository = new UserRepository(mockPrisma);

    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        emailVerified: false,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
        lastLoginAt: null,
      };

      const expectedUser = {
        ...userData,
        lastLoginAt: null,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
        profile: null,
        oauthAccounts: [],
      };

      mockPrisma.user.create.mockResolvedValue(expectedUser);

      // Act
      const result = await userRepository.create(userData);

      // Assert
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          password: userData.password,
          emailVerified: userData.emailVerified,
        },
        include: {
          profile: true,
        },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        emailVerified: true,
        lastLoginAt: null,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
        profile: null,
        oauthAccounts: [],
      };

      mockPrisma.user.findUnique.mockResolvedValue(expectedUser);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          profile: true,
          oauthAccounts: true,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await userRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const email = 'test@example.com';
      const expectedUser = {
        id: 'user-123',
        email,
        username: 'testuser',
        emailVerified: true,
        lastLoginAt: null,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
        profile: null,
        oauthAccounts: [],
      };

      mockPrisma.user.findUnique.mockResolvedValue(expectedUser);

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: {
          profile: true,
          oauthAccounts: true,
        },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      // Arrange
      const username = 'testuser';
      const expectedUser = {
        id: 'user-123',
        email: 'test@example.com',
        username,
        emailVerified: true,
        lastLoginAt: null,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
        profile: null,
        oauthAccounts: [],
      };

      mockPrisma.user.findUnique.mockResolvedValue(expectedUser);

      // Act
      const result = await userRepository.findByUsername(username);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username },
        include: {
          profile: true,
          oauthAccounts: true,
        },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findByOAuthAccount', () => {
    it('should find user by OAuth account', async () => {
      // Arrange
      const provider = 'google';
      const providerAccountId = 'google-123';
      const expectedUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        emailVerified: true,
        lastLoginAt: null,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
        profile: null,
        oauthAccounts: [],
      };

      mockPrisma.oAuthAccount.findUnique.mockResolvedValue({
        user: expectedUser,
      });

      // Act
      const result = await userRepository.findByOAuthAccount(provider, providerAccountId);

      // Assert
      expect(mockPrisma.oAuthAccount.findUnique).toHaveBeenCalledWith({
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
      expect(result).toEqual(expectedUser);
    });

    it('should return null when OAuth account not found', async () => {
      // Arrange
      mockPrisma.oAuthAccount.findUnique.mockResolvedValue(null);

      // Act
      const result = await userRepository.findByOAuthAccount('google', 'nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        email: 'updated@example.com',
        username: 'testuser',
        password: 'newpassword',
        emailVerified: true,
        lastLoginAt: new Date(),
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
      };

      const expectedUser = {
        ...userData,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
        profile: null,
        oauthAccounts: [],
      };

      mockPrisma.user.update.mockResolvedValue(expectedUser);

      // Act
      const result = await userRepository.update(userData);

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userData.id },
        data: {
          email: userData.email,
          username: userData.username,
          password: userData.password,
          emailVerified: userData.emailVerified,
          lastLoginAt: userData.lastLoginAt,
        },
        include: {
          profile: true,
          oauthAccounts: true,
        },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 'user-123';
      mockPrisma.user.delete.mockResolvedValue(undefined);

      // Act
      await userRepository.delete(userId);

      // Assert
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('list', () => {
    it('should list all users', async () => {
      // Arrange
      const expectedUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          username: 'user1',
          emailVerified: true,
          lastLoginAt: null,
          createdAt: new Date('2025-10-16T00:00:00Z'),
          updatedAt: new Date('2025-10-16T00:00:00Z'),
          profile: null,
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          username: 'user2',
          emailVerified: false,
          lastLoginAt: null,
          createdAt: new Date('2025-10-16T00:00:00Z'),
          updatedAt: new Date('2025-10-16T00:00:00Z'),
          profile: null,
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(expectedUsers);

      // Act
      const result = await userRepository.list();

      // Assert
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        include: {
          profile: true,
        },
      });
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('createOAuthAccount', () => {
    it('should create OAuth account successfully', async () => {
      // Arrange
      const accountData = {
        userId: 'user-123',
        provider: 'google',
        providerAccountId: 'google-123',
        accessToken: 'token123',
        scope: 'email profile',
        tokenType: 'Bearer',
        idToken: 'id-token-123',
      };

      const expectedAccount = {
        id: 'oauth-123',
        ...accountData,
        refreshToken: null,
        expiresAt: null,
        sessionState: null,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
      };

      mockPrisma.oAuthAccount.create.mockResolvedValue(expectedAccount);

      // Act
      const result = await userRepository.createOAuthAccount(accountData);

      // Assert
      expect(mockPrisma.oAuthAccount.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: accountData.userId } },
          provider: accountData.provider,
          providerAccountId: accountData.providerAccountId,
          accessToken: accountData.accessToken,
          scope: accountData.scope,
          tokenType: accountData.tokenType,
          idToken: accountData.idToken,
        },
      });
      expect(result).toEqual(expectedAccount);
    });
  });

  describe('createUserProfile', () => {
    it('should create user profile successfully', async () => {
      // Arrange
      const profileData = {
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Software developer',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const expectedProfile = {
        id: 'profile-123',
        ...profileData,
        displayName: null,
        timezone: null,
        preferences: null,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
      };

      mockPrisma.userProfile.create.mockResolvedValue(expectedProfile);

      // Act
      const result = await userRepository.createUserProfile(profileData);

      // Assert
      expect(mockPrisma.userProfile.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: profileData.userId } },
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          bio: profileData.bio,
          avatarUrl: profileData.avatarUrl,
        },
      });
      expect(result).toEqual(expectedProfile);
    });
  });
});