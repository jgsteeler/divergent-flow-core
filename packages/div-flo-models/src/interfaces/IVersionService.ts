import { VersionInfo } from '../dtos/VersionInfo';

export interface IVersionService {
  getVersion(): Promise<VersionInfo>;
}