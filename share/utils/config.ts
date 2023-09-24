import * as path from 'path';
import * as fs from 'fs-extra';
import { workspace } from 'vscode';
import { getFileContent } from './file';

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

export const getConfig: () => Config = () => {
  let config: Config;
  if (fs.existsSync(path.join(workspace.rootPath || '', '.lowcoderc'))) {
    config = JSON.parse(getFileContent('.lowcoderc') || '{}');
    config.yapi?.projects?.forEach((s) => {
      s.domain = s.domain || config.yapi?.domain || '';
    });
  } else {
    config = {};
  }
  return config;
};
