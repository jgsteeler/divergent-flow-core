import { injectable, inject } from 'tsyringe';
import { ICaptureRepository, ICaptureService, IUserService } from '@div-flo/models';
import { Capture } from '@prisma/client';

@injectable()
export class CaptureService implements ICaptureService {
  constructor(
    @inject('ICaptureRepository') private repo: ICaptureRepository,
    @inject('IUserService') private userService: IUserService
  ) {}

  async createCapture(capture: any): Promise<Capture> {
    let { userId, rawText, ...rest } = capture;
    console.log('[CaptureService] Incoming userId:', userId);

    const internalUserId = await this.userService.getInternalUserId(userId, 'auth0');
    if (!internalUserId || !rawText) {
      throw new Error('Valid userId and rawText are required');
    }
    return this.repo.create({ userId: internalUserId, rawText, ...rest });
  }

  async getCaptureById(id: string): Promise<Capture | null> {
    return this.repo.findById(id);
  }

  async updateCapture(capture: Capture): Promise<Capture> {
    if (!capture.id) throw new Error('id is required');
    if (!capture.userId) throw new Error('userId is required');
    const internalUserId = await this.userService.getInternalUserId(capture.userId, 'auth0');
    if (!internalUserId) throw new Error('Valid internal userId is required');
    return this.repo.update({ ...capture, userId: internalUserId });
  }

  async deleteCapture(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async listCapturesByUser(userId: string, onlyUnmigrated?: boolean): Promise<Capture[]> {
    if (!userId) throw new Error('userId is required');
    const internalUserId = await this.userService.getInternalUserId(userId, 'auth0');
    if (!internalUserId) throw new Error('Valid internal userId is required');
    return this.repo.listByUser(internalUserId, onlyUnmigrated);
  }
}