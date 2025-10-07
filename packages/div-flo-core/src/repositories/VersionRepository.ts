import { injectable } from 'tsyringe';
import { IVersionRepository, VersionInfo } from '@div-flo/models';
import * as fs from 'fs';
import * as path from 'path';

@injectable()
export class VersionRepository implements IVersionRepository {
  private getPackageVersion(): string {
    try {
      // Read from this package's package.json
      // __dirname is dist/repositories, so we need to go up to package root
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    } catch (error) {
      console.warn('Could not read package version:', error);
      return '0.0.0'; // Fallback version
    }
  }

  async getVersionInfo(): Promise<VersionInfo> {
    return {
      version: this.getPackageVersion(),
      service: "divergent-flow-core",
      timestamp: new Date().toISOString()
    };
  }
}