import 'reflect-metadata';
import { UserService } from '../../../src/services/UserService';
import { IUserRepository } from '@div-flo/models/src/interfaces/IUserRepository';
import { User } from '@prisma/client';

describe('UserService', () => {
  let repo: jest.Mocked<IUserRepository>;
  let service: UserService;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };
    service = new UserService(repo);
  });

  it('throws if email or name is missing on create', async () => {
    await expect(service.createUser({ name: 'foo' } as any)).rejects.toThrow('email and name are required');
    await expect(service.createUser({ email: 'foo@example.com' } as any)).rejects.toThrow('email and name are required');
  });

  it('calls repo.create with valid data', async () => {
    const data = { id: 'u1', email: 'foo@example.com', name: 'foo', createdAt: new Date(), updatedAt: new Date() } as User;
    repo.create.mockResolvedValue(data);
    const result = await service.createUser(data);
    expect(repo.create).toHaveBeenCalledWith(data);
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

  it('calls repo.update with valid data', async () => {
    const data = { id: 'u1', email: 'foo@example.com', name: 'foo', createdAt: new Date(), updatedAt: new Date() } as User;
    repo.update.mockResolvedValue(data);
    const result = await service.updateUser(data);
    expect(repo.update).toHaveBeenCalledWith(data);
    expect(result).toBe(data);
  });

  it('calls repo.delete', async () => {
    repo.delete.mockResolvedValue();
    await service.deleteUser('u1');
    expect(repo.delete).toHaveBeenCalledWith('u1');
  });
});
