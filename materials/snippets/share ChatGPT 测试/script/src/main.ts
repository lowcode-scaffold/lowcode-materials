import * as path from 'path';
import * as fs from 'fs-extra';
import { window, Range } from 'vscode';
import { generalBasic } from '../../../../../share/BaiduOCR/index';
import { translate } from '../../../../../share/TypeChatSlim/index';
import { createChatCompletion } from '../../../../../share/utils/openai';
import { context } from './context';
import { IColumns } from '../../config/schema';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const res = await createChatCompletion({
    messages: [{ role: 'user', content: '你好' }],
    handleChunk(data) {
      lowcodeContext?.log.append(data.text || '');
    },
  });
}
