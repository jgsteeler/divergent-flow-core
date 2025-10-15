import { VersionInfo } from '../dto/VersionInfo';

export interface IVersionService {
  getVersion(): Promise<VersionInfo>;
}