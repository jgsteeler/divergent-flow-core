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

  // Add more tests for getCapture, updateCapture, deleteCapture, listCapturesByUser
});
