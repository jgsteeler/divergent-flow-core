import { LogProvider } from './LogProvider';
import pino from 'pino';

export class PinoLogProvider implements LogProvider {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'production' ? undefined : {
        target: 'pino-pretty',
        options: { colorize: true }
      }
    });
  }

  info(message: string, meta?: object) {
    this.logger.info(meta || {}, message);
  }
  warn(message: string, meta?: object) {
    this.logger.warn(meta || {}, message);
  }
  error(message: string, meta?: object) {
    this.logger.error(meta || {}, message);
  }
  debug(message: string, meta?: object) {
    this.logger.debug(meta || {}, message);
  }
}
