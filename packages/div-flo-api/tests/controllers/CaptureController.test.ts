import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CaptureController } from '../../src/controllers/CaptureController';
import { ICaptureService, IUserService } from '@div-flo/models';
import { Request, Response } from 'express';

describe('CaptureController', () => {
  let controller: CaptureController;
  let mockCaptureService: any;
  let mockUserService: any;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockCaptureService = {
      createCapture: vi.fn(),
      getCaptureById: vi.fn(),
      updateCapture: vi.fn(),
      deleteCapture: vi.fn(),
      listCapturesByUser: vi.fn(),
    };
    mockUserService = {
      getUserByEmail: vi.fn(),
    };
    controller = new CaptureController(mockCaptureService, mockUserService);
    req = {};
    res = { status: vi.fn().mockReturnThis(), json: vi.fn(), send: vi.fn() };
  });

  it('should create a capture', async () => {
    mockCaptureService.createCapture.mockResolvedValue({
      id: '1',
      userId: 'user1',
      rawText: 'test',
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z'),
      migratedDate: null
    });
    req.body = { rawText: 'test' };
    await controller['createCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: '1',
      userId: 'user1',
      rawText: 'test',
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z'),
      migratedDate: null
    });
  });

  it('should handle error when creating capture', async () => {
    mockCaptureService.createCapture.mockRejectedValue(new Error('Create failed'));
    req.body = { rawText: 'test' };
    await controller['createCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Create failed' });
  });

  it('should get capture by id', async () => {
    mockCaptureService.getCaptureById.mockResolvedValue({
      id: '1',
      userId: 'user1',
      rawText: 'test',
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z'),
      migratedDate: null
    });
    req.params = { id: '1' };
    await controller['getCapture'](req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('should return 404 when capture not found', async () => {
    mockCaptureService.getCaptureById.mockResolvedValue(null);
    req.params = { id: '999' };
    await controller['getCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Capture not found' });
  });

  it('should update capture', async () => {
    mockCaptureService.updateCapture.mockResolvedValue({
      id: '1',
      userId: 'user1',
      rawText: 'updated',
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z'),
      migratedDate: null
    });
    req.params = { id: '1' };
    req.body = { rawText: 'updated' };
    await controller['updateCapture'](req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ rawText: 'updated' }));
  });

  it('should handle error when updating capture', async () => {
    mockCaptureService.updateCapture.mockRejectedValue(new Error('Update failed'));
    req.params = { id: '1' };
    req.body = { rawText: 'updated' };
    await controller['updateCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Update failed' });
  });

  it('should delete capture', async () => {
    mockCaptureService.deleteCapture.mockResolvedValue();
    req.params = { id: '1' };
    await controller['deleteCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should handle error when deleting capture', async () => {
    mockCaptureService.deleteCapture.mockRejectedValue(new Error('Delete failed'));
    req.params = { id: '1' };
    await controller['deleteCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Delete failed' });
  });

  it('should list captures by user', async () => {
    mockCaptureService.listCapturesByUser.mockResolvedValue([{
      id: '1',
      userId: 'user1',
      rawText: 'test',
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z'),
      migratedDate: null
    }]);
    req.params = { userId: 'user1' };
    req.query = {};
    await controller['listCapturesByUser'](req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object)]));
  });

  it('should list only unmigrated captures when migrated=false', async () => {
    mockCaptureService.listCapturesByUser.mockResolvedValue([{
      id: '1',
      userId: 'user1',
      rawText: 'test',
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z'),
      migratedDate: null
    }]);
    req.params = { userId: 'user1' };
    req.query = { migrated: 'false' };
    await controller['listCapturesByUser'](req as Request, res as Response);
    expect(mockCaptureService.listCapturesByUser).toHaveBeenCalledWith('user1', true);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object)]));
  });

  it('should handle error when listing captures', async () => {
    mockCaptureService.listCapturesByUser.mockRejectedValue(new Error('List failed'));
    req.params = { userId: 'user1' };
    req.query = {};
    await controller['listCapturesByUser'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'List failed' });
  });

  it('should list captures by user email', async () => {
    mockUserService.getUserByEmail.mockResolvedValue({
      id: 'user1',
      email: 'test@example.com',
      username: 'testuser',
      emailVerified: false,
      password: null,
      lastLoginAt: null,
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    });
    mockCaptureService.listCapturesByUser.mockResolvedValue([{
      id: '1',
      userId: 'user1',
      rawText: 'test',
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z'),
      migratedDate: null
    }]);
    req.params = { email: 'test@example.com' };
    req.query = {};
    await controller['listCapturesByUserEmail'](req as Request, res as Response);
    expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockCaptureService.listCapturesByUser).toHaveBeenCalledWith('user1', false);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object)]));
  });

  it('should return 404 when user not found by email', async () => {
    mockUserService.getUserByEmail.mockResolvedValue(null);
    req.params = { email: 'notfound@example.com' };
    req.query = {};
    await controller['listCapturesByUserEmail'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should list only unmigrated captures by email when migrated=false', async () => {
    mockUserService.getUserByEmail.mockResolvedValue({
      id: 'user1',
      email: 'test@example.com',
      username: 'testuser',
      emailVerified: false,
      password: null,
      lastLoginAt: null,
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z')
    });
    mockCaptureService.listCapturesByUser.mockResolvedValue([{
      id: '1',
      userId: 'user1',
      rawText: 'test',
      createdAt: new Date('2025-10-16T00:00:00Z'),
      updatedAt: new Date('2025-10-16T00:00:00Z'),
      migratedDate: null
    }]);
    req.params = { email: 'test@example.com' };
    req.query = { migrated: 'false' };
    await controller['listCapturesByUserEmail'](req as Request, res as Response);
    expect(mockCaptureService.listCapturesByUser).toHaveBeenCalledWith('user1', true);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object)]));
  });
});
