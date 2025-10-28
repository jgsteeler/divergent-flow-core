import { injectable } from 'tsyringe';
import { IVersionRepository, VersionInfo } from '@div-flo/models';
import * as fs from 'fs';
import * as path from 'path';

@injectable()
export class VersionRepository implements IVersionRepository {
  private getPackageVersion(): string {
    try {
      // Walk up from __dirname to find the nearest package.json. This handles
      // running from dist (where package.json may be at ../.. or higher) as
      // well as production Docker images where package.json lives at
      // /app/packages/<pkg>/package.json.
      let current = __dirname;
      for (let i = 0; i < 6; i++) {
        const candidate = path.join(current, 'package.json');
        if (fs.existsSync(candidate)) {
          const packageJson = JSON.parse(fs.readFileSync(candidate, 'utf8'));
          return packageJson.version;
        }
        current = path.join(current, '..');
      }
      // As a last resort, try the process working directory (e.g., /app)
      const cwdCandidate = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(cwdCandidate)) {
        const packageJson = JSON.parse(fs.readFileSync(cwdCandidate, 'utf8'));
        return packageJson.version;
      }
      console.warn('Could not find package.json while resolving version');
      return '0.0.0';
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