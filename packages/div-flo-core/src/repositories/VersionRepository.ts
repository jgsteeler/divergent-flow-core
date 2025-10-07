import { injectable } from 'tsyringe';
import { IVersionRepository, VersionInfo } from '@div-flo/models';

@injectable()
export class VersionRepository implements IVersionRepository {
  async getVersionInfo(): Promise<VersionInfo> {
    // In a real app, this would query a database or external service
    // For now, return static info
    return {
      version: "0.1.0",
      service: "divergent-flow-core",
      timestamp: new Date().toISOString()
    };
  }
}