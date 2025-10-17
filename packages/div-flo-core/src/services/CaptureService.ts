import { injectable, inject } from 'tsyringe';
import { ICaptureRepository, ICaptureService } from '@div-flo/models';
import { Capture } from '@prisma/client';

@injectable()
export class CaptureService implements ICaptureService {
  constructor(
    @inject('ICaptureRepository') private repo: ICaptureRepository
  ) {}

  async createCapture(capture: Capture): Promise<Capture> {
    if (!capture.userId || !capture.rawText) {
      throw new Error('userId and rawText are required');
    }
    return this.repo.create(capture);
  }

  async getCaptureById(id: string): Promise<Capture | null> {
    return this.repo.findById(id);
  }

  async updateCapture(capture: Capture): Promise<Capture> {
    if (!capture.id) throw new Error('id is required');
    return this.repo.update(capture);
  }

  async deleteCapture(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async listCapturesByUser(userId: string): Promise<Capture[]> {
    if (!userId) throw new Error('userId is required');
    return this.repo.listByUser(userId);
  }
}