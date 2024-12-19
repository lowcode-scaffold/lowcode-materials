import path from 'path';
import * as fs from 'fs-extra';
import * as execa from 'execa';
import * as ejs from 'ejs';
import axios from 'axios';
import { clipboard } from 'electron';
import { generalBasic } from '@share/BaiduOCR/index';
import { getShareData } from '@share/utils/shareData';
import { renderEjsTemplates } from '@share/utils/ejs';
import { typescriptToMock } from '@share/utils/platformIndependent/json';
import { MethodHandle } from '@share/uTools/webviewBaseController';
import { getBlockJsonValidSchema, getBlockPath } from '@share/utils/uTools';

export const openChatGPT: MethodHandle = async (data) => {
  const schema = getBlockJsonValidSchema(data.scriptFile);
  const clipboardText = JSON.stringify(data.model);
  const typeName = 'IOption';
  const requestPrompt =
    `You are a service that translates user requests into JSON objects of type "${typeName}" according to the following TypeScript definitions:\n` +
    `\`\`\`\n${schema}\`\`\`\n` +
    `The following is a user request:\n` +
    `"""\n${clipboardText}\n"""\n` +
    `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`;
  return {
    updateModelImmediately: true,
    onlyUpdateParams: false,
    params: '',
    showChat: true,
    chatContent: requestPrompt,
    model: data.model,
  };
};
