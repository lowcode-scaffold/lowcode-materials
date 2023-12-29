import * as path from 'path';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const explorerSelectedPath = path
    .join(lowcodeContext?.explorerSelectedPath || '')
    .replace(/\\/g, '/');
  const name = explorerSelectedPath.split('/').pop();
}
