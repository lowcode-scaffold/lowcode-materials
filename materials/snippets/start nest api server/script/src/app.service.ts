import { Injectable } from '@nestjs/common';
import { context } from './context';

@Injectable()
export class AppService {
  getMaterialPath() {
    return context.lowcodeContext?.materialPath;
  }
}
