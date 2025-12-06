import { LogProvider } from './LogProvider';
import { PinoLogProvider } from './PinoLogProvider';

export function createLogger(): LogProvider {
  return new PinoLogProvider();
}
