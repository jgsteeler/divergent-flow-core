import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock PrismaClient BEFORE importing UserService
const mockPrismaClient = {
  user: {
    create: vi.fn(),
    update: vi.fn(),
  },
  oAuthAccount: {
    findUnique: vi.fn(),
  },
  userProfile: {
    create: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

import { UserService } from '../../../src/services/UserService';
import { IUserRepository } from '@div-flo/models/src/interfaces/IUserRepository';
import { User } from '@prisma/client';

describe('UserService', () => {
  let repo: any;
  let service: UserService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    repo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };
    service = new UserService(repo);
  });

  it('throws if email or username is missing on create', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.findByUsername.mockResolvedValue(null);
    await expect(service.createUser({ username: 'foo' } as any)).rejects.toThrow('email and username are required');
    await expect(service.createUser({ email: 'foo@example.com' } as any)).rejects.toThrow('email and username are required');
  });

  it('throws if user with email already exists', async () => {
    const existingUser = { id: 'u2', email: 'foo@example.com', username: 'existing' } as User;
    repo.findByEmail.mockResolvedValue(existingUser);
    repo.findByUsername.mockResolvedValue(null);
    await expect(service.createUser({ email: 'foo@example.com', username: 'foo' } as any)).rejects.toThrow('User with this email already exists');
  });

  it('throws if user with username already exists', async () => {
    const existingUser = { id: 'u2', email: 'other@example.com', username: 'foo' } as User;
    repo.findByEmail.mockResolvedValue(null);
    repo.findByUsername.mockResolvedValue(existingUser);
    await expect(service.createUser({ email: 'foo@example.com', username: 'foo' } as any)).rejects.toThrow('User with this username already exists');
  });

  it.skip('calls prisma.user.create with valid data', async () => {
    const data = { id: 'u1', email: 'foo@example.com', username: 'foo', emailVerified: false, createdAt: new Date(), updatedAt: new Date() } as User;
    repo.findByEmail.mockResolvedValue(null);
    repo.findByUsername.mockResolvedValue(null);
    mockPrismaClient.user.create.mockResolvedValue(data);
    const result = await service.createUser(data);
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
    expect(result).toBe(data);
  });

  it('calls repo.findById', async () => {
    repo.findById.mockResolvedValue(null);
  await service.getUserById('u1');
    expect(repo.findById).toHaveBeenCalledWith('u1');
  });

  it('calls repo.findByEmail', async () => {
    repo.findByEmail.mockResolvedValue(null);
    await service.getUserByEmail('foo@example.com');
    expect(repo.findByEmail).toHaveBeenCalledWith('foo@example.com');
  });

  it('throws if id missing on update', async () => {
    await expect(service.updateUser({} as any)).rejects.toThrow('id is required');
  });

  it('calls repo.findByUsername', async () => {
    repo.findByUsername.mockResolvedValue(null);
    await service.getUserByUsername('foo');
    expect(repo.findByUsername).toHaveBeenCalledWith('foo');
  });

  it.skip('calls prisma.user.update with valid data', async () => {
    const data = { id: 'u1', email: 'foo@example.com', username: 'foo', emailVerified: false, createdAt: new Date(), updatedAt: new Date() } as User;
    mockPrismaClient.user.update.mockResolvedValue(data);
    const result = await service.updateUser(data);
    expect(mockPrismaClient.user.update).toHaveBeenCalled();
    expect(result).toBe(data);
  });

  it('calls repo.delete', async () => {
    repo.delete.mockResolvedValue();
    await service.deleteUser('u1');
    expect(repo.delete).toHaveBeenCalledWith('u1');
  });
});
