import path from 'path';
import * as fs from 'fs-extra';
import { createChatCompletion } from '../LLM/openaiV2';

export const screenCapture = () =>
  new Promise<string>((resolve, reject) => {
    utools.screenCapture((res) => {
      resolve(res);
    });
  });

type LLMMessage = (
  | {
      role: 'system';
      content: string;
    }
  | {
      role: 'user';
      content:
        | string
        | (
            | {
                type: 'image_url';
                image_url: { url: string };
              }
            | { type: 'text'; text: string }
          )[];
    }
)[];
export const askChatGPT = async (data: {
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
  hostname?: string;
  apiKey?: string;
  apiPath?: string;
  port?: number;
  notHttps?: boolean;
  model?: string;
  maxTokens?: number;
}) => {
  const res = await createChatCompletion({
    apiKey: data.apiKey,
    hostname: data.hostname,
    apiPath: data.apiPath,
    port: data.port,
    notHttps: data.notHttps,
    messages: data.messages,
    model: data.model,
    maxTokens: data.maxTokens,
    handleChunk(chunck) {
      data.handleChunk(chunck.text || '');
    },
  });
  return { content: res };
};

export const getBlockJsonValidSchema = (
  mainScriptFile: string,
  schemaFileName = 'schema.ts',
) => {
  const configPath = getBlockConfigPath(mainScriptFile);
  return fs.readFileSync(path.join(configPath, schemaFileName), 'utf8');
};

/** 获取脚本目录 */
export const getBlockPath = (mainScriptFile: string) => {
  return path.join(
    mainScriptFile
      .replace('/script/src/mainBundle', '')
      .replace('/script/src/main', ''),
  );
};

export const getBlockConfigPath = (mainScriptFile: string) => {
  const configPath = path.join(
    mainScriptFile
      .replace('/script/src/mainBundle', '/config')
      .replace('/script/src/main', '/config'),
  );
  return configPath;
};

export const getBlockTemplatePath = (mainScriptFile: string) => {
  const configPath = path.join(
    mainScriptFile
      .replace('/script/src/mainBundle', '/src')
      .replace('/script/src/main', '/src'),
  );
  return configPath;
};
