import { UserController } from '../../src/controllers/UserController';
import { IUserService } from '@div-flo/models';
import { Request, Response } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let mockService: jest.Mocked<IUserService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserByUsername: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      listUsers: jest.fn(),
    } as any;
    controller = new UserController(mockService);
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
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
});
