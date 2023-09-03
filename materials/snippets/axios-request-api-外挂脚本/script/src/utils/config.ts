import * as path from 'path';
import * as fs from 'fs-extra';
import { workspace } from 'vscode';
import { getFileContent } from './file';

const defaultConfig: Config = {
  yapi: { projects: [] },
  mock: { mockKeyWordEqual: [], mockKeyWordLike: [] },
  commonlyUsedBlock: [],
};

export type Config = {
  yapi?: {
    domain?: string;
    projects?: {
      name: string;
      token: string;
      domain: string;
    }[];
  };
  mock?: {
    mockNumber?: string;
    mockBoolean?: string;
    mockString?: string;
    mockKeyWordEqual?: {
      key: string;
      value: string;
    }[];
    mockKeyWordLike?: {
      key: string;
      value: string;
    }[];
  };
  commonlyUsedBlock?: string[];
};

type ChatGPTConfig = {
  hostname: string;
  apiPath: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
};

export const getConfig: () => Config = () => {
  let config: Config = {};
  if (fs.existsSync(path.join(workspace.rootPath || '', '.lowcoderc'))) {
    config = JSON.parse(getFileContent('.lowcoderc') || '{}');
    config.yapi?.projects?.forEach((s) => {
      s.domain = s.domain || config.yapi?.domain || '';
    });
  }
  return { ...defaultConfig, ...config, syncFolder: getSyncFolder() };
};

export const getSyncFolder = () =>
  workspace.getConfiguration('lowcode').get<string>('syncFolder', '');
