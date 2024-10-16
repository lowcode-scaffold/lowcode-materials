import path from 'path';
import { homedir } from 'os';
import * as fs from 'fs-extra';

const dataFile = path.join(homedir(), '.lowcode', 'data.json');

export type ShareData = {
  activeWindow?: string;
  selectedFolder?: string;
  oneAPI?: {
    apiKey: string;
    hostname?: string;
    apiPath?: string;
    port?: number;
    notHttps?: boolean;
    model?: string;
    maxTokens?: number;
    proxyUrl?: string;
    /**
     * @description 使用当前配置
     * @type {boolean}
     */
    use: boolean;
  }[];
};

export const getShareData = () => {
  if (fs.existsSync(dataFile)) {
    const data = fs.readJSONSync(dataFile) as ShareData;
    if (data.activeWindow) {
      data.activeWindow =
        process.platform === 'win32' && data.activeWindow.startsWith('/')
          ? data.activeWindow.substring(1)
          : data.activeWindow;
    }
    return data;
  }
  return {} as ShareData;
};

export const saveShareData = (data: ShareData) => {
  fs.writeJSONSync(dataFile, { ...getShareData(), ...data }, { spaces: 2 });
};

export const oneAPIConfig = () => {
  const { oneAPI } = getShareData();
  if (oneAPI && oneAPI.length > 0) {
    return oneAPI.find((s) => s.use) || oneAPI[0];
  }
  return undefined;
};
