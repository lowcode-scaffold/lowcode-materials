import { genCodeByYapi } from './genCode/genCodeByYapi';

export async function bootstrap() {
  await genCodeByYapi('259028', '123');
}
