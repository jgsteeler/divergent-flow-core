import { VersionInfo } from '../dtos/VersionInfo';

export interface IVersionRepository {
  getVersionInfo(): Promise<VersionInfo>;
}