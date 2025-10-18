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
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as any;
    controller = new UserController(mockService);
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
  });

  it('should create a user', async () => {
    mockService.createUser.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      preferences: {},
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    });
    req.body = { email: 'test@example.com' };
    await controller['createUser'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      preferences: {},
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    });
  });

  // Add more tests for getUser, getUserByEmail, updateUser, deleteUser
});
