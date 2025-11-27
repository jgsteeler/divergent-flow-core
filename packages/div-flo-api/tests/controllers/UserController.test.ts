import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserController } from '../../src/controllers/UserController';
import { IUserService } from '@div-flo/models';
import { Request, Response } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let mockService: any;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = {
      createUser: vi.fn(),
      getUserById: vi.fn(),
      getUserByEmail: vi.fn(),
      getUserByUsername: vi.fn(),
      getUserByOAuthAccount: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      listUsers: vi.fn(),
      createOAuthAccount: vi.fn(),
      createUserProfile: vi.fn(),
    };
    controller = new UserController(mockService);
    req = {};
    res = { status: vi.fn().mockReturnThis(), json: vi.fn(), send: vi.fn() };
  });

  it('should create a user', async () => {
    mockService.createUser.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      emailVerified: false,
      password: null,
      lastLoginAt: null,
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    });
    req.body = { email: 'test@example.com', username: 'testuser' };
    await controller['createUser'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      emailVerified: false,
      password: null,
      lastLoginAt: null,
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    });
  });

  it('should handle error when creating user', async () => {
    mockService.createUser.mockRejectedValue(new Error('User exists'));
    req.body = { email: 'test@example.com', username: 'testuser' };
    await controller['createUser'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'User exists' });
  });

  it('should list users', async () => {
    mockService.listUsers.mockResolvedValue([{
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      emailVerified: false,
      password: null,
      lastLoginAt: null,
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    }]);
    await controller['listUsers'](req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object)]));
  });

  it('should handle error when listing users', async () => {
    mockService.listUsers.mockRejectedValue(new Error('DB error'));
    await controller['listUsers'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
  });

  it('should get user by id', async () => {
    mockService.getUserById.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      emailVerified: false,
      password: null,
      lastLoginAt: null,
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    });
    req.params = { id: '1' };
    await controller['getUser'](req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('should return 404 when user not found by id', async () => {
    mockService.getUserById.mockResolvedValue(null);
    req.params = { id: '999' };
    await controller['getUser'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should get user by email', async () => {
    mockService.getUserByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      emailVerified: false,
      password: null,
      lastLoginAt: null,
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    });
    req.params = { email: 'test@example.com' };
    await controller['getUserByEmail'](req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com' }));
  });

  it('should return 404 when user not found by email', async () => {
    mockService.getUserByEmail.mockResolvedValue(null);
    req.params = { email: 'notfound@example.com' };
    await controller['getUserByEmail'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should get user by username', async () => {
    mockService.getUserByUsername.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      emailVerified: false,
      password: null,
      lastLoginAt: null,
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    });
    req.params = { username: 'testuser' };
    await controller['getUserByUsername'](req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ username: 'testuser' }));
  });

  it('should return 404 when user not found by username', async () => {
    mockService.getUserByUsername.mockResolvedValue(null);
    req.params = { username: 'notfound' };
    await controller['getUserByUsername'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should update user', async () => {
    mockService.updateUser.mockResolvedValue({
      id: '1',
      email: 'updated@example.com',
      username: 'testuser',
      emailVerified: false,
      password: null,
      lastLoginAt: null,
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    });
    req.params = { id: '1' };
    req.body = { email: 'updated@example.com' };
    await controller['updateUser'](req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ email: 'updated@example.com' }));
  });

  it('should handle error when updating user', async () => {
    mockService.updateUser.mockRejectedValue(new Error('Update failed'));
    req.params = { id: '1' };
    req.body = { email: 'updated@example.com' };
    await controller['updateUser'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Update failed' });
  });

  it('should delete user', async () => {
    mockService.deleteUser.mockResolvedValue();
    req.params = { id: '1' };
    await controller['deleteUser'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should handle error when deleting user', async () => {
    mockService.deleteUser.mockRejectedValue(new Error('Delete failed'));
    req.params = { id: '1' };
    await controller['deleteUser'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Delete failed' });
  });

  describe('provisionFromOIDC', () => {
    it('should return 400 when sub or email is missing', async () => {
      req.body = { sub: 'user123' }; // missing email
      await controller['provisionFromOIDC'](req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'sub and email are required' });
    });

    it('should update last login for existing OIDC user', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        emailVerified: true,
        password: null,
        lastLoginAt: null,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z')
      };

      mockService.getUserByOAuthAccount.mockResolvedValue(existingUser);
      mockService.updateUser.mockResolvedValue({
        ...existingUser,
        lastLoginAt: expect.any(Date)
      });

      req.body = { sub: 'user123', email: 'test@example.com' };
      await controller['provisionFromOIDC'](req as Request, res as Response);

      expect(mockService.getUserByOAuthAccount).toHaveBeenCalledWith('keycloak', 'user123');
      expect(mockService.updateUser).toHaveBeenCalledWith({
        id: '1',
        lastLoginAt: expect.any(Date)
      });
      expect(res.json).toHaveBeenCalledWith({
        ...existingUser,
        lastLoginAt: expect.any(Date)
      });
    });

    it('should link OIDC account to existing user by email and update last login', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        emailVerified: false,
        password: null,
        lastLoginAt: null,
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z')
      };

      mockService.getUserByOAuthAccount.mockResolvedValue(null);
      mockService.getUserByEmail.mockResolvedValue(existingUser);
      mockService.createOAuthAccount.mockResolvedValue(undefined);
      mockService.updateUser.mockResolvedValue({
        ...existingUser,
        lastLoginAt: expect.any(Date)
      });

      req.body = { sub: 'user123', email: 'test@example.com' };
      await controller['provisionFromOIDC'](req as Request, res as Response);

      expect(mockService.getUserByOAuthAccount).toHaveBeenCalledWith('keycloak', 'user123');
      expect(mockService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockService.createOAuthAccount).toHaveBeenCalledWith({
        userId: '1',
        provider: 'keycloak',
        providerAccountId: 'user123'
      });
      expect(mockService.updateUser).toHaveBeenCalledWith({
        id: '1',
        lastLoginAt: expect.any(Date)
      });
      expect(res.json).toHaveBeenCalledWith({
        ...existingUser,
        lastLoginAt: expect.any(Date)
      });
    });

    it('should create new user with OIDC account and profile', async () => {
      const newUser = {
        id: '2',
        email: 'new@example.com',
        username: 'newuser',
        emailVerified: true,
        password: null,
        lastLoginAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      mockService.getUserByOAuthAccount.mockResolvedValue(null);
      mockService.getUserByEmail.mockResolvedValue(null);
      mockService.createUser.mockResolvedValue(newUser);
      mockService.createOAuthAccount.mockResolvedValue(undefined);
      mockService.createUserProfile.mockResolvedValue(undefined);

      req.body = {
        sub: 'user456',
        email: 'new@example.com',
        email_verified: true,
        preferred_username: 'newuser',
        name: 'John Doe',
        given_name: 'John',
        family_name: 'Doe'
      };
      await controller['provisionFromOIDC'](req as Request, res as Response);

      expect(mockService.createUser).toHaveBeenCalledWith({
        email: 'new@example.com',
        username: 'newuser',
        emailVerified: true,
        password: null,
        lastLoginAt: expect.any(Date)
      });
      expect(mockService.createOAuthAccount).toHaveBeenCalledWith({
        userId: '2',
        provider: 'keycloak',
        providerAccountId: 'user456'
      });
      expect(mockService.createUserProfile).toHaveBeenCalledWith({
        userId: '2',
        displayName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe'
      });
      expect(res.json).toHaveBeenCalledWith(newUser);
    });

    it('should create new user with fallback username from email', async () => {
      const newUser = {
        id: '3',
        email: 'fallback@example.com',
        username: 'fallback',
        emailVerified: false,
        password: null,
        lastLoginAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      mockService.getUserByOAuthAccount.mockResolvedValue(null);
      mockService.getUserByEmail.mockResolvedValue(null);
      mockService.createUser.mockResolvedValue(newUser);
      mockService.createOAuthAccount.mockResolvedValue(undefined);

      req.body = {
        sub: 'user789',
        email: 'fallback@example.com'
        // no preferred_username, should use email prefix
      };
      await controller['provisionFromOIDC'](req as Request, res as Response);

      expect(mockService.createUser).toHaveBeenCalledWith({
        email: 'fallback@example.com',
        username: 'fallback',
        emailVerified: false,
        password: null,
        lastLoginAt: expect.any(Date)
      });
      expect(mockService.createOAuthAccount).toHaveBeenCalledWith({
        userId: '3',
        provider: 'keycloak',
        providerAccountId: 'user789'
      });
      expect(res.json).toHaveBeenCalledWith(newUser);
    });

    it('should create new user without profile when no name info provided', async () => {
      const newUser = {
        id: '4',
        email: 'minimal@example.com',
        username: 'minimal',
        emailVerified: false,
        password: null,
        lastLoginAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      mockService.getUserByOAuthAccount.mockResolvedValue(null);
      mockService.getUserByEmail.mockResolvedValue(null);
      mockService.createUser.mockResolvedValue(newUser);
      mockService.createOAuthAccount.mockResolvedValue(undefined);

      req.body = {
        sub: 'user999',
        email: 'minimal@example.com'
        // no name fields
      };
      await controller['provisionFromOIDC'](req as Request, res as Response);

      expect(mockService.createUser).toHaveBeenCalledWith({
        email: 'minimal@example.com',
        username: 'minimal',
        emailVerified: false,
        password: null,
        lastLoginAt: expect.any(Date)
      });
      expect(mockService.createOAuthAccount).toHaveBeenCalledWith({
        userId: '4',
        provider: 'keycloak',
        providerAccountId: 'user999'
      });
      expect(mockService.createUserProfile).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(newUser);
    });

    it('should handle errors during OIDC provisioning', async () => {
      mockService.getUserByOAuthAccount.mockRejectedValue(new Error('Database connection failed'));

      req.body = { sub: 'user123', email: 'test@example.com' };
      await controller['provisionFromOIDC'](req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database connection failed' });
    });
  });
});
