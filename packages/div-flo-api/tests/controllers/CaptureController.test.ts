import { CaptureController } from '../../src/controllers/CaptureController';
import { ICaptureService } from '@div-flo/models';
import { Request, Response } from 'express';

describe('CaptureController', () => {
  let controller: CaptureController;
  let mockService: jest.Mocked<ICaptureService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = {
      createCapture: jest.fn(),
      getCaptureById: jest.fn(),
      updateCapture: jest.fn(),
      deleteCapture: jest.fn(),
      listCapturesByUser: jest.fn(),
    } as any;
    controller = new CaptureController(mockService);
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
  });

  it('should create a capture', async () => {
    mockService.createCapture.mockResolvedValue({
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
    mockService.createCapture.mockRejectedValue(new Error('Create failed'));
    req.body = { rawText: 'test' };
    await controller['createCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Create failed' });
  });

  it('should get capture by id', async () => {
    mockService.getCaptureById.mockResolvedValue({
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
    mockService.getCaptureById.mockResolvedValue(null);
    req.params = { id: '999' };
    await controller['getCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Capture not found' });
  });

  it('should update capture', async () => {
    mockService.updateCapture.mockResolvedValue({
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
    mockService.updateCapture.mockRejectedValue(new Error('Update failed'));
    req.params = { id: '1' };
    req.body = { rawText: 'updated' };
    await controller['updateCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Update failed' });
  });

  it('should delete capture', async () => {
    mockService.deleteCapture.mockResolvedValue();
    req.params = { id: '1' };
    await controller['deleteCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should handle error when deleting capture', async () => {
    mockService.deleteCapture.mockRejectedValue(new Error('Delete failed'));
    req.params = { id: '1' };
    await controller['deleteCapture'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Delete failed' });
  });

  it('should list captures by user', async () => {
    mockService.listCapturesByUser.mockResolvedValue([{
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
    mockService.listCapturesByUser.mockResolvedValue([{
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
    expect(mockService.listCapturesByUser).toHaveBeenCalledWith('user1', true);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object)]));
  });

  it('should handle error when listing captures', async () => {
    mockService.listCapturesByUser.mockRejectedValue(new Error('List failed'));
    req.params = { userId: 'user1' };
    req.query = {};
    await controller['listCapturesByUser'](req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'List failed' });
  });
});
