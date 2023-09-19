import { translate } from '../../../../../share/TypeChatSlim/index';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const res = await translate({
    schema: `interface User {
			name: string;
			age: number;
		}`,
    typeName: 'User',
    request: '用户名，年龄',
    createChatCompletion: lowcodeContext!.createChatCompletion,
  });
  console.log(res, 123);
}
