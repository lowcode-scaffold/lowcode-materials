import { genCodeByYapi } from './genCode/genCodeByYapi';

export async function bootstrap() {
  await genCodeByYapi('123', '123');
}
