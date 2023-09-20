import fs from 'fs';
import path from 'path';
import { translate } from '../../../../../share/TypeChatSlim/index';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const schema = fs.readFileSync(
    path.join(lowcodeContext!.materialPath, 'config/schema.ts'),
    'utf8',
  );
  const res = await translate({
    schema,
    typeName: 'IOption',
    request: `审核状态：0待审批，2未通过，1已完成，3已撤销`,
    createChatCompletion: lowcodeContext!.createChatCompletion,
  });
  console.log(JSON.stringify(res, null, 2));
}
