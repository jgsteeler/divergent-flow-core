import { VersionInfo } from '../dto/VersionInfo';

export interface IVersionRepository {
  getVersionInfo(): Promise<VersionInfo>;
}