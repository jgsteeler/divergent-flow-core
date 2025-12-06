import { LogProvider } from './LogProvider';

export class ConsoleLogProvider implements LogProvider {
  info(message: string, meta?: object) {
    console.info(`[INFO] ${message}`, meta || '');
  }
  warn(message: string, meta?: object) {
    console.warn(`[WARN] ${message}`, meta || '');
  }
  error(message: string, meta?: object) {
    console.error(`[ERROR] ${message}`, meta || '');
  }
  debug(message: string, meta?: object) {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
}
