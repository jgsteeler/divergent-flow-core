import { injectable, inject } from 'tsyringe';
import { IVersionService, IVersionRepository, VersionInfo } from '@div-flo/models';

@injectable()
export class VersionService implements IVersionService {
  constructor(
    @inject('IVersionRepository') private versionRepository: IVersionRepository
  ) {}

  async getVersion(): Promise<VersionInfo> {
    return await this.versionRepository.getVersionInfo();
  }
}